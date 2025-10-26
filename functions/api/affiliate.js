export async function onRequestGet({ env }) {
  try {
    const affiliate = await env.DB.prepare(
      "SELECT customers_referred, total_earnings FROM affiliate_metrics LIMIT 1;"
    ).first();
    return new Response(JSON.stringify(affiliate || {}), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}