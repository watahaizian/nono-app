import { googleAuth } from '@hono/oauth-providers/google';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import { v4 as uuidv4 } from 'uuid';

type Bindings = {
  DB: D1Database,
  GOOGLE_ID: string,
  GOOGLE_SECRET: string,
  FRONTEND_URL: string,
  COOKIE_DOMAIN: string,
  ENV: string,
};

const authRoute = new Hono<{ Bindings: Bindings }>().basePath('/auth');

authRoute.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'https://watahaizian.com'], // 許可するオリジン
    allowMethods: ['GET', 'POST', 'PUT'], // 許可するHTTPメソッド
    allowHeaders: ['Content-Type', 'Authorization'], // 許可するヘッダー
    credentials: true, // クレデンシャルを許可
  })
);

authRoute.get('/google', googleAuth({
  scope: ['openid', 'profile'],
}), async (c) => {
  const user = c.get('user-google')

  if (!user) { return c.json({ error: 'ユーザーが見つかりません' }, 401) }

  try { await c.env.DB.prepare('INSERT INTO users (user_id, user_name) VALUES (?, ?) ON CONFLICT(user_id) DO NOTHING').bind(user.id, user.name).run(); }
  catch (e) { console.log(e); return c.json({ err: 'エラー' }, 500); }

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const expiresAtStr = expiresAt.toISOString();

  try { await c.env.DB.prepare('INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)').bind(sessionId, user.id, expiresAtStr).run(); }
  catch (e) { return c.json({ err: 'エラー' }, 500); }

  const cookieOptions = {
    path: '/',
    expires: expiresAt,
    httpOnly: true,
    secure: true,
    ...(c.env.ENV === 'production'
      ? { domain: c.env.COOKIE_DOMAIN, sameSite: 'None' as const }
      : {})
  };

  setCookie(c, 'session_id', sessionId, cookieOptions);
  const frontendRedirectUrl = `${c.env.FRONTEND_URL}/auth/callback`;
  return c.redirect(frontendRedirectUrl);
})

authRoute.get('/user', async (c) => {
  const sessionId = getCookie(c, 'session_id');
  if (!sessionId) { return c.json({ message: 'no session_id', envType: c.env.ENV, envDomain: c.env.COOKIE_DOMAIN }); }
  const user = await c.env.DB.prepare('SELECT users.user_name FROM sessions JOIN users ON sessions.user_id = users.user_id WHERE sessions.session_id = ? AND sessions.expires_at > CURRENT_TIMESTAMP').bind(sessionId).first();

  if (!user) { deleteCookie(c, 'session_id');return c.json({ message: 'no user' }, 401); }
  // cookieの有効期限を更新
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const expiresAtStr = expiresAt.toISOString();
  await c.env.DB.prepare('UPDATE sessions SET expires_at = ? WHERE session_id = ?').bind(expiresAtStr, sessionId).run();
  const cookieOptions = {
    path: '/',
    expires: expiresAt,
    httpOnly: true,
    secure: true,
    ...(c.env.ENV === 'production'
      ? { domain: c.env.COOKIE_DOMAIN, sameSite: 'None' as const }
      : {})
  };
  setCookie(c, 'session_id', sessionId, cookieOptions);

  return c.json(user);
});

authRoute.get('/logout', async (c) => {
  const sessionId = getCookie(c, 'session_id');
  if (!sessionId) { return c.json({ error: 'エラー' }, 401); }
  await c.env.DB.prepare('DELETE FROM sessions WHERE session_id = ?').bind(sessionId).run();
  deleteCookie(c, 'session_id');
  return c.json({ message: 'logout' });
});

export default authRoute;