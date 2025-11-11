// durable-object-worker/index.js

// 1. Import the class from the definition file
import { CollaborationRoom } from './collaboration-room.js';

// 2. Export ONLY the class so the Cloudflare runtime can instantiate it.
export { CollaborationRoom };

// NOTE: DO NOT include an 'export default { fetch(...) }' handler here.
// This is critical for DO Workers running in a separate script.
