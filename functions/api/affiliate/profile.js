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
        // 1. Fetch User Data (Role, Name)
        const userStmt = env.DB.prepare('SELECT id, name, email, role FROM users WHERE email = ?');
        const userResult = await userStmt.bind(email).first();

        if (!userResult) {
            return new Response(JSON.stringify({ error: 'User not found.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Authentication/Authorization Check (Ensure they are an affiliate or admin)
        if (userResult.role !== 'affiliate' && userResult.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Access denied. User is not an affiliate or admin.' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 2. Fetch Subscription Data (Current Tier)
        const subscriptionStmt = env.DB.prepare('SELECT subscription_tier FROM user_subscriptions WHERE user_email = ?');
        const subscriptionResult = await subscriptionStmt.bind(email).first();
        const currentTier = subscriptionResult ? subscriptionResult.subscription_tier : 'Client'; // Default to Client if no subscription found

        // 3. Fetch Plan Financials (Plans table data related to the tier)
        const planStmt = env.DB.prepare('SELECT * FROM plans WHERE plan_name = ?');
        const planFinancials = await planStmt.bind(currentTier).first();


        // Combine all data into a single profile object
        const profileData = {
            user: {
                id: userResult.id,
                name: userResult.name,
                email: userResult.email,
                role: userResult.role,
            },
            subscription: {
                currentTier: currentTier,
                financials: planFinancials || null,
            },
            // Placeholder KPIs (will be updated by the earnings endpoint)
            kpis: {
                totalReferrals: 0,
                totalEarnings: 0,
            }
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