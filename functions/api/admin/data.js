// /functions/api/admin/data.js (with Security Logic)

export async function onRequestPost({ request, env }) {
    // 1. **Authentication Check**
    const authHeader = request.headers.get('Authorization');

    // 1. Check if the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ success: false, detail: 'Missing or malformed Authorization header' }), { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 2. Extract the actual token by removing the "Bearer " prefix (7 characters long)
    const token = authHeader.substring(7);

    // 3. Compare the extracted token with the environment variable
    if (token !== env.ADMIN_API_KEY) {
        return new Response(JSON.stringify({ success: false, detail: 'Invalid API Key' }), { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // --- 2. Data Queries (Only executes if authentication succeeds) ---
    try {
        const query = `
            SELECT 
                p.id,
                p.email,
                p.fullName,
                p.linkedinUrl,
                p.salesExperience,
                p.nicheInterest,
                p.availability,
                p.deepPainSummary,
                p.objectionHandlingView,
                p.crmFamiliarity,
                p.submissionDate,
                m.score
            FROM 
                PlacementProfiles p
            LEFT JOIN 
                module3_results m ON p.email = m.email;
        `;
        const { results } = await env.DB.prepare(query).all();

        if (!results) {
             return new Response(JSON.stringify({ error: "No results found." }), {
                 status: 404, headers: { 'Content-Type': 'application/json' }
             });
        }

        const responseData = {
            profiles: results,
            topPerformers: results.filter(p => p.score !== null && p.score !== undefined),
            teamSize: results.length
        };

        return new Response(JSON.stringify(responseData), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error("D1 Query Error:", e);
        return new Response(JSON.stringify({ error: "Database failure.", detail: e.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}