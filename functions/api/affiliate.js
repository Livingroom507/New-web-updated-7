export async function onRequestGet({ env }) {
  const affiliate = await env.DB.prepare(
    "SELECT customers_referred, total_earnings FROM affiliate_metrics LIMIT 1;"
  ).first();
  return new Response(JSON.stringify(affiliate || {}), { headers: { "Content-Type": "application/json" } });
}