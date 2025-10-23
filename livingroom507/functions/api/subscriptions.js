export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT plan_name, monthly_fee, compounding_rate, start_date FROM subscriptions;"
  ).all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
}