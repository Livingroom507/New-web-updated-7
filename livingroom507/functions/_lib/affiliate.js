function fallbackNameFromEmail(email) {
  return email.split('@')[0] || 'Affiliate User';
}

export async function findUserByEmail(env, email) {
  return env.DB.prepare(
    `SELECT id, name, email, role, paypal_email AS paypalEmail, public_bio AS publicBio,
            profile_picture_url AS profilePictureUrl
     FROM users
     WHERE email = ?`
  ).bind(email).first();
}

export async function ensureAffiliateUser(env, { email, fullName }) {
  const displayName = fullName?.trim() || fallbackNameFromEmail(email);

  await env.DB.prepare(
    `INSERT INTO users (name, email, role)
     VALUES (?, ?, 'affiliate')
     ON CONFLICT(email) DO UPDATE SET
       role = CASE WHEN users.role = 'admin' THEN users.role ELSE 'affiliate' END,
       updated_at = CURRENT_TIMESTAMP`
  ).bind(displayName, email).run();

  return findUserByEmail(env, email);
}

export async function ensureAffiliateMetrics(env, affiliateId) {
  await env.DB.prepare(
    `INSERT INTO affiliate_metrics (affiliate_id, customers_referred, total_earnings)
     VALUES (?, 0, 0)
     ON CONFLICT(affiliate_id) DO NOTHING`
  ).bind(affiliateId).run();
}

export async function loadAffiliateProfile(env, email) {
  return env.DB.prepare(
    `SELECT
        u.name AS fullName,
        u.email,
        COALESCE(u.paypal_email, u.email) AS paypalEmail,
        COALESCE(u.public_bio, '') AS publicBio,
        COALESCE(u.profile_picture_url, '') AS profilePictureUrl,
        COALESCE(s.plan_name, '') AS currentPlanName,
        COALESCE(s.purchase_unit, 0) AS purchaseUnit,
        COALESCE(s.purchase_earning, 0) AS purchaseEarning
     FROM users u
     LEFT JOIN subscriptions s
       ON s.id = (
         SELECT id
         FROM subscriptions
         WHERE user_id = u.id AND status = 'active'
         ORDER BY start_date DESC, id DESC
         LIMIT 1
       )
     WHERE u.email = ?`
  ).bind(email).first();
}
