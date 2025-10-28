export async function onRequestGet({ env }) {
  try {
    const plan = await env.DB.prepare(`
      SELECT p.*
      FROM plans p
      JOIN subscriptions s ON p.plan_name = s.plan_name
      JOIN users u ON s.user_id = u.id
      WHERE u.role = 'affiliate'
      LIMIT 1;
    `).first();

    return new Response(JSON.stringify(plan || {}), { headers: { "Content-Type": "application/json" }});
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}