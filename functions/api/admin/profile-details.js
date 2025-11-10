
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return new Response('Email query parameter is required', { status: 400 });
  }

  try {
    const query = `SELECT p.*, m.score AS module3_score // <-- Change: Select 'score' column and alias it
      FROM PlacementProfiles p
      LEFT JOIN module3_results m ON p.email = m.email // <-- Change: Use the existing table name
      WHERE p.email = ?;`;
    const ps = env.DB.prepare(query).bind(email);
    const result = await ps.first();

    if (result) {
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response('Profile not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching profile details:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
