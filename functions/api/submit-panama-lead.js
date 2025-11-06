// /functions/api/submit-panama-lead.js

// Assume sendEmail function is defined elsewhere or use a basic fetch approach
async function sendNotificationEmail(subject, body, env) {
    // This sends an internal notification that a new lead has arrived
    const ADMIN_EMAIL = 'leads@yourdomain.com';
    // Implementation details (using env.SENDGRID_API_KEY) go here...
    console.log(`Sending internal lead notification to ${ADMIN_EMAIL}`);
    // Return true/false based on email service response
    return true; 
}


export async function onRequestPost({ request, env }) {
    try {
        const formData = await request.formData();
        
        const leadData = {
            name: formData.get('lead_name'),
            email: formData.get('lead_email'),
            interest: formData.get('lead_interest'),
        };

        if (!leadData.email || !leadData.name) {
            return new Response(JSON.stringify({ success: false, message: 'Missing required fields.' }), { status: 400 });
        }
        
        // --- Store Lead in D1 Database ---
        try {
            // NOTE: Ensure your D1 table (e.g., PanamaLeads) is created with these columns
            await env.DB.prepare(
                `INSERT INTO PanamaLeads (email, fullName, interest, submissionDate) 
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
            ).bind(leadData.email, leadData.name, leadData.interest)
            .run();
        } catch (dbError) {
            console.error('D1 Lead Insertion Failed:', dbError);
            // Non-critical: Log and continue to confirmation email
        }

        // --- Trigger Internal & User Notifications (Asynchronous) ---
        // 1. Internal Notification (Alerts your team/CRM)
        const adminBody = `New Panama Lead: ${leadData.name} (${leadData.email}). Interest: ${leadData.interest}.`;
        env.ctx.waitUntil(sendNotificationEmail('NEW PANAMA LEAD', adminBody, env));

        // 2. User Confirmation Email (Sends the VIP Planning Guide)
        const userBody = `Dear ${leadData.name},

Thank you for your interest! Your VIP Planning Guide for Panama is attached (or linked here). We will be in touch based on your selected interest: ${leadData.interest}.`;
        // You would need a separate function call here to send the actual Guide...

        // --- Success Response ---
        return new Response(JSON.stringify({ success: true, message: 'Thank you! Check your email for the VIP Guide.' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        console.error('Lead Capture Critical Error:', error);
        return new Response(JSON.stringify({ success: false, message: 'A critical error occurred. Please try again later.' }), { status: 500 });
    }
}
