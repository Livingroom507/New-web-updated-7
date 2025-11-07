import { onRequestPost as handlePushUpdate } from './api/push-collab-update.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === '/api/push-collab-update' && request.method === 'POST') {
            return handlePushUpdate({ request, env, ctx });
        }

        if (url.pathname.startsWith('/ws/')) {
            const parts = url.pathname.split('/');
            const sessionId = parts[2];

            if (sessionId) {
                const id = env.COLLAB_ROOM.idFromName(sessionId);
                const stub = env.COLLAB_ROOM.get(id);

                return stub.fetch(request);
            }
        }

        return env.ASSETS.fetch(request);
    },
};