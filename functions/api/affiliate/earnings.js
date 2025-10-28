export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const affiliateId = url.searchParams.get('affiliate_id');

    if (affiliateId) {
      // Total paid commissions for this affiliate + list of paid referral payouts
      const totalRow = await env.DB.prepare(`
        SELECT COALESCE(SUM(commission), 0.0) AS totalEarnings
        FROM referrals
        WHERE affiliate_id = ? AND status = 'paid';
      `).bind(affiliateId).first();

      const listRes = await env.DB.prepare(`
        SELECT
          r.id,
          r.created_at AS date,
          COALESCE(u.name, r.referred_email) AS referred_user,
          r.plan_name AS plan_chosen,
          r.commission AS amount,
          'referral_commission' AS type,
          r.status
        FROM referrals r
        LEFT JOIN users u ON u.id = r.referred_user_id
        WHERE r.affiliate_id = ? AND r.status = 'paid'
        ORDER BY r.created_at DESC
        LIMIT 500;
      `).bind(affiliateId).all();

      const rows = listRes && listRes.results ? listRes.results : listRes;
      return new Response(JSON.stringify({
        totalEarnings: totalRow ? totalRow.totalEarnings : 0.0,
        rows: rows || []
      }), { headers: { "Content-Type": "application/json" } });
    }

    // No affiliate_id: return recent paid referral commissions across affiliates
    const res = await env.DB.prepare(`
      SELECT
        r.id,
        r.affiliate_id,
        af.name AS affiliate_name,
        r.created_at AS date,
        COALESCE(u.name, r.referred_email) AS referred_user,
        r.plan_name AS plan_chosen,
        r.commission AS amount,
        'referral_commission' AS type,
        r.status
      FROM referrals r
      LEFT JOIN users u ON u.id = r.referred_user_id
      LEFT JOIN users af ON af.id = r.affiliate_id
      WHERE r.status = 'paid'
      ORDER BY r.created_at DESC
      LIMIT 500;
    `).all();

    const rows = res && res.results ? res.results : res;
    return new Response(JSON.stringify(rows || []), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}