interface Env {
  GITHUB_TOKEN?: string;
}

const ALLOWED_PATH_PATTERNS = [
  // Allow user's public repos and activity events
  /^users\/satriyop\/(repos|events)$/,
  // Allow repo readme and commit details/lists strictly for satriyop repositories
  /^repos\/satriyop\/[a-zA-Z0-9._-]+\/(readme|commits(\/[a-zA-Z0-9._-]+)?)$/,
];

const ALLOWED_QUERY_PARAMS = new Set(['per_page', 'page', 'sort', 'direction']);

function isPathAllowed(path: string): boolean {
  return ALLOWED_PATH_PATTERNS.some(pattern => pattern.test(path));
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  // 1. Restrict HTTP Methods: only allow read-only GET and HEAD
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Allow': 'GET, HEAD',
        },
      }
    );
  }

  // 2. Validate and sanitize the requested API path
  const rawPath = params.path;
  const pathSegments = Array.isArray(rawPath)
    ? rawPath
    : typeof rawPath === 'string'
      ? [rawPath]
      : [];

  const apiPath = pathSegments.join('/').replace(/^\/+|\/+$/g, '');

  if (!apiPath || !isPathAllowed(apiPath)) {
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: 'The requested path is not allowed through this proxy.',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 3. Sanitize query parameters to prevent unauthorized param manipulation
  const requestUrl = new URL(request.url);
  const sanitizedParams = new URLSearchParams();
  for (const [key, value] of requestUrl.searchParams.entries()) {
    if (ALLOWED_QUERY_PARAMS.has(key)) {
      sanitizedParams.set(key, value);
    }
  }

  const queryString = sanitizedParams.toString() ? `?${sanitizedParams.toString()}` : '';
  const githubUrl = `https://api.github.com/${apiPath}${queryString}`;

  // 4. Construct outbound request headers
  const headers = new Headers();
  headers.set('User-Agent', 'Pamungkas-Org-App');
  headers.set('Accept', 'application/vnd.github.v3+json');

  if (env.GITHUB_TOKEN) {
    headers.set('Authorization', `token ${env.GITHUB_TOKEN}`);
  }

  try {
    const upstreamResponse = await fetch(githubUrl, {
      method: request.method,
      headers,
    });

    const responseHeaders = new Headers();
    responseHeaders.set(
      'Content-Type',
      upstreamResponse.headers.get('content-type') || 'application/json'
    );
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    // Edge cache for 5 minutes, allow stale-while-revalidate for 10 minutes
    responseHeaders.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
    );

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown proxy error';
    return new Response(
      JSON.stringify({
        error: 'Proxy Error',
        message,
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
