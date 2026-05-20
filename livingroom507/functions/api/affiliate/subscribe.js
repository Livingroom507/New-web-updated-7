import { ensureAffiliateMetrics, ensureAffiliateUser, loadAffiliateProfile } from '../../_lib/affiliate.js';
import { error, json, requireDb } from '../../_lib/http.js';
import { getPlanByName } from '../../_lib/plans.js';

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost({ request, env }) {
  try {
    requireDb(env);

    const body = await request.json();
    const userEmail = typeof body.userEmail === 'string' ? body.userEmail.trim().toLowerCase() : '';
    const plan = getPlanByName(body.planName);

    if (!isValidEmail(userEmail)) {
      return error('A valid userEmail is required.');
    }

    if (!plan) {
      return error('Unknown subscription plan.');
    }

    const user = await ensureAffiliateUser(env, { email: userEmail });
    await ensureAffiliateMetrics(env, user.id);

    await env.DB.prepare(
      `UPDATE subscriptions
       SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND status = 'active'`
    ).bind(user.id).run();

    await env.DB.prepare(
      `INSERT INTO subscriptions (user_id, plan_name, monthly_fee, purchase_unit, purchase_earning, status)
       VALUES (?, ?, ?, ?, ?, 'active')`
    ).bind(
      user.id,
      plan.name,
      plan.monthlyCost,
      plan.purchaseUnit,
      plan.purchaseEarning
    ).run();

    const profile = await loadAffiliateProfile(env, userEmail);

    return json({
      message: `Subscription activated for ${plan.name}.`,
      profile,
    }, { status: 201 });
  } catch (caughtError) {
    return error('Failed to activate affiliate subscription.', 500, caughtError.message);
  }
}
