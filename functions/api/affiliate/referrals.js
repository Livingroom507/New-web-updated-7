export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const affiliateId = url.searchParams.get('affiliate_id');

    let res;
    if (affiliateId) {
      res = await env.DB.prepare(`
        SELECT r.id,
               r.created_at AS date,
               COALESCE(u.name, r.referred_email) AS referred_user,
               r.plan_name AS plan_chosen,
               r.commission,
               r.status
        FROM referrals r
        LEFT JOIN users u ON u.id = r.referred_user_id
        WHERE r.affiliate_id = ?
        ORDER BY r.created_at DESC
        LIMIT 500;
      `).bind(affiliateId).all();
    } else {
      res = await env.DB.prepare(`
        SELECT r.id,
               r.created_at AS date,
               COALESCE(u.name, r.referred_email) AS referred_user,
               r.plan_name AS plan_chosen,
               r.commission,
               r.status
        FROM referrals r
        LEFT JOIN users u ON u.id = r.referred_user_id
        ORDER BY r.created_at DESC
        LIMIT 500;
      `).all();
    }

    const rows = res && res.results ? res.results : res;
    return new Response(JSON.stringify(rows || []), { headers: { "Content-Type": "application/json" }});
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}