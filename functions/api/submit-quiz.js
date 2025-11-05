export async function onRequestPost({ request, env }) {
    try {
        // Get the data from the request body
        const { user_email, module_number, score, total_questions, referrer_affiliate_id } = await request.json();

        // Basic validation
        if (!user_email || !module_number || score === undefined || !total_questions) {
            return new Response('Missing required fields.', { status: 400 });
        }

        // Calculate knowledge level
        let knowledge_level;
        const percentage = (score / total_questions) * 100;
        if (percentage >= 90) {
            knowledge_level = 'Mastery';
        } else if (percentage >= 60) {
            knowledge_level = 'Intermediate';
        } else {
            knowledge_level = 'Needs Review';
        }

        // Prepare the SQL statement to insert data into the AssessmentResults table
        const stmt = env.DB.prepare(
            'INSERT INTO AssessmentResults (user_email, module_number, score, total_questions, knowledge_level, referrer_affiliate_id) VALUES (?, ?, ?, ?, ?, ?)'
        );

        // Bind the values and execute the statement
        const result = await stmt.bind(user_email, module_number, score, total_questions, knowledge_level, referrer_affiliate_id || null).run();

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