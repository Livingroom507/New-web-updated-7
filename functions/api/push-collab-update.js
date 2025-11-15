// In functions/api/push-collab-update.js

export async function onRequestPost({ request, env }) {
    // 1. Get the worker URL from the environment
    const workerUrl = env.DO_WORKER_URL; 
    if (!workerUrl) {
        // If the variable wasn't set in the dashboard, fail clearly
        return new Response('DO_WORKER_URL environment variable is missing.', { status: 500 });
    }
    
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId) {
        return new Response('Missing sessionId', { status: 400 });
    }

    // 2. IMPORTANT: Get the ID from the binding (COLLAB_ROOM is still used for ID lookup)
    const id = env.COLLAB_ROOM.idFromName(sessionId);
    
    // 3. Construct the full request URL for the external Worker
    // The path here must match what the DO Worker expects (which is /push-update)
    const internalUrl = `${workerUrl}/push-update`;

    // 4. Forward the authenticated request to the external Worker
    const newRequest = new Request(internalUrl, {
        method: 'POST',
        headers: {
            // CRUCIAL: Pass the original Authorization header
            'Authorization': request.headers.get('Authorization'),
            'Content-Type': request.headers.get('Content-Type') || 'application/json',
            // CRUCIAL: Pass the Durable Object ID as a custom header,
            // which the external Worker's entry point needs to forward the request internally.
            'X-Durable-Object-ID': id.toString(), 
        },
        body: request.body
    });

    // 5. Fetch the result from the DO Worker
    return fetch(newRequest);
}