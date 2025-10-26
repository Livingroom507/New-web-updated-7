export async function onRequestGet({ env }) {
  try {
    // Aggregate monthly compounding rewards for all active subscribers
    const users = await env.DB.prepare(
      "SELECT monthly_fee, compounding_rate, start_date FROM subscriptions;"
    ).all();

    let totalCompounded = 0;
    const now = Date.now();
    for (const u of users.results) {
      const months = (now - new Date(u.start_date)) / (1000 * 60 * 60 * 24 * 30);
      totalCompounded += u.monthly_fee * Math.pow(1 + u.compounding_rate / 100, months);
    }

    return new Response(JSON.stringify({ compounded: totalCompounded }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}