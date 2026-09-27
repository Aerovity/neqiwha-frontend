// Production server: serves the built SPA and forwards /api/* to the backend service over
// Railway's private network, so the browser sees a single origin (cookies stay first-party).
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { proxy } from 'hono/proxy';

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:8787').replace(/\/$/, '');
const PORT = Number(process.env.PORT) || 8080;

const app = new Hono();

app.all('/api/*', c => {
  const url = new URL(c.req.url);
  const forwardedFor = c.req.header('x-forwarded-for');
  return proxy(`${BACKEND_URL}${url.pathname}${url.search}`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      host: undefined,
      'x-forwarded-for': forwardedFor,
      'x-forwarded-host': c.req.header('host'),
      'x-forwarded-proto': 'https',
    },
  }).catch(err => {
    console.error('proxy error', err);
    return c.json({ error: { code: 'backend_unavailable', message: 'The server is waking up. Try again.' } }, 502);
  });
});

app.use('/assets/*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
});
app.use('*', serveStatic({ root: './dist' }));
app.get('*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'no-cache');
}, serveStatic({ path: './dist/index.html' }));

serve({ fetch: app.fetch, port: PORT, hostname: '::' }, info =>
  console.log(`Naqiwha web listening on :${info.port}, proxying /api to ${BACKEND_URL}`));
