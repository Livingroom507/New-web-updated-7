// /functions/api/admin/data.js (with Security Logic)

// Define the required header name for the token
const AUTH_HEADER_NAME = 'X-Admin-Auth';

export async function onRequestPost({ request, env }) {
    // 1. **Authentication Check**
    const adminKey = request.headers.get(AUTH_HEADER_NAME);

    // Compare the key from the request header against the secret key in the environment variables
    if (!adminKey || adminKey !== env.ADMIN_API_KEY) {
        // Log the failed attempt (optional)
        console.warn('Unauthorized access attempt to admin endpoint.'); 
        
        // Return a standard 401 Unauthorized response
        return new Response('Unauthorized Access', { status: 401 });
    }
    
    // --- 2. Data Queries (Only executes if authentication succeeds) ---
    try {
        const query = `
            SELECT 
                PP.fullName, 
                PP.email, 
                PP.salesExperience, 
                PP.nicheInterest, 
                QR.total_score, 
                QR.knowledge_level
            FROM 
                PlacementProfiles PP 
            JOIN 
                QuizResults QR 
            ON 
                PP.email = QR.email;
        `;
        const { results } = await env.DB.prepare(query).all();

        if (!results) {
             return new Response(JSON.stringify({ error: "No results found." }), {
                 status: 404, headers: { 'Content-Type': 'application/json' }
             });
        }

        return new Response(JSON.stringify(results), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error("D1 Query Error:", e.message);
        return new Response(JSON.stringify({ error: "Database failure.", detail: e.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}