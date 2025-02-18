
export interface CustomField {
  id: string;
  name: {
    en: string;
    my: string;
  };
  type: 'text' | 'number' | 'date' | 'textarea';
  required: boolean;
  defaultValue?: string;
  order: number;
}

export interface TemplateSettings {
  id: string;
  created_at: string;
  user_id: string;
  school_name: string | null;
  school_logo: string | null;
  additional_logos: string[] | null;
  custom_fields: CustomField[];
  is_active: boolean;
  name: string;
  primary_color: string | null;
  secondary_color: string | null;
  language: 'en' | 'my';
}
