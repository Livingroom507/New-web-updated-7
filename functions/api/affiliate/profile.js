// functions/api/affiliate/profile.js

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
        return new Response(JSON.stringify({ error: 'Email parameter is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Fetch all user, profile, and plan data in a single query
        const userStmt = env.DB.prepare(`
            SELECT
                u.email,
                u.full_name AS fullName,
                u.plan_name AS currentPlanName,
                u.paypal_email AS paypalEmail,
                u.profile_picture_url AS profilePictureUrl, // NEW
                u.public_bio AS publicBio,                   // NEW
                p.commission_rate AS commissionRate,
                p.description
            FROM users u
            INNER JOIN plans p ON u.plan_name = p.plan_name
            WHERE u.email = ?
        `);
        const userResult = await userStmt.bind(email).first();

        if (!userResult) {
            return new Response(JSON.stringify({ error: 'User not found.' }), {
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
            publicBio, // Bind the publicBio value
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
                p.plan_name,
                p.commission_rate,
                p.description
            FROM users u
            LEFT JOIN user_subscriptions us ON u.email = us.user_email
            LEFT JOIN plans p ON us.subscription_tier = p.plan_name
            WHERE u.email = ?
        `);
        const profileResult = await profileStmt.bind(email).first();

        if (!profileResult) {
            return new Response(JSON.stringify({ error: 'User not found.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Combine all data into a single profile object
        const profileData = {
            ...profileResult,
            currentTier: profileResult.plan_name || 'Client', // Default to 'Client' if no subscription
        };

        return new Response(JSON.stringify(profileData), {
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