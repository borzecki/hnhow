export type ResourceStatus = "idle" | "loading" | "failed";

export interface NewsHit {
  created_at: string;
  title: string;
  text: string;
  url: string;
  author: string;
  points: number;
  num_comments: number;
  objectID: string;
  isHidden: boolean;
}

export interface NewsDetails {
  created_at: string;
  children: NewsComment[];
  title: string;
  text: string;
  url: string;
  author: string;
  points: number;
  id: number;
}

export interface NewsComment {
  author: string;
  children: NewsComment[];
  created_at: string;
  text: string;
  title: string;
  points?: number;
  id: number;
}
