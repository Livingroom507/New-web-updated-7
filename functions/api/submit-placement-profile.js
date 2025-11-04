// Define admin email for profile submission notifications
const ADMIN_EMAIL = 'placement@yourdomain.com';

// Reusable email sending function (assuming SendGrid or similar API)
async function sendEmail(toEmail, subject, body, env) {
    // Note: The structure below is a conceptual example for a service like SendGrid.
    // Replace with your actual email service API structure.
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            personalizations: [{ to: [{ email: toEmail }] }],
            from: { email: 'noreply@yourdomain.com', name: 'Placement Team' },
            subject: subject,
            content: [{ type: 'text/plain', value: body }],
        }),
    });
    return response.ok;
}

export async function onRequestPost({ request, env }) {
    try {
        const formData = await request.formData();
        
        // Extract all necessary fields from the form
        const profileData = {
            fullName: formData.get('full_name'),
            email: formData.get('email'),
            linkedinUrl: formData.get('linkedin_url'),
            salesExperience: formData.get('sales_experience_years'),
            nicheInterest: formData.get('niche_interest'),
            availability: formData.get('availability'),
            deepPainSummary: formData.get('deep_pain_summary'),
            objectionHandlingView: formData.get('objection_handling_view'),
            crmFamiliarity: formData.get('crm_familiarity'),
        };

        // --- 1. Data Validation (Quick Check) ---
        if (!profileData.email || !profileData.fullName || !profileData.deepPainSummary) {
            return new Response('Missing required fields.', { status: 400 });
        }
        
        // --- 2. Data Storage (D1 Database) ---
        try {
            // NOTE: Ensure your D1 table (e.g., PlacementProfiles) matches these columns
            await env.DB.prepare(
                `INSERT INTO PlacementProfiles (
                    email, fullName, linkedinUrl, salesExperience, nicheInterest, 
                    availability, deepPainSummary, objectionHandlingView, crmFamiliarity, submissionDate
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
            ).bind(
                profileData.email, profileData.fullName, profileData.linkedinUrl, 
                profileData.salesExperience, profileData.nicheInterest, profileData.availability, 
                profileData.deepPainSummary, profileData.objectionHandlingView, profileData.crmFamiliarity
            ).run();
        } catch (dbError) {
            console.error('D1 Database Insertion Failed:', dbError);
            // Non-critical: Log and proceed, as email is the primary confirmation
        }

        // --- 3. User Confirmation Email ---
        const userBody = `
            Dear ${profileData.fullName},

            Your Empath Closer Placement Profile has been successfully submitted!

            We are now moving into the Vetting & Matching phase. Our team will review your profile, especially your demonstrated mastery of the Diagnostic Approach and Investment Re-Frame, and begin matching you with suitable Hiring Partners.

            You can expect a follow-up communication regarding next steps within 7 business days.

            Thank you,
            The Empath Closer Placement Team
        `;
        await sendEmail(profileData.email, 'Profile Submitted: Vetting Phase Activated', userBody, env);

        // --- 4. Admin Notification Email (High Priority) ---
        const adminBody = `
            NEW CERTIFIED PLACEMENT PROFILE SUBMISSION:
            
            Name: ${profileData.fullName}
            Email: ${profileData.email}
            Sales Experience: ${profileData.salesExperience}
            Niche Interest: ${profileData.nicheInterest}
            Availability: ${profileData.availability}
            
            Review required for: Immediate Placement Matching.
            Link to Profile: [Your CRM/D1 Lookup URL]
        `;
        await sendEmail(ADMIN_EMAIL, `🚨 NEW PLACEMENT PROFILE: ${profileData.fullName}`, adminBody, env);

        // --- 5. Final Redirect to Success Page ---
        return new Response(null, {
            status: 302, // HTTP 302: Found (Temporary Redirect)
            headers: {
                // IMPORTANT: Create this page to confirm success to the user.
                Location: '/profile_submitted_success.html' 
            }
        });

    } catch (error) {
        console.error('Placement Submission Critical Error:', error);
        return new Response('A critical error occurred during submission. Please try again.', { status: 500 });
    }
}