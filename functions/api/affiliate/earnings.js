export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const affiliateId = url.searchParams.get('affiliate_id');

    if (!affiliateId) {
      return new Response(JSON.stringify({ error: 'affiliate_id is required' }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get all users referred by this affiliate
    const referralsResult = await env.DB.prepare('SELECT referred_user_id FROM referrals WHERE affiliate_id = ? AND referred_user_id IS NOT NULL').bind(affiliateId).all();

    const referredUserIds = referralsResult.results.map(row => row.referred_user_id);

    if (referredUserIds.length === 0) {
        return new Response(JSON.stringify({ totalEarnings: 0, earningsBreakdown: [] }), { headers: { "Content-Type": "application/json" } });
    }

    // For each referred user, get their subscription and total transaction amount
    const userPromises = referredUserIds.map(async (userId) => {
      const subscription = await env.DB.prepare('SELECT plan_name FROM subscriptions WHERE user_id = ?').bind(userId).first();
      const transactions = await env.DB.prepare('SELECT SUM(amount) as total_spent FROM transactions WHERE user_id = ?').bind(userId).first();
      return { userId, plan_name: subscription?.plan_name, total_spent: transactions?.total_spent || 0 };
    });

    const usersData = await Promise.all(userPromises);

    // Get all plans data
    const plansResult = await env.DB.prepare('SELECT * FROM plans').all();
    const plans = plansResult.results.reduce((acc, plan) => {
      acc[plan.plan_name] = plan;
      return acc;
    }, {});

    let totalEarnings = 0;
    const earningsBreakdown = [];

    for (const userData of usersData) {
      if (!userData.plan_name || !plans[userData.plan_name]) {
        continue; // Skip if user has no plan or plan details are not found
      }

      const plan = plans[userData.plan_name];
      let subscriptionCommission = 0;
      let purchaseCommission = 0;

      // 1. Calculate Subscription Commission (assuming 20%)
      if (plan.subscription_cost) {
        subscriptionCommission = plan.subscription_cost * 0.20;
      }

      // 2. Calculate Purchase Commission
      if (plan.purchase_unit > 0 && userData.total_spent > 0) {
        purchaseCommission = (userData.total_spent / plan.purchase_unit) * plan.purchase_earning;
      }

      const userTotalCommission = subscriptionCommission + purchaseCommission;
      totalEarnings += userTotalCommission;

      earningsBreakdown.push({
        referred_user_id: userData.userId,
        plan: userData.plan_name,
        subscription_commission: subscriptionCommission.toFixed(2),
        purchase_commission: purchaseCommission.toFixed(2),
        total_commission: userTotalCommission.toFixed(2)
      });
    }

    return new Response(JSON.stringify({ totalEarnings: totalEarnings.toFixed(2), earningsBreakdown }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}