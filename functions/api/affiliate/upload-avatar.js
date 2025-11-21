// functions/api/affiliate/upload-avatar.js

export async function onRequestPost(context) {
    const { request, env } = context;

    // IMPORTANT: Add these as secrets in your Cloudflare project settings
    const ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
    const API_TOKEN = env.CLOUDFLARE_IMAGES_API_TOKEN;

    if (!ACCOUNT_ID || !API_TOKEN) {
        console.error('Cloudflare account ID or Images API token is not configured.');
        return new Response(JSON.stringify({ error: 'Server is not configured for image uploads.' }), { status: 500 });
    }

    try {
        const formData = await request.formData();
        const imageFile = formData.get('image');
        const userEmail = formData.get('email');

        if (!imageFile || !userEmail) {
            return new Response(JSON.stringify({ error: 'Image file and user email are required.' }), { status: 400 });
        }

        // 1. Upload the image to Cloudflare Images
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`;

        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
            },
            body: uploadFormData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
            console.error('Cloudflare Images API Error:', uploadResult.errors);
            return new Response(JSON.stringify({ error: 'Failed to upload image.', details: uploadResult.errors }), { status: 500 });
        }

        const imageUrl = uploadResult.result.variants[0]; // Get the public URL

        // 2. Update the user's profile_picture_url in the D1 database
        const stmt = env.DB.prepare(
            'UPDATE users SET profile_picture_url = ? WHERE email = ?'
        );
        await stmt.bind(imageUrl, userEmail).run();

        return new Response(JSON.stringify({ success: true, imageUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Avatar Upload Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error during image upload.', details: error.message }), { status: 500 });
    }
}

export async function onRequest(context) {
    if (context.request.method === 'POST') {
        return await onRequestPost(context);
    }
    return new Response('Method Not Allowed', { status: 405 });
}