
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return new Response('Email query parameter is required', { status: 400 });
  }

  try {
    const query = `
      SELECT 
          p.*, 
          m.module1_score, m.module2_score, m.module3_score, m.total_score, m.knowledge_level
      FROM 
          PlacementProfiles p
      LEFT JOIN 
          QuizResults m ON p.email = m.email
      WHERE 
          p.email = ?;
    `;
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
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
