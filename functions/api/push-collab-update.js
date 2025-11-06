export async function onRequestPost(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId'); 
    
    if (!sessionId) {
        return new Response("Missing sessionId", { status: 400 });
    }

    const id = env.COLLAB_ROOM.idFromName(sessionId);
    const stub = env.COLLAB_ROOM.get(id);

    const newRequest = new Request(`http://do-internal/push-update`, {
        method: 'POST',
        headers: request.headers,
        body: request.body
    });

    return stub.fetch(newRequest);
};