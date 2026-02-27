export interface BlogImage {
  id: string;
  blog_id: string;
  url: string;
  file_id: string;
  thumbnail_url: string | null;
  display_order: number;
  created_at: string;
}

export interface Blog {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  video_url: string | null;
  video_public_id: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  blog_images?: BlogImage[];
}

export interface BlogFormData {
  title_en: string;
  title_ar: string;
  slug: string;
  video_url?: string | null;
  video_public_id?: string | null;
  is_published: boolean;
  display_order: number;
  images: {
    url: string;
    file_id: string;
    thumbnail_url?: string;
    display_order: number;
  }[];
}
