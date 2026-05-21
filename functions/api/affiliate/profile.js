function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function loadProfile(env, email) {
  const stmt = env.DB.prepare(`
    SELECT
      u.email,
      u.full_name AS fullName,
      u.profile_picture_url AS profilePictureUrl,
      COALESCE(u.paypal_email, u.email) AS paypalEmail,
      COALESCE(u.public_bio, '') AS publicBio,
      p.plan_name AS currentPlanName,
      p.purchase_unit AS purchaseUnit,
      p.purchase_earning AS purchaseEarning
    FROM users u
    LEFT JOIN subscriptions s ON u.id = s.user_id
    LEFT JOIN plans p ON s.plan_name = p.plan_name
    WHERE u.email = ?
  `);

  return stmt.bind(email).first();
}

export async function onRequestGet({ request, env }) {
  try {
    if (!env.DB) {
      return json({
        error: 'D1 Binding Missing',
        details: "The 'DB' binding is not configured in Cloudflare Settings.",
      }, { status: 500 });
    }

    const url = new URL(request.url);
    const email = (url.searchParams.get('email') || '').trim().toLowerCase();

    if (!isValidEmail(email)) {
      return json({ error: 'A valid email query parameter is required.' }, { status: 400 });
    }

    const profile = await loadProfile(env, email);

    if (!profile) {
      return json({ error: 'User not found in database' }, { status: 404 });
    }

    return json(profile);
  } catch (error) {
    return json({
      error: 'Server Crash',
      details: error.message,
    }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return json({
        error: 'D1 Binding Missing',
        details: "The 'DB' binding is not configured in Cloudflare Settings.",
      }, { status: 500 });
    }

    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const paypalEmail = typeof body.paypalEmail === 'string' ? body.paypalEmail.trim().toLowerCase() : '';
    const publicBio = typeof body.publicBio === 'string' ? body.publicBio.trim() : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword.trim() : '';

    if (!isValidEmail(email)) {
      return json({ error: 'A valid email is required.' }, { status: 400 });
    }

    if (paypalEmail && !isValidEmail(paypalEmail)) {
      return json({ error: 'PayPal email must be a valid email address.' }, { status: 400 });
    }

    if (publicBio.length > 500) {
      return json({ error: 'Public bio must be 500 characters or fewer.' }, { status: 400 });
    }

    if (newPassword) {
      return json({ error: 'Password updates are not supported by this deployment yet.' }, { status: 400 });
    }

    const existingUser = await env.DB.prepare(`
      SELECT id
      FROM users
      WHERE email = ?
    `).bind(email).first();

    if (!existingUser) {
      return json({ error: 'User not found.' }, { status: 404 });
    }

    await env.DB.prepare(`
      UPDATE users
      SET full_name = ?, paypal_email = ?, public_bio = ?
      WHERE email = ?
    `).bind(
      fullName || email.split('@')[0],
      paypalEmail || email,
      publicBio,
      email
    ).run();

    const updatedProfile = await loadProfile(env, email);
    return json(updatedProfile);
  } catch (error) {
    return json({
      error: 'Server Crash',
      details: error.message,
    }, { status: 500 });
  }
}
