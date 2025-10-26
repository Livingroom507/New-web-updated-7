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
          return getSubscriptions({ env });
        case '/api/compound':
          return getCompound({ env });
        case '/api/affiliate':
          return getAffiliate({ env });
        default:
          return new Response('API endpoint not found', { status: 404 });
      }
    }

    // Serve static assets from the `public` directory.
    // The `ASSETS` binding is provided by the `[site]` config in wrangler.toml
    return env.ASSETS.fetch(request);
  },
};