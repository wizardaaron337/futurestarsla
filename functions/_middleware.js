// Cloudflare Pages Functions Middleware
// Force fresh content: intercept every request, replace headers

export async function onRequest(context) {
  const response = await context.next();
  
  // Build new response with no-cache headers
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  newHeaders.set('Pragma', 'no-cache');
  newHeaders.set('Expires', '0');
  newHeaders.set('Surrogate-Control', 'no-store');
  newHeaders.set('X-FS-Middleware', 'active');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
