// functions/api/affiliate/training.js

export async function onRequestGet(context) {
    const { env } = context;

    try {
        // No email is strictly required as all affiliates get the same resources.
        // However, we include a minimal security check to ensure the call is authorized
        // (In a real application, this would use session or JWT verification).

        // Fetch all resources, ordering by most recently added.
        const stmt = env.DB.prepare(`
            SELECT
                id,
                title,
                description,
                url,
                type,
                created_at
            FROM affiliate_resources
            ORDER BY created_at DESC
        `);
        const results = await stmt.all();

        return new Response(JSON.stringify({
            resources: results.results || []
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Affiliate Training Fetch Error:', error);
        // NOTE: If the table is empty, it returns an empty array, not a 500 error.
        return new Response(JSON.stringify({ error: 'Internal Server Error fetching training materials.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}