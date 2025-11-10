
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return new Response('Email query parameter is required', { status: 400 });
  }

  try {
    const earningsQuery = `
      SELECT 
          SUM(e.amount) as total_earnings
      FROM 
          Earnings e
      WHERE 
          e.affiliate_email = ?;
    `;

    const ps = env.DB.prepare(earningsQuery).bind(email);
    const result = await ps.first();

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
