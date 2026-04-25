// Cloudflare Pages Functions Middleware
// Force no-cache headers for all responses

export async function onRequest(context) {
  const response = await context.next();
  
  const newHeaders = new Headers(response.headers);
  
  // Add a marker so we know middleware is running
  newHeaders.set('X-FS-Middleware', 'active');
  
  // Override ALL cache headers for HTML
  const contentType = newHeaders.get('content-type') || '';
  
  newHeaders.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  newHeaders.set('Pragma', 'no-cache');
  newHeaders.set('Expires', '0');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
