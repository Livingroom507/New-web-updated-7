// New Consolidated functions/api/affiliate/profile.js

export default async function (context) {
  const { env, request } = context;

  try {
    // --- DEBUGGING: Check if the D1 binding exists ---
    if (!env.DB) {
      return new Response(JSON.stringify({
        error: 'Database binding not found. Check your wrangler.toml configuration.',
        details: 'The env.DB object is undefined in the Pages Function context.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const email = url.searchParams.get('email') || 'roblq123@gmail.com';
      console.log(`[profile.js] GET request received. Attempting to find profile for email: ${email}`);

      if (!email) {
        console.error('[profile.js] Error: Email query parameter was not provided.');
        return new Response(JSON.stringify({ error: 'Email query parameter is required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // ISOLATION TEST: Simplified query to check if JOINs are the cause of the crash.
      const userStmt = env.DB.prepare(`
        SELECT
            id,
            u.email,
            u.full_name AS fullName,
            u.profile_picture_url AS profilePictureUrl,
            u.paypal_email AS paypalEmail,
            u.public_bio AS publicBio,
            u.role
        FROM users u
        WHERE u.email = ?
      `);

      console.log(`[profile.js] Executing D1 query for email: ${email}`);
      const userResult = await userStmt.bind(email).first();

      if (!userResult || !userResult.email) {
        console.warn(`[profile.js] D1 query executed, but no user found for email: ${email}`);
        return new Response(JSON.stringify({ error: 'User not found or plan data invalid.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.log(`[profile.js] Successfully found user profile for: ${email}`);
      // NOTE: We MUST still provide the plan data, even if it's mock data,
      // so the frontend doesn't crash trying to access it.
      const finalResult = {
          ...userResult,
          currentPlanName: userResult.role === 'affiliate' ? 'Default Affiliate Plan' : 'Customer Plan',
          purchaseUnit: 18.00,
          purchaseEarning: 3.50,
      };
      return new Response(JSON.stringify(finalResult), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'POST') {
      // --- POST Logic (Simplified to prevent crashes) ---
      const requestBody = await request.json();
      const { fullName, email, paypalEmail, publicBio } = requestBody;

      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required for authentication.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const updateStmt = env.DB.prepare(`
        UPDATE users
        SET full_name = ?, paypal_email = ?, public_bio = ?
        WHERE email = ?
      `);
      await updateStmt.bind(fullName, paypalEmail, publicBio, email).run();

      return new Response(JSON.stringify({ success: true, message: 'Profile updated successfully.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method Not Allowed', { status: 405 });

  } catch (error) {
    // This is the global catch block. ANY error inside the function will be caught here.
    console.error('A top-level error occurred:', error);
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred in the Pages Function.',
      details: error.message,
      cause: error.cause ? error.cause.message : 'No specific cause available.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}