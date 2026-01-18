export const onRequest: PagesFunction<{ GITHUB_TOKEN: string }> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  
  // Extract the path after /api/
  // params.path is an array because of [[path]].ts
  const apiPath = (params.path as string[]).join('/');
  const githubUrl = `https://api.github.com/${apiPath}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set('User-Agent', 'Pamungkas-Org-App');
  
  if (env.GITHUB_TOKEN) {
    headers.set('Authorization', `Bearer ${env.GITHUB_TOKEN}`);
  }

  // Remove host header to avoid conflicts with GitHub
  headers.delete('host');

  try {
    const response = await fetch(githubUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });

    // Create a new response to modify headers if needed
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    
    return newResponse;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from GitHub' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
