// /workers/collaboration-room.js (Bound to COLLAB_ROOM in wrangler.toml)

export class CollaborationRoom {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        // Set to store WebSocket sessions for all connected clients in this room
        this.sessions = new Set(); 
    }

    // Handles all incoming requests (either WebSocket connection or Admin's POST to update)
    async fetch(request) {
        const url = new URL(request.url);

        if (url.pathname === '/websocket') {
            // 1. Handle WebSocket upgrade (Client connecting to the room)
            const [client, server] = new WebSocketPair();
            await this.handleWebSocket(server); 
            return new Response(null, { status: 101, webSocket: client });

        } else if (url.pathname === '/push-update' && request.method === 'POST') {
            // 2. Handle Admin push (Admin confirming a selection)
            return this.handleAdminPush(request);

        } else {
            return new Response('Not Found', { status: 404 });
        }
    }

    // Adds the client's WebSocket connection to the session set
    async handleWebSocket(server) {
        this.sessions.add(server);
        server.accept();

        server.addEventListener('close', () => this.sessions.delete(server));
        server.addEventListener('error', () => this.sessions.delete(server));
    }

    // Processes the Admin's POST request and broadcasts the message
    async handleAdminPush(request) {
        const authKey = request.headers.get('X-Admin-Auth');
        // Basic security check (ideally this check should be done in the front-end push function too)
        if (authKey !== this.env.ADMIN_API_KEY) { 
             return new Response('Unauthorized Push', { status: 401 });
        }

        const message = await request.json();
        
        // Broadcast the update message to all connected clients
        this.broadcast(JSON.stringify(message));

        return new Response('Update Broadcasted', { status: 200 });
    }

    // Sends the JSON message to every connected client
    broadcast(message) {
        this.sessions.forEach(session => {
            try {
                session.send(message);
            } catch (e) {
                // Handle closed connections
                this.sessions.delete(session);
            }
        });
    }
}