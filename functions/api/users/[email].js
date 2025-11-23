
export async function onRequestGet(context) {
  const { env, params } = context;
  const email = params.email;

  if (!email) {
    return new Response('Email is required', { status: 400 });
  }

  try {
    const ps = env.DB.prepare('SELECT * FROM module3_results WHERE email = ?');
    const { results } = await ps.bind(email).all();

    if (results.length === 0) {
      return new Response('No results found for this email', { status: 404 });
    }

    return new Response(JSON.stringify(results[0]), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching user results:', error);
    return new Response('Error fetching user results', { status: 500 });
  }
}
