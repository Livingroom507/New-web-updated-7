import { ensureAffiliateUser } from '../../_lib/affiliate.js';
import { bytesToBase64 } from '../../_lib/base64.js';
import { error, json, requireDb } from '../../_lib/http.js';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost({ request, env }) {
  try {
    requireDb(env);

    const formData = await request.formData();
    const email = formData.get('email');
    const image = formData.get('image');

    if (!isValidEmail(email)) {
      return error('A valid email is required.');
    }

    if (!(image instanceof File)) {
      return error('An image file is required.');
    }

    if (!image.type.startsWith('image/')) {
      return error('Only image uploads are allowed.');
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return error('Image exceeds the 2MB upload limit.');
    }

    await ensureAffiliateUser(env, { email });

    const bytes = new Uint8Array(await image.arrayBuffer());
    const imageUrl = `data:${image.type};base64,${bytesToBase64(bytes)}`;

    await env.DB.prepare(
      `UPDATE users
       SET profile_picture_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE email = ?`
    ).bind(imageUrl, email).run();

    return json({ imageUrl });
  } catch (caughtError) {
    return error('Failed to upload affiliate avatar.', 500, caughtError.message);
  }
}
