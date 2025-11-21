export async function onRequestPost({ request, env }) {
    try {
        // Get the data from the request body
        const { fullName, email, score } = await request.json();

        // Basic validation
        if (!fullName || !email || score === undefined) {
            return new Response('Missing required fields.', { status: 400 });
        }

        // Calculate knowledge level
        let knowledgeLevel;
        if (score >= 80) {
            knowledgeLevel = 'Mastery';
        } else {
            knowledgeLevel = 'Needs Review';
        }

        // Prepare the SQL statement to insert data into the module3_results table
        const stmt = env.DB.prepare(
            'INSERT INTO module3_results (email, score, knowledgeLevel) VALUES (?, ?, ?)'
        );

        // Bind the values and execute the statement
        const result = await stmt.bind(email, score, knowledgeLevel).run();

        // Return a success response
        return new Response(JSON.stringify({ success: true, result }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        // Log the error and return a server error response
        console.error('Error saving quiz results:', error);
        return new Response('Error saving quiz results.', { status: 500 });
    }
}