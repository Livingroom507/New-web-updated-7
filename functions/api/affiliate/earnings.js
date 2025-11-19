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
                r.referred_email AS referredUserEmail,
                r.plan_name AS planChosen,
                r.created_at AS date,
                r.status,
                r.commission AS totalCommission,     -- Use the existing 'commission' column
                p.purchase_unit,                     -- For display/calculation
                p.purchase_earning                   -- For display/calculation
            FROM referrals r
            INNER JOIN plans p ON r.plan_name = p.plan_name
            WHERE r.affiliate_id = ?
            ORDER BY r.created_at DESC
        `);
        
        const referralsResult = await referralsStmt.bind(affiliateId).all();

        // 3. Calculate total earnings from the results
        let totalEarnings = 0;
        if (referralsResult.results) {
            referralsResult.results.forEach(ref => {
                // Sum up the commission from each referral
                totalEarnings += ref.totalCommission || 0;
            });
        }

        // 4. Return referral list and total earnings
        const earningsData = {
            totalEarnings: totalEarnings.toFixed(2),
            totalReferrals: referralsResult.results ? referralsResult.results.length : 0,
            referrals: referralsResult.results || [],
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