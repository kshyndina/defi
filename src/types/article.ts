export interface Article {
  id: string;
  title: string;
  content: string;
  preview?: string;
  category: string;
  tags: string[];
  url: string;
  date?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}