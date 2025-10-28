export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const affiliateId = url.searchParams.get('affiliate_id');

    if (affiliateId) {
      const row = await env.DB.prepare(`
        SELECT
          (SELECT COUNT(*) FROM referrals r WHERE r.affiliate_id = ?) AS totalReferrals,
          COALESCE((SELECT SUM(commission) FROM referrals r WHERE r.affiliate_id = ? AND r.status = 'paid'), 0.0) AS totalEarnings,
          COALESCE(p.plan_name, '') AS currentPlan,
          0.0 AS compoundedRewards
        FROM users u
        LEFT JOIN subscriptions s ON s.user_id = u.id
        LEFT JOIN plans p ON p.plan_name = s.plan_name
        WHERE u.id = ?
        LIMIT 1;
      `).bind(affiliateId, affiliateId, affiliateId).first();

      return new Response(JSON.stringify(row || {
        totalReferrals: 0,
        totalEarnings: 0,
        currentPlan: '',
        compoundedRewards: 0
      }), { headers: { "Content-Type": "application/json" } });
    }

    // fallback: read aggregate from affiliate_metrics / subscriptions
    const row = await env.DB.prepare(`
      SELECT am.customers_referred AS totalReferrals,
             am.total_earnings AS totalEarnings,
             COALESCE(p.plan_name, '') AS currentPlan,
             0.0 AS compoundedRewards
      FROM affiliate_metrics am
      LEFT JOIN users u ON u.id = am.affiliate_id
      LEFT JOIN subscriptions s ON s.user_id = u.id
      LEFT JOIN plans p ON p.plan_name = s.plan_name
      LIMIT 1;
    `).first();

    return new Response(JSON.stringify(row || {
      totalReferrals: 0,
      totalEarnings: 0,
      currentPlan: '',
      compoundedRewards: 0
    }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}