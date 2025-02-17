
export interface Report {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  attendance: string;
  impact: string;
  summary: string;
  images: string[] | null;
  user_id: string;
  created_at: string;
}
