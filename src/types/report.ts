
export interface Report {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  attendance: string;
  impact: string;
  summary: string;
  images?: string[];
  teacher_name: string;
  teacher_designation: string;
  language: 'en' | 'my';
  custom_field_values?: Record<string, string>;
}
