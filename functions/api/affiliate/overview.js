
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return new Response('Email query parameter is required', { status: 400 });
  }

  try {
    const referralsQuery = `
      SELECT 
          COUNT(*) as referral_count
      FROM 
          Referrals r
      WHERE 
          r.referred_by = ?;
    `;

    const earningsQuery = `
      SELECT 
          SUM(e.amount) as total_earnings
      FROM 
          Earnings e
      WHERE 
          e.affiliate_email = ?;
    `;

    const referralsPs = env.DB.prepare(referralsQuery).bind(email);
    const earningsPs = env.DB.prepare(earningsQuery).bind(email);

    const [referralsResult, earningsResult] = await Promise.all([
      referralsPs.first(),
      earningsPs.first(),
    ]);

    const overview = {
      referral_count: referralsResult.referral_count,
      total_earnings: earningsResult.total_earnings || 0,
    };

    return new Response(JSON.stringify(overview), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
