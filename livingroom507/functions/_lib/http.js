export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-store');

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function error(message, status = 400, details) {
  const payload = { error: message };
  if (details) {
    payload.details = details;
  }

  return json(payload, { status });
}

export function requireDb(env) {
  if (!env?.DB) {
    throw new Error('D1 binding "DB" is not configured.');
  }
}
