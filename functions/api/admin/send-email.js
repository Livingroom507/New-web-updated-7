// /functions/api/admin/send-email.js

// Define the required header name for the token
const AUTH_HEADER_NAME = 'X-Admin-Auth';

export async function onRequestPost({ request, env }) {
    // 1. **Authentication Check (Identical to Data Endpoint)**
    const adminKey = request.headers.get(AUTH_HEADER_NAME);

    if (!adminKey || adminKey !== env.ADMIN_API_KEY) {
        return new Response('Unauthorized Access', { status: 401 });
    }

    try {
        const data = await request.json();
        const { recipientEmails, subject, body } = data;

        // Basic validation
        if (!recipientEmails || !subject || !body || recipientEmails.length === 0) {
            return new Response('Missing recipient, subject, or body.', { status: 400 });
        }

        // --- 2. Format Recipients for Email Service ---
        const toList = recipientEmails.map(email => ({ email: email }));

        // --- 3. Dispatch Email via API (e.g., SendGrid) ---
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personalizations: [{ to: toList }],
                from: { email: 'updates@yourdomain.com', name: 'Empath Closer Placement Team' },
                subject: subject,
                content: [{ type: 'text/plain', value: body }],
            }),
        });

        if (!response.ok) {
            // Log the error response from the email service
            const errorText = await response.text();
            console.error('Email service dispatch failed:', response.status, errorText);
            return new Response('Failed to send emails via external service.', { status: 500 });
        }

        return new Response(JSON.stringify({ success: true, count: recipientEmails.length }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        console.error('Email Function Critical Error:', error);
        return new Response('Server Error processing email request.', { status: 500 });
    }
}