// functions/collaboration-room.js

export class CollaborationRoom {
    constructor(state, env) {
        // 'state' is required to manage storage and websockets
        this.state = state;
        // 'env' gives you access to other bindings (like D1, which DOs often need)
        this.env = env; 
        
        // This array will hold the WebSocket connections for live updates
        this.sessions = []; 
        
        // Ensure state is correctly initialized
        this.state.blockConcurrencyWhile(async () => {
            this.lastUpdate = await this.state.storage.get('lastUpdate') || {};
        });
    }

    async fetch(request) {
        const url = new URL(request.url);
        
        // 1. Check for the internal path used by push-collab-update.js
        // The path being forwarded is: 'http://do-internal/push-update'
        if (url.pathname === '/do-internal/push-update') {
            
            // Read the data sent by the client (the product selection)
            let updateData;
            try {
                updateData = await request.json();
            } catch (e) {
                return new Response("Invalid JSON body", { status: 400 });
            }
            
            // Store the last update and save it to persistent storage
            this.lastUpdate = updateData;
            await this.state.storage.put('lastUpdate', updateData);
            
            // Notify all connected clients (WebSockets)
            this.broadcast(updateData);
            
            return new Response("Update pushed successfully.", { status: 200 });
        }
        
        // 2. Handle WebSocket connections (for client viewing the changes live)
        if (url.pathname === "/websocket") {
            const pair = new WebSocketPair();
            await this.handleWebSocket(pair[1]);
            return new Response(null, { status: 101, webSocket: pair[0] });
        }

        return new Response("Not Found", { status: 404 });
    }
    
    // Simple broadcast function to send updates to all connected clients
    broadcast(message) {
        const data = JSON.stringify(message);
        this.sessions = this.sessions.filter(session => {
            try {
                session.send(data);
                return true;
            } catch (e) {
                // Remove broken session
                return false;
            }
        });
    }
    
    // Function to handle incoming WebSocket connections
    async handleWebSocket(webSocket) {
        webSocket.accept();
        this.sessions.push(webSocket);
        
        // Send the last state immediately upon connection
        webSocket.send(JSON.stringify(this.lastUpdate));
        
        webSocket.addEventListener('close', () => {
            this.sessions = this.sessions.filter(s => s !== webSocket);
        });
    }
}