// New Consolidated functions/api/affiliate/profile.js

export default async function (context) {
    const { env, request } = context;
    
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
        try {
            const url = new URL(request.url);
            // NOTE: Replace TEST_USER_EMAIL with actual authentication/session logic later
            const email = url.searchParams.get('email') || 'roblq123@gmail.com'; 

            if (!email) {
                return new Response(JSON.stringify({ error: 'Email parameter is required.' }), {
                    status: 400, headers: { 'Content-Type': 'application/json' },
                });
            }

            // TEMPORARY TEST QUERY (Simplified)
            const userStmt = env.DB.prepare(`
                SELECT
                    u.email,
                    u.full_name AS fullName
                FROM users u
                WHERE u.email = ?
            `);
            const userResult = await userStmt.bind(email).first();

            if (!userResult || !userResult.email) {
                return new Response(JSON.stringify({ error: 'User not found or plan data invalid.' }), {
                    status: 404, headers: { 'Content-Type': 'application/json' },
                });
            }

            return new Response(JSON.stringify(userResult), {
                status: 200, headers: { 'Content-Type': 'application/json' },
            });

        } catch (error) {
            console.error('Affiliate Profile Fetch Error:', error);
            return new Response(JSON.stringify({ 
                error: 'Internal Server Error fetching affiliate profile (RUNTIME CRASH).',
                details: error.message,
                cause: error.cause ? error.cause.message : 'No specific cause available.'
            }), {
                status: 500, headers: { 'Content-Type': 'application/json' },
            });
        }
    } 
    
    if (request.method === 'POST') {
        // --- POST Logic (Simplified to prevent crashes) ---
        try {
            const requestBody = await request.json();
            const { fullName, email, paypalEmail, publicBio } = requestBody;

            if (!email) {
                return new Response(JSON.stringify({ error: 'Email is required for authentication.' }), {
                    status: 400, headers: { 'Content-Type': 'application/json' },
                });
            }

            const updateStmt = env.DB.prepare(`
                UPDATE users
                SET full_name = ?, paypal_email = ?, public_bio = ?
                WHERE email = ?
            `);
            await updateStmt.bind(fullName, paypalEmail, publicBio, email).run();

            return new Response(JSON.stringify({ success: true, message: 'Profile updated successfully.' }), {
                status: 200, headers: { 'Content-Type': 'application/json' },
            });

        } catch (error) {
            console.error('Affiliate Profile Update Error:', error);
            return new Response(JSON.stringify({
                error: 'Internal Server Error updating affiliate profile (RUNTIME CRASH).',
                details: error.message,
                cause: error.cause ? error.cause.message : 'No specific cause available.'
            }), {
                status: 500, headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    return new Response('Method Not Allowed', { status: 405 });
}