export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Try to serve the exact file first
    const response = await env.ASSETS.fetch(request);
    
    // If file not found, serve index.html for SPA routing
    if (response.status === 404) {
      return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
    }
    
    return response;
  }
};
