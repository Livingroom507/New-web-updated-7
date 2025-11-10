// functions/index.js

// 1. Import the Durable Object class from its definition file
import { CollaborationRoom } from './collaboration-room.js';

// 2. Export the class so the runtime can find it
export { CollaborationRoom };

// You can optionally export a default fetch handler, but exporting the DO class is the key.
export default {
    async fetch(request, env, ctx) {
        return new Response("This worker is primarily for Durable Objects.", { status: 200 });
    }
};