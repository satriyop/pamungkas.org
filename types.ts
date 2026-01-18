
export interface BlogPost {
  id: string;
  title: string;
  date: string;
  content: string;
}

export interface GithubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
    url: string;
  };
  payload: {
    commits?: Array<{
      sha: string;
      message: string;
      url: string;
    }>;
    ref?: string;
    head?: string;
    before?: string;
  };
  created_at: string;
}

export enum Page {
  HOME = 'HOME',
  RESUME = 'RESUME',
  BLOG = 'BLOG',
  POST = 'POST'
}
