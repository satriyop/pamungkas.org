
export interface BlogPost {
  id: string;
  title: string;
  date: string;
  content: string;
}

export enum Page {
  HOME = 'HOME',
  RESUME = 'RESUME',
  BLOG = 'BLOG',
  POST = 'POST'
}
