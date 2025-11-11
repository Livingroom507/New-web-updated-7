// durable-object-worker/collaboration-room.js

export class CollaborationRoom {
    constructor(state, env) {
        this.state = state;
        this.sessions = []; // Array to hold WebSocket connections
        this.lastUpdate = {}; 
        
        // Load persistent state upon initialization
        this.state.blockConcurrencyWhile(async () => {
            this.lastUpdate = await this.state.storage.get('lastUpdate') || {};
        });
    }

    async fetch(request) {
        const url = new URL(request.url);
        
        // Handle the internal push request from the Pages Function
        if (url.pathname.endsWith('/push-update')) {
            let updateData;
            try {
                updateData = await request.json();
            } catch (e) {
                return new Response("Invalid JSON body", { status: 400 });
            }
            
            this.lastUpdate = updateData;
            await this.state.storage.put('lastUpdate', updateData);
            this.broadcast(updateData);
            
            return new Response("Update pushed successfully.", { status: 200 });
        }
        
        // Handle WebSocket connections (for live viewing, if implemented)
        if (url.pathname === "/websocket") {
            // ... (Your WebSocket implementation goes here) ...
            return new Response("WebSocket logic not implemented.", { status: 501 });
        }

        return new Response("DO Not Found", { status: 404 });
    }
    
    // Simple placeholder for the required broadcast function
    broadcast(message) {
        // This function would send JSON.stringify(message) to all this.sessions
    }
}