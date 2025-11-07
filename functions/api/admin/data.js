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
        const teamCount = await env.DB.prepare("SELECT COUNT(email) FROM PlacementProfiles").first();
        const topPerformers = await env.DB.prepare("SELECT user_email, score, knowledge_level FROM AssessmentResults WHERE knowledge_level = 'Mastery' LIMIT 10").all();
        const allProfiles = await env.DB.prepare("SELECT email, fullName, salesExperience, nicheInterest FROM PlacementProfiles").all();

        return new Response(JSON.stringify({
            teamSize: teamCount['COUNT(email)'],
            topPerformers: topPerformers.results,
            profiles: allProfiles.results
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Database query failed:', error);
        return new Response('Server Error: Database failure.', { status: 500 });
    }
}