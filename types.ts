
export interface BlogPost {
  id: string;
  title: string;
  date: string;
  content: string;
}

export interface XSignal {
  id: string;
  url: string;
  created_at: string;
  text: string;
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

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
}

export interface GithubReadmeResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  content: string;
  encoding: string;
}

export interface GithubCommitDetail {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
}

export enum Page {
  HOME = 'HOME',
  RESUME = 'RESUME',
  BLOG = 'BLOG',
  POST = 'POST'
}
