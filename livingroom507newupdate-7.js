// Dummy script to satisfy the Cloudflare Pages deployment validator.
export default {
    fetch(request) {
        return new Response("OK", { status: 200 });
    },
};