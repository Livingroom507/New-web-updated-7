export async function onRequestGet({ env }) {
  try {
    const res = await env.DB.prepare("SELECT * FROM plans").all();
    const rows = res && res.results ? res.results : res;
    return new Response(JSON.stringify(rows || []), { headers: { "Content-Type": "application/json" }});
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}