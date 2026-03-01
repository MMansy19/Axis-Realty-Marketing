export interface CaseStudyMetric {
  label_en: string;
  label_ar: string;
  value: number;
  suffix_en: string;
  suffix_ar: string;
}

export interface CaseStudy {
  id: string;
  project_name_en: string;
  project_name_ar: string;
  before_en: string[];
  before_ar: string[];
  after_metrics: CaseStudyMetric[];
  timeline_en: string;
  timeline_ar: string;
  slug: string;
}
