// Cloudflare Pages Worker - intercept all HTML requests, set no-cache headers
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Static assets: JS, CSS, images - let through normally
    if (path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|json|txt|csv)$/i)) {
      return env.ASSETS.fetch(request);
    }
    
    // Everything else (HTML pages, root) - always fresh
    const response = await env.ASSETS.fetch(request);
    
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
    newHeaders.set('Pragma', 'no-cache');
    newHeaders.set('Expires', '0');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
}
