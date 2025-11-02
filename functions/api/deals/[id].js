export async function onRequestGet({ env, params }) {
    try {
        const dealId = params.id;

        if (!dealId) {
            return new Response(JSON.stringify({ error: 'Deal ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const deal = await env.DB.prepare(
            'SELECT d.*, c.name as contactName, c.email as contactEmail FROM deals d JOIN contacts c ON d.contact_id = c.id WHERE d.id = ?'
        ).bind(dealId).first();

        if (!deal) {
            return new Response(JSON.stringify({ error: 'Deal not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(deal), {
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
