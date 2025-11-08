export class CollaborationRoom {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.sessions = new Set();
    }

    async fetch(request) {
        const url = new URL(request.url);

        if (url.pathname === '/websocket') {
            const [client, server] = new WebSocketPair();
            await this.handleWebSocket(server);
            return new Response(null, { status: 101, webSocket: client });

        } else if (url.pathname === '/push-update' && request.method === 'POST') {
            return this.handleAdminPush(request);

        } else {
            return new Response('Not Found', { status: 404 });
        }
    }

    async handleWebSocket(server) {
        this.sessions.add(server);
        server.accept();

        server.addEventListener('close', () => this.sessions.delete(server));
        server.addEventListener('error', () => this.sessions.delete(server));
    }

    async handleAdminPush(request) {
        try {
            console.log('Handling admin push...');
            const authKey = request.headers.get('X-Admin-Auth');
            console.log('Auth key:', authKey ? 'present' : 'missing');

            if (authKey !== this.env.ADMIN_API_KEY) {
                console.warn('Unauthorized push attempt.');
                return new Response('Unauthorized Push', { status: 401 });
            }

            console.log('Auth successful. Parsing message...');
            const message = await request.json();
            console.log('Message parsed:', message);

            this.broadcast(JSON.stringify(message));
            console.log('Broadcast complete.');

            return new Response('Update Broadcasted', { status: 200 });
        } catch (e) {
            console.error('Error in handleAdminPush:', e);
            // Also log the request body if possible, as it might not be valid JSON
            try {
                const bodyText = await request.text();
                console.error('Request body text:', bodyText);
            } catch (textErr) {
                console.error('Could not even read request body as text:', textErr);
            }
            return new Response('Internal Server Error in DO', { status: 500 });
        }
    }

    broadcast(message) {
        this.sessions.forEach(session => {
            try {
                session.send(message);
            } catch (e) {
                this.sessions.delete(session);
            }
        });
    }
}