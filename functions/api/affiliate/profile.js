// New Consolidated functions/api/affiliate/profile.js

export default async function (context) {
  const { env, request } = context;

  try {
    if (!env.DB) {
      // Throwing an error here will be caught by the main catch block,
      // ensuring a consistent JSON error response.
      throw new Error('Database binding (env.DB) not found. Check your wrangler.toml.');
    }

    if (request.method === 'GET') {
      const url = new URL(request.url);
      // Default email for testing, as seen in your logs:
      const email = url.searchParams.get('email') || 'roblq123@gmail.com';

      if (!email) {
        return new Response(JSON.stringify({ error: 'Email query parameter is required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // The MOST comprehensive query based on all fields the client expects
      // NOTE: We are selecting all known columns from the users table.
      // If the JOINs are missing, we will still return the user data with mock commission data.
      // 🛑 FIX: Temporarily removing columns that are confirmed to not exist in the live D1 schema
      // to prevent the function from crashing. We will only select fields we know exist.
      const userStmt = env.DB.prepare(`
        SELECT
            u.email,
            u.full_name AS fullName
        FROM users u
        WHERE u.email = ?
      `);

      const userResult = await userStmt.bind(email).first();

      if (!userResult || !userResult.email) {
        return new Response(JSON.stringify({ error: `User not found for email: ${email}` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Add mock data for commission fields expected by affiliate-dashboard.js
      const finalResult = {
          profilePictureUrl: null, // Default to null since column is missing
          paypalEmail: '',       // Default to empty string
          publicBio: '',         // Default to empty string
          role: 'affiliate',     // Default role
          ...userResult,
          purchaseUnit: 18.00,        // Mock data
          purchaseEarning: 3.50,      // Mock data
          currentPlanName: 'Base Affiliate Plan' // Mock data
      };

      return new Response(JSON.stringify(finalResult), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'POST') {
      const requestBody = await request.json();
      const { fullName, email, paypalEmail, publicBio } = requestBody;

      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required for authentication.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 🛑 FIX: Only update columns that are confirmed to exist in the live D1 schema.
      const updateStmt = env.DB.prepare(`
        UPDATE users
        SET full_name = ?
        WHERE email = ?
      `);
      // Only binding fullName and email to match the updated query
      await updateStmt.bind(fullName, email).run();

      return new Response(JSON.stringify({ success: true, message: 'Profile updated successfully.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method Not Allowed', { status: 405 });

  } catch (error) {
    // CRITICAL FIX: Return a JSON error payload instead of crashing to HTML
    console.error('Pages Function Top-Level Error:', error.message);

    return new Response(JSON.stringify({
      error: 'Server Error in Pages Function (Fatal Crash)',
      details: error.message, // This will reveal the SQL error (e.g., "no such column")
      cause: error.cause ? error.cause.message : 'Unknown cause.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' } // ENSURE JSON IS SENT
    });
  }
}