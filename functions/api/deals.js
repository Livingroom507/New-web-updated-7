export async function onRequestGet({ env }) {
    try {
        // Diagnostic query to check for table creation
        const { results } = await env.DB.prepare(
            "SELECT name FROM sqlite_master WHERE type='table';"
        ).all();

        return new Response(JSON.stringify(results), {
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

export async function onRequestPost({ request, env }) {
    try {
        const dealData = await request.json();

        // 1. Create the contact first
        const contactInsert = await env.DB.prepare(
            'INSERT INTO contacts (name, email) VALUES (?, ?) RETURNING id'
        ).bind(dealData.contactName, dealData.contactEmail).first();

        if (!contactInsert || !contactInsert.id) {
            return new Response(JSON.stringify({ error: 'Failed to create contact' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const contactId = contactInsert.id;

        // 2. Create the deal associated with the new contact
        const dealInsert = await env.DB.prepare(
            `INSERT INTO deals (contact_id, main_pain, emotional_cost, uvp, readiness_score) 
             VALUES (?, ?, ?, ?, ?)`
        ).bind(
            contactId,
            dealData.mainPain,
            dealData.emotionalCost,
            dealData.uvp,
            dealData.readinessScore
        ).run();
        
        // 3. Fetch the newly created deal to return it
        const newDeal = await env.DB.prepare(
            'SELECT d.*, c.name as contactName, c.email as contactEmail FROM deals d JOIN contacts c ON d.contact_id = c.id WHERE d.id = ?'
        ).bind(dealInsert.meta.last_row_id).first();

        return new Response(JSON.stringify(newDeal), {
            status: 201, // Created
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function onRequestPut({ request, env, params }) {
    try {
        const dealData = await request.json();
        const dealId = params.id;

        if (!dealId) {
            return new Response(JSON.stringify({ error: 'Deal ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 1. Update the contact
        await env.DB.prepare(
            'UPDATE contacts SET name = ?, email = ? WHERE id = ?'
        ).bind(dealData.contactName, dealData.contactEmail, dealData.contact_id).run();

        // 2. Update the deal
        await env.DB.prepare(
            `UPDATE deals 
             SET main_pain = ?, emotional_cost = ?, uvp = ?, readiness_score = ?
             WHERE id = ?`
        ).bind(
            dealData.mainPain,
            dealData.emotionalCost,
            dealData.uvp,
            dealData.readinessScore,
            dealId
        ).run();

        // 3. Fetch the updated deal to return it
        const updatedDeal = await env.DB.prepare(
            'SELECT d.*, c.name as contactName, c.email as contactEmail FROM deals d JOIN contacts c ON d.contact_id = c.id WHERE d.id = ?'
        ).bind(dealId).first();

        return new Response(JSON.stringify(updatedDeal), {
            status: 200, // OK
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
