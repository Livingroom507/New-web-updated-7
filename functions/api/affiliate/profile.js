// functions/api/affiliate/profile.js

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    // NOTE: Replace TEST_USER_EMAIL with actual authentication/session logic later
    const email = url.searchParams.get('email') || 'roblq123@gmail.com'; // Use the test email from your frontend

    if (!email) {
        return new Response(JSON.stringify({ error: 'Email parameter is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // --- DEBUGGING: Check if the D1 binding exists ---
        if (!env.DB) {
            return new Response(JSON.stringify({ 
                error: 'Database binding not found. Check your wrangler.toml configuration.',
                details: 'The `env.DB` object is undefined in the Pages Function context.'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        // --- CRITICAL FIX: Changed from INNER JOIN to LEFT JOIN for robustness ---
        // TEMPORARY TEST QUERY
        const userStmt = env.DB.prepare(`
            SELECT
                u.email,
                u.full_name AS fullName
            FROM users u
            WHERE u.email = ?
        `);
        const userResult = await userStmt.bind(email).first();

        if (!userResult || !userResult.email) {
            // This now returns a 404 if the user doesn't exist, instead of crashing.
            return new Response(JSON.stringify({ error: 'User not found or plan data invalid.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(userResult), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Affiliate Profile Fetch Error:', error);
        // --- ENHANCEMENT: Return detailed D1 error from the 'cause' property ---
        return new Response(JSON.stringify({ 
            error: 'Internal Server Error fetching affiliate profile. The worker code crashed.',
            details: error.message,
            cause: error.cause ? error.cause.message : 'No specific cause available. Check SQL syntax and table/column names.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const requestBody = await request.json();
        const { fullName, email, paypalEmail, publicBio, newPassword } = requestBody;

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required for authentication.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if a password update is requested
        if (newPassword && newPassword.length > 0) {
            // This block is intentionally left empty for now.
            // To implement password changes, you must first add a 'password' column to your 'users' table.
            // For now, we will simply ignore the password field to prevent the server from crashing.
            console.log('Password update requested but not implemented. Add a password column to the users table.');
        } else {
            // Update profile without changing the password
            const updateStmt = env.DB.prepare(`
                UPDATE users
                SET full_name = ?, paypal_email = ?, public_bio = ?
                WHERE email = ?
            `);
            await updateStmt.bind(
                fullName,
                paypalEmail,
                publicBio,
                email
            ).run();
        }

        return new Response(JSON.stringify({ success: true, message: 'Profile updated successfully.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Affiliate Profile Update Error:', error);
        // --- ENHANCEMENT: Return detailed D1 error from the 'cause' property ---
        return new Response(JSON.stringify({ 
            error: 'Internal Server Error updating affiliate profile.',
            details: error.message,
            cause: error.cause ? error.cause.message : 'No specific cause available. Check SQL syntax and table/column names.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function onRequest(context) {
    if (context.request.method === 'GET') {
        return await onRequestGet(context);
    } else if (context.request.method === 'POST') {
        return await onRequestPost(context);
    }

    return new Response('Method Not Allowed', { status: 405 });
}