import { clerkMiddleware, getAuth } from '@clerk/backend';
import { Hono } from 'hono';
import { cors } from 'hono/cors';


type Bindings = {
  DB: D1Database
  ASSETS: Fetcher
  CLERK_SECRET_KEY: string;
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors({
  origin: (origin) => {
    // 許可するオリジンをここに書くのよ
    if (
        origin === 'http://localhost:5173' ||
        origin.endsWith('.pages.dev') // あなたのCloudflare Pagesのドメインに合わせてね
    ) {
        return origin;
    }
    return 'http://localhost:5173';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'], // Authorizationヘッダーを許可！
  credentials: true,
}));

app.use('/api/*', clerkMiddleware());

app.post('/api/puzzles', async (c) => {
  const auth = getAuth(c);

  // 認証されていなかったら、401エラーを返す
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { name, size, cells } = await c.req.json();
    const { meta: { last_row_id } } = await c.env.DB.prepare(
      'INSERT INTO puzzles (puzzle_name, puzzle_size, created_at, updated_at) VALUES (?, ?, datetime("now"), datetime("now"))'
    ).bind(name, size).run();
    
    const cellQueries = cells.map(({ row_index, col_index, cell_value, color }: { row_index: number; col_index: number; cell_value: number; color: string; }) => {
      return c.env.DB.prepare('INSERT INTO cells (puzzle_id, row_index, col_index, cell_value, color) VALUES (?, ?, ?, ?, ?)').bind(last_row_id, row_index, col_index, cell_value, color);
    });
    
    await c.env.DB.batch(cellQueries);
    return c.json({ message: `id: ${last_row_id} のパズルが作成されました` });
  } catch (e) {
    console.error(e);
    return c.json({ err: 'エラー' }, 500);
  }
});

app.get('/puzzles', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM puzzles').all();
    return c.json(results);
  } catch { return c.json({ err: `エラー` }, 500); }
});

app.get('/puzzles/:id/cells', async (c) => {
  const { id } = c.req.param();

  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM cells WHERE puzzle_id = ?').bind(id).all();
    return c.json(results);
  } catch { return c.json({ err: `エラー` }, 500); }
});

// 静的ファイル (dist/) へフォールバック
app.all('*', (c) =>
  c.env.ASSETS
    ? c.env.ASSETS.fetch(c.req.raw)
    : new Response('Not found', { status: 404 })
);

export default app
