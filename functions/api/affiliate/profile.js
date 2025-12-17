export default async function (context) {
  const { env, request } = context;

  try {
    // 1. Check if the database is actually connected
    if (!env.DB) {
      return new Response(JSON.stringify({
        error: "D1 Binding Missing",
        details: "The 'DB' binding is not configured in Cloudflare Settings."
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const email = url.searchParams.get("email") || "roblq123@gmail.com";

    if (request.method === 'GET') {
      // 2. Simple query to test the connection
      const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?")
        .bind(email)
        .first();

      if (!user) {
        return new Response(JSON.stringify({ error: "User not found in database" }), { status: 404 });
      }

      return new Response(JSON.stringify(user), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    // 3. Catch ANY crash and return it as JSON so the dashboard can read it
    return new Response(JSON.stringify({
      error: "Server Crash",
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}