export async function onRequestPut({ request, env, params }) {
    try {
        const { pipeline_stage } = await request.json();
        const dealId = params.id;

        if (!dealId) {
            return new Response(JSON.stringify({ error: 'Deal ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await env.DB.prepare(
            'UPDATE deals SET pipeline_stage = ? WHERE id = ?'
        ).bind(pipeline_stage, dealId).run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
