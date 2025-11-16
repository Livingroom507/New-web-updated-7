// /functions/api/admin/subscriptions.js

// Define the two possible request methods this endpoint handles
export async function onRequest({ request, env }) {
    // 1. **Security Check (Required for Admin endpoints)**
    const authHeader = request.headers.get('Authorization');

    // Check for Bearer token format and validity
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return Response.json({ success: false, detail: 'Missing or malformed Authorization header' }, { status: 401 });
    }
    const token = authHeader.substring(7);

    if (token !== env.ADMIN_API_KEY) {
        return Response.json({ success: false, detail: 'Invalid API Key' }, { status: 401 });
    }

    // 2. **Routing based on HTTP Method**
    const url = new URL(request.url);
    const userEmail = url.searchParams.get('email');

    if (!userEmail) {
        return Response.json({ success: false, detail: 'Missing required user email parameter.' }, { status: 400 });
    }

    try {
        if (request.method === 'GET') {
            return await getSubscription(userEmail, env);
        } else if (request.method === 'POST') {
            // POST is used to UPDATE the subscription tier
            return await updateSubscription(request, userEmail, env);
        } else {
            return Response.json({ success: false, detail: 'Method Not Allowed' }, { status: 405 });
        }
    } catch (error) {
        console.error("Subscription API Error:", error.message);
        return Response.json({ success: false, detail: 'Internal Server Error.' }, { status: 500 });
    }
}

// --- GET Logic: Fetch a user's current subscription tier ---
async function getSubscription(email, env) {
    const { results } = await env.DB.prepare(
        `SELECT subscription_tier, tier_start_date FROM user_subscriptions WHERE user_email = ?`
    )
    .bind(email)
    .all();

    if (results.length === 0) {
        // If no record exists, return the default 'Client' tier without writing to the DB
        return Response.json({ 
            success: true, 
            subscription: { user_email: email, subscription_tier: 'Client', tier_start_date: null }
        });
    }

    return Response.json({ 
        success: true, 
        subscription: { 
            user_email: email, 
            subscription_tier: results[0].subscription_tier, 
            tier_start_date: results[0].tier_start_date 
        }
    });
}

// --- POST Logic: Update a user's subscription tier ---
async function updateSubscription(request, email, env) {
    const { newTier } = await request.json();
    const currentDate = new Date().toISOString();

    if (!newTier) {
        return Response.json({ success: false, detail: 'Missing required newTier parameter in body.' }, { status: 400 });
    }

    // Check if the user exists in the subscriptions table
    const existing = await env.DB.prepare(
        `SELECT id FROM user_subscriptions WHERE user_email = ?`
    )
    .bind(email)
    .first();

    if (existing) {
        // If they exist, update the record
        await env.DB.prepare(
            `UPDATE user_subscriptions SET subscription_tier = ? WHERE user_email = ?`
        )
        .bind(newTier, email)
        .run();
    } else {
        // If they don't exist, get user_id from users table
        const user = await env.DB.prepare(
            `SELECT id FROM users WHERE email = ?`
        )
        .bind(email)
        .first();

        if (!user) {
            return Response.json({ success: false, detail: 'User not found for subscription creation.' }, { status: 404 });
        }
        
        // Insert a new record
        await env.DB.prepare(
            `INSERT INTO user_subscriptions (user_id, user_email, subscription_tier, tier_start_date) VALUES (?, ?, ?, ?)`
        )
        .bind(user.id, email, newTier, currentDate)
        .run();
    }

    return Response.json({ 
        success: true, 
        message: `Subscription for ${email} updated to ${newTier}.`,
        new_tier: newTier
    });
}