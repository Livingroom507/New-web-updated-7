import { loadAffiliateProfile, ensureAffiliateUser, findUserByEmail } from '../../_lib/affiliate.js';
import { hashPassword } from '../../_lib/crypto.js';
import { error, json, requireDb } from '../../_lib/http.js';

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestGet({ request, env }) {
  try {
    requireDb(env);

    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!isValidEmail(email)) {
      return error('A valid email query parameter is required.');
    }

    const profile = await loadAffiliateProfile(env, email);
    if (!profile) {
      return error('Affiliate profile not found.', 404);
    }

    return json(profile);
  } catch (caughtError) {
    return error('Failed to load affiliate profile.', 500, caughtError.message);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    requireDb(env);

    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const paypalEmail = typeof body.paypalEmail === 'string' ? body.paypalEmail.trim().toLowerCase() : '';
    const publicBio = typeof body.publicBio === 'string' ? body.publicBio.trim() : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword.trim() : '';

    if (!isValidEmail(email)) {
      return error('A valid email is required.');
    }

    if (paypalEmail && !isValidEmail(paypalEmail)) {
      return error('PayPal email must be a valid email address.');
    }

    if (publicBio.length > 500) {
      return error('Public bio must be 500 characters or fewer.');
    }

    if (newPassword && newPassword.length < 8) {
      return error('New password must be at least 8 characters long.');
    }

    const existingUser = await findUserByEmail(env, email);
    if (!existingUser) {
      await ensureAffiliateUser(env, { email, fullName });
    }

    const resolvedName = fullName || existingUser?.name || email.split('@')[0];
    const resolvedPaypalEmail = paypalEmail || email;

    if (newPassword) {
      const password = await hashPassword(newPassword);
      await env.DB.prepare(
        `UPDATE users
         SET name = ?, paypal_email = ?, public_bio = ?, password_hash = ?, password_salt = ?, updated_at = CURRENT_TIMESTAMP
         WHERE email = ?`
      ).bind(
        resolvedName,
        resolvedPaypalEmail,
        publicBio,
        password.hash,
        password.salt,
        email
      ).run();
    } else {
      await env.DB.prepare(
        `UPDATE users
         SET name = ?, paypal_email = ?, public_bio = ?, updated_at = CURRENT_TIMESTAMP
         WHERE email = ?`
      ).bind(
        resolvedName,
        resolvedPaypalEmail,
        publicBio,
        email
      ).run();
    }

    const updatedProfile = await loadAffiliateProfile(env, email);
    return json(updatedProfile);
  } catch (caughtError) {
    return error('Failed to update affiliate profile.', 500, caughtError.message);
  }
}
