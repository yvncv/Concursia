export interface ForumType {
  id: string;
  title: string;
  description: string;
  category: string;
  createdByUid: string;
  createdByName: string;
  createdAt: Date;
  repliesCount: number;
  views: number;
}

export interface ReplyType {
  id: string;
  forumId: string;
  text: string;
  createdByUid: string;
  createdByName: string;
  createdAt: Date;
}