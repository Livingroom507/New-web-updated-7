// functions/api/affiliate/profile.js

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    // NOTE: This assumes email is passed as a query parameter (e.g., ?email=user@example.com).
    // In a real production environment, this should come from the secure session/cookie.
    const email = url.searchParams.get('email');

    if (!email) {
        return new Response(JSON.stringify({ error: 'Email parameter is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Fetch user, profile, and critical plan financial data (purchase_unit/earning)
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
                p.purchase_unit AS purchaseUnit,      -- ADDED FINANCIAL DATA
                p.purchase_earning AS purchaseEarning -- ADDED FINANCIAL DATA
            FROM users u
            INNER JOIN plans p ON u.plan_name = p.plan_name
            WHERE u.email = ?
        `);
        const userResult = await userStmt.bind(email).first();

        if (!userResult) {
            return new Response(JSON.stringify({ error: 'User not found or plan data missing.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Returns all selected fields, including the new profile and financial data
        return new Response(JSON.stringify(userResult), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Affiliate Profile Fetch Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error fetching affiliate profile.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const requestBody = await request.json();
        const { fullName, email, paypalEmail, publicBio } = requestBody;

        // Basic validation
        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required for authentication.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Update the SQL statement to include the new columns
        const updateStmt = env.DB.prepare(`
            UPDATE users
            SET
                full_name = ?,
                paypal_email = ?,
                public_bio = ?
            WHERE email = ?
        `);

        // Update the bind variables in the execute call
        const updateResult = await updateStmt.bind(
            fullName,
            paypalEmail,
            publicBio, 
            email
        ).run();

        if (updateResult.meta.changes === 0) {
              return new Response(JSON.stringify({ error: 'Profile not found or no changes made.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true, message: 'Profile updated successfully.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Affiliate Profile Update Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error updating affiliate profile.' }), {
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