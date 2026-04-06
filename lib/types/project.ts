export type ProjectStatus = 'launching' | 'selling' | 'sold_out' | 'construction';

export interface Project {
  id: string;
  name_en: string;
  name_ar: string;
  location_en: string;
  location_ar: string;
  status: ProjectStatus;
  cover_image: string;
  summary_en: string;
  summary_ar: string;
  slug: string;
  case_study_slug?: string;
}

// --- Finishing Projects ---

export type PropertyType = 'apartment' | 'villa' | 'building';

export interface FinishingProject {
  id: string;
  title_en: string;
  title_ar: string;
  slug: string;
  description_en?: string;
  description_ar?: string;
  location_en?: string;
  location_ar?: string;
  property_type?: PropertyType;
  area?: number;
  completion_date?: string;
  cover_image_url?: string;
  cover_image_file_id?: string;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  finishing_media?: FinishingMedia[];
}

export interface FinishingMedia {
  id: string;
  project_id: string;
  type: 'image' | 'video';
  url: string;
  file_id?: string;
  public_id?: string;
  thumbnail_url?: string;
  is_before: boolean;
  display_order: number;
  created_at: string;
}
