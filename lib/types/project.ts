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
