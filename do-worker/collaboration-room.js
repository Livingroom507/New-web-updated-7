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
        const authKey = request.headers.get('X-Admin-Auth');
        if (authKey !== this.env.ADMIN_API_KEY) {
             return new Response('Unauthorized Push', { status: 401 });
        }

        const message = await request.json();

        this.broadcast(JSON.stringify(message));

        return new Response('Update Broadcasted', { status: 200 });
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