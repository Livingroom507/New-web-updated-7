// functions/api/affiliate/subscribe.js

export async function onRequestPost({ request, env }) {
    try {
        const { userEmail, planName } = await request.json();

        if (!userEmail || !planName) {
            return new Response(JSON.stringify({ error: 'Missing userEmail or planName.' }), { status: 400 });
        }

        // 1. Verify user exists and get user ID
        const userStmt = env.DB.prepare('SELECT id, role FROM users WHERE email = ?');
        const userResult = await userStmt.bind(userEmail).first();
        
        if (!userResult) {
            return new Response(JSON.stringify({ error: 'User not found.' }), { status: 404 });
        }

        // 2. Look up the plan ID/info (assuming we use planName as the lookup key)
        const planStmt = env.DB.prepare('SELECT plan_name FROM plans WHERE plan_name = ?');
        const planResult = await planStmt.bind(planName).first();
        
        if (!planResult) {
            return new Response(JSON.stringify({ error: 'Plan not found.' }), { status: 404 });
        }

        // 3. Update or Insert into user_subscriptions table (Handling the NOT NULL constraint)
        const updateSubscriptionSql = `
            INSERT INTO user_subscriptions (user_email, subscription_tier, tier_start_date)
            VALUES (?, ?, date('now'))
            ON CONFLICT(user_email) DO UPDATE SET
                subscription_tier = excluded.subscription_tier,
                tier_start_date = excluded.tier_start_date;
        `;
        
        // 4. Update the user's role to 'affiliate' if they bought an affiliate plan
        // NOTE: This assumes the purchase confirms their role, overriding any previous role like 'customer'.
        const updateUserRoleSql = `
            UPDATE users SET role = 'affiliate' WHERE email = ?;
        `;
        
        // Execute both database operations as a transaction for safety
        await env.DB.batch([
            env.DB.prepare(updateSubscriptionSql).bind(userEmail, planName),
            env.DB.prepare(updateUserRoleSql).bind(userEmail)
        ]);
        
        return new Response(JSON.stringify({ success: true, message: `Subscription to ${planName} updated successfully.` }), { status: 200 });

    } catch (error) {
        console.error('Subscription API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error during subscription update.' }), { status: 500 });
    }
}