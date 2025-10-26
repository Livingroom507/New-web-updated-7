import { onRequestGet as getSubscriptions } from './api/subscriptions.js';
import { onRequestGet as getCompound } from './api/compound.js';
import { onRequestGet as getAffiliate } from './api/affiliate.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API routes
    if (url.pathname.startsWith('/api/')) {
      switch (url.pathname) {
        case '/api/subscriptions':
          return getSubscriptions({ request, env, ctx });
        case '/api/compound':
          return getCompound({ request, env, ctx });
        case '/api/affiliate':
          return getAffiliate({ request, env, ctx });
        default:
          return new Response('API endpoint not found', { status: 404 });
      }
    }

    // Serve static assets from the __STATIC_CONTENT binding
    return env.__STATIC_CONTENT.fetch(request);
  },
};