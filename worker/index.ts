/**
 * The site's one piece of server code: POST /api/subscribe keeps an email
 * address for updates. Pages never reach it; `run_worker_first` in
 * wrangler.jsonc sends only /api/* here.
 *
 * Without JavaScript the form posts here and is redirected to /subscribed or
 * /subscribe-failed; the site's own script asks for JSON instead and shows the
 * result in place.
 */

type Result = 'ok' | 'invalid' | 'limited' | 'error';

const STATUS: Record<Result, number> = { ok: 200, invalid: 400, limited: 429, error: 500 };

// Deliberately loose: the browser's own check runs first, and the only aim
// here is to turn away input that cannot be an address.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A real form body is a few hundred bytes.
const MAX_BODY = 2048;

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/api/subscribe') {
      return new Response('Not found', { status: 404, headers: baseHeaders() });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: { ...baseHeaders(), Allow: 'POST' } });
    }

    const wantsJson = (request.headers.get('Accept') ?? '').includes('application/json');
    const reply = (result: Result) => respond(result, wantsJson, url);

    // Browsers always send Origin with a POST, so anything else is not this
    // site's form.
    if (request.headers.get('Origin') !== url.origin) {
      return new Response('Forbidden', { status: 403, headers: baseHeaders() });
    }

    const length = Number(request.headers.get('Content-Length') ?? 'NaN');
    if (!Number.isFinite(length) || length > MAX_BODY) return reply('invalid');

    const { success } = await env.SIGNUP_LIMIT.limit({ key: request.headers.get('CF-Connecting-IP') ?? 'unknown' });
    if (!success) return reply('limited');

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return reply('invalid');
    }

    // The hidden field is filled only by bots: tell them it worked and keep nothing.
    if (String(form.get('website') ?? '') !== '') return reply('ok');

    const email = String(form.get('email') ?? '')
      .trim()
      .toLowerCase();
    if (email.length > 254 || !EMAIL.test(email)) return reply('invalid');

    try {
      const { meta } = await env.DB.prepare(
        'INSERT INTO signups (email, created_at) VALUES (?1, ?2) ON CONFLICT (email) DO NOTHING',
      )
        .bind(email, new Date().toISOString())
        .run();
      // Never log the address itself.
      console.log(JSON.stringify({ event: 'signup', added: meta.changes > 0 }));
    } catch (error) {
      console.error(JSON.stringify({ event: 'signup_failed', error: String(error) }));
      return reply('error');
    }

    // A repeat sign-up looks the same as a new one, so the form never reveals
    // whether an address is already on the list.
    return reply('ok');
  },
} satisfies ExportedHandler<Env>;

function respond(result: Result, wantsJson: boolean, url: URL): Response {
  if (wantsJson) {
    return Response.json({ result }, { status: STATUS[result], headers: baseHeaders() });
  }
  const to = result === 'ok' ? '/subscribed' : '/subscribe-failed';
  return new Response(null, { status: 303, headers: { ...baseHeaders(), Location: new URL(to, url).href } });
}

function baseHeaders(): Record<string, string> {
  return { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
}
