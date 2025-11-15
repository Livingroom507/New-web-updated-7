// do-worker/index.js
import { CollaborationRoom } from './collaboration-room.js';

export default {
  async fetch(request, env) {
    // This worker should only receive DO requests, so fetch is minimal
    return new Response("DO Worker running.", { status: 200 });
  },
};

export { CollaborationRoom };