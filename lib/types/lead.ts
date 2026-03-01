export interface Lead {
  id: string;
  full_name: string;
  company_name: string;
  phone: string;
  email: string;
  project_type: string;
  message: string;
  created_at: string;
}

export interface LeadFormData {
  full_name: string;
  company_name: string;
  phone: string;
  email: string;
  project_type: string;
  message: string;
}
