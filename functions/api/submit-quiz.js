export async function onRequestPost({ request, env }) {
    try {
        const { email, score, knowledgeLevel } = await request.json();

        if (!email || !score || !knowledgeLevel) {
            return new Response('Missing required fields.', { status: 400 });
        }

        const result = await env.DB.prepare(
            'INSERT INTO Module3Results (email, score, knowledgeLevel) VALUES (?, ?, ?)'
        )
        .bind(email, score, knowledgeLevel)
        .run();

        return new Response(JSON.stringify({ success: true, result }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error saving quiz results:', error);
        return new Response('Error saving quiz results.', { status: 500 });
    }
}