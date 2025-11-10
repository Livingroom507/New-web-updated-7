
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
          r.id,
          r.name,
          r.email,
          r.status,
          r.created_at
      FROM 
          Referrals r
      WHERE 
          r.referred_by = ?;
    `;

    const ps = env.DB.prepare(referralsQuery).bind(email);
    const { results } = await ps.all();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
