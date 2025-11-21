// /functions/api/admin/test-db.js

export async function onRequestPost({ request, env }) {
    try {
        const query = `SELECT name FROM sqlite_master WHERE type='table'`;
        const { results } = await env.DB.prepare(query).all();
        return new Response(JSON.stringify(results), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error("D1 Query Error:", e);
        return new Response(JSON.stringify({ error: "Database failure.", detail: e.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}
