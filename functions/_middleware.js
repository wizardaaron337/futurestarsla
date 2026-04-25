// Cloudflare Pages Functions Middleware
// Runs on every request, sets no-cache headers for HTML

export async function onRequest(context) {
  const response = await context.next();
  
  const contentType = response.headers.get('content-type') || '';
  
  // Only modify HTML responses
  if (contentType.includes('text/html')) {
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
  
  return response;
}
