// functions/api/affiliate/earnings.js

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
        // 1. Fetch Affiliate User ID
        const userStmt = env.DB.prepare('SELECT id, role FROM users WHERE email = ?');
        const userResult = await userStmt.bind(email).first();

        if (!userResult || userResult.role !== 'affiliate') {
            return new Response(JSON.stringify({ error: 'Access denied. Must be a recognized affiliate.' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const affiliateId = userResult.id;

        // 2. Fetch all referrals made by this affiliate and join with plans for commission data
        const referralsStmt = env.DB.prepare(`
            SELECT
                r.id,
                r.referred_user_email,
                r.plan_id,
                r.referral_date,
                r.status,
                p.plan_name,
                p.commission_rate
            FROM referrals r
            JOIN plans p ON r.plan_id = p.id
            WHERE r.affiliate_id = ?
            ORDER BY r.referral_date DESC
        `);
        const referralsResult = await referralsStmt.bind(affiliateId).all();

        // 3. Process data and calculate totals
        let totalEarnings = 0;
        const processedReferrals = referralsResult.results.map(ref => {
            // Assuming 'commission_rate' is a percentage (e.g., 0.15 for 15%)
            // You would typically get the sale price from a 'transactions' or 'plans' table.
            // For this example, we'll use a placeholder price and apply the rate.
            const planPrice = 2000; // Placeholder value for a high-ticket plan
            const commission = (ref.commission_rate * planPrice).toFixed(2);

            totalEarnings += parseFloat(commission);

            return {
                id: ref.id,
                date: ref.referral_date,
                referredUser: ref.referred_user_email,
                planChosen: ref.plan_name,
                commissionEarned: commission,
                status: ref.status,
            };
        });

        // 4. Return referral list and total earnings
        const earningsData = {
            totalEarnings: totalEarnings.toFixed(2),
            totalReferrals: processedReferrals.length,
            referrals: processedReferrals,
        };

        return new Response(JSON.stringify(earningsData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Affiliate Earnings Fetch Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error fetching affiliate earnings.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}