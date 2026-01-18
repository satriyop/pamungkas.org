export const onRequest: PagesFunction<{ GITHUB_TOKEN: string }> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  
  const apiPath = (params.path as string[]).join('/');
  const githubUrl = `https://api.github.com/${apiPath}${url.search}`;

  const headers = new Headers();
  headers.set('User-Agent', 'Pamungkas-Org-App');
  headers.set('Accept', 'application/vnd.github.v3+json');
  
  if (env.GITHUB_TOKEN) {
    // Using 'token' prefix which is most standard for GitHub Classic PATs
    headers.set('Authorization', `token ${env.GITHUB_TOKEN}`);
  }

  try {
    const response = await fetch(githubUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    return new Response(isJson ? JSON.stringify(data) : data, {
      status: response.status,
      headers: {
        'Content-Type': isJson ? 'application/json' : 'text/plain',
        'Access-Control-Allow-Origin': '*',
        // Useful for debugging: tells us if the function actually SAW a token
        'X-Proxy-Auth-State': env.GITHUB_TOKEN ? 'token-present' : 'token-missing',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: 'Proxy Error', 
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
