import { verifyToken } from "@clerk/backend";
import { Hono } from "hono";
import { cors } from "hono/cors";

interface Env {
  DB: D1Database;
  ASSETS: Fetcher; // ASSETSバインディングを追加
  CLERK_SECRET_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use(
  "/*",
  cors({
    origin: (origin) => {
      const allowedOrigins = [
        "https://nono.watahaizian.com", // カスタムドメイン
        "http://localhost:5173",
        "http://localhost:5174",
      ];

      // Cloudflare Pagesのプレビューデプロイも許可する（Pagesを使わないが念のため残す）
      if (origin && origin.endsWith(".pages.dev")) {
        return origin;
      }

      if (origin && allowedOrigins.includes(origin)) {
        return origin;
      }

      // デフォルトはカスタムドメインを返す
      return "https://nono.watahaizian.com";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.post("/puzzles", async (c) => {
  const authHeader = c.req.header("Authorization")?.replace("Bearer ", "");

  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    await verifyToken(authHeader, { secretKey: c.env.CLERK_SECRET_KEY });
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { name, size, cells } = await c.req.json();
    const {
      meta: { last_row_id },
    } = await c.env.DB.prepare(
      'INSERT INTO puzzles (puzzle_name, puzzle_size, created_at, updated_at) VALUES (?, ?, datetime("now"), datetime("now"))',
    )
      .bind(name, size)
      .run();

    const cellQueries = cells.map(
      ({
        row_index,
        col_index,
        cell_value,
        color,
      }: {
        row_index: number;
        col_index: number;
        cell_value: number;
        color: string;
      }) => {
        return c.env.DB.prepare(
          "INSERT INTO cells (puzzle_id, row_index, col_index, cell_value, color) VALUES (?, ?, ?, ?, ?)",
        ).bind(last_row_id, row_index, col_index, cell_value, color);
      },
    );

    await c.env.DB.batch(cellQueries);
    return c.json({ message: `id: ${last_row_id} のパズルが作成されました` });
  } catch (e) {
    console.error(e);
    return c.json({ err: "エラー" }, 500);
  }
});

app.get("/puzzles", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM puzzles").all();
    return c.json(results);
  } catch {
    return c.json({ err: `エラー` }, 500);
  }
});

app.post("/puzzles/new-game", async (c) => {
  try {
    const result = await c.env.DB.prepare(
      "SELECT * FROM puzzles ORDER BY RANDOM() LIMIT 1",
    ).first();

    if (!result) {
      return c.json({ err: "No puzzles found" }, 404);
    }

    return c.json(result);
  } catch (e) {
    console.error(e);
    return c.json({ err: "エラー" }, 500);
  }
});

app.get("/puzzles/:id/cells", async (c) => {
  const { id } = c.req.param();

  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM cells WHERE puzzle_id = ?",
    )
      .bind(id)
      .all();
    return c.json(results);
  } catch {
    return c.json({ err: `エラー` }, 500);
  }
});

// 静的ファイル (dist/) へフォールバック
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
