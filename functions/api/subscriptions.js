export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT plan_name, monthly_fee, compounding_rate, start_date FROM subscriptions;"
    ).all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}