export type Profile = {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
};

export type ComponentCard = {
  id: string;

  title: string;

  description: string;

  image_url: string;

  category: string;

  tags: string[];

  preview_url: string;

  github_url: string;

  likes_count: number;

  comments_count: number;

  views_count: number;

  created_at: string;

  user_id: string;

  profiles: {
    username: string;
    avatar_url: string;
  };
};