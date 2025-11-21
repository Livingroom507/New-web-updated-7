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
        // --- CRITICAL FIX: Changed from INNER JOIN to LEFT JOIN for robustness ---
        const userStmt = env.DB.prepare(`
            SELECT
                u.email,
                u.full_name AS fullName,
                u.plan_name AS currentPlanName,
                u.paypal_email AS paypalEmail,
                u.profile_picture_url AS profilePictureUrl,
                u.public_bio AS publicBio,
                p.commission_rate AS commissionRate,
                p.description,
                p.purchase_unit AS purchaseUnit,
                p.purchase_earning AS purchaseEarning
            FROM users u
            LEFT JOIN plans p ON u.plan_name = p.plan_name
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
        // --- ENHANCEMENT: Returns the internal error message for debugging ---
        return new Response(JSON.stringify({ 
            error: 'Internal Server Error fetching affiliate profile. The worker code crashed.',
            details: error.message || 'Unknown error. Check Cloudflare Worker logs for D1 connection details.'
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
            // IMPORTANT: In a real production app, hash the password before storing it!
            // Example: const hashedPassword = await hashPassword(newPassword);
            const updateStmt = env.DB.prepare(`
                UPDATE users
                SET full_name = ?, paypal_email = ?, public_bio = ?, password = ?
                WHERE email = ?
            `);
            await updateStmt.bind(
                fullName,
                paypalEmail,
                publicBio,
                newPassword, // Storing plain text - for production, use a hashed password
                email
            ).run();
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

        // We can't reliably use updateResult.meta.changes === 0 here,
        // as submitting the same data is not an error.
        // A better check would be to re-fetch the user, but for now we'll assume success.
        /* if (updateResult.meta.changes === 0) { // This check is disabled for now
            return new Response(JSON.stringify({ error: 'Profile not found or no changes made.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        } */

        return new Response(JSON.stringify({ success: true, message: 'Profile updated successfully.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Affiliate Profile Update Error:', error);
        return new Response(JSON.stringify({
            error: 'Internal Server Error updating affiliate profile.',
            details: error.message
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