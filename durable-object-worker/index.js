// collaboration-do-worker/index.js

// Import the class from your collaboration-room.js
import { CollaborationRoom } from './collaboration-room.js'; 

// CRUCIAL: Export the class and the default fetch handler
export { CollaborationRoom };

// The default fetch handler for the DO Worker must be exported, 
// even if it just routes requests to the DO.
export default {
    async fetch(request, env, ctx) {
        // Example: Route all incoming requests to the DO
        const stub = env.COLLAB_ROOM.getByName('single-room'); // Use a fixed name for simplicity
        return stub.fetch(request);
    }
};