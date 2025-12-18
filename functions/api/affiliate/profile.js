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
      // 2. Query to get user and plan details
      const stmt = env.DB.prepare(`
        SELECT
            u.email,
            u.full_name AS fullName,
            u.profile_picture_url AS profilePictureUrl,
            u.paypal_email AS paypalEmail,
            u.public_bio AS publicBio,
            p.plan_name AS currentPlanName,
            p.purchase_unit AS purchaseUnit,
            p.purchase_earning AS purchaseEarning
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id
        LEFT JOIN plans p ON s.plan_name = p.plan_name
        WHERE u.email = ?`); // 1. Prepare the statement
      const user = await stmt.bind(email).first(); // 2. Bind the variable and execute the query

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