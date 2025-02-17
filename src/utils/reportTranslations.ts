
interface TranslationType {
  title: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  attendance: string;
  impact: string;
  summary: string;
  teacher_name: string;
  teacher_designation: string;
  event_photos: string;
}

export const translations: Record<'en' | 'my', TranslationType> = {
  en: {
    title: "Title",
    date: "Date",
    time: "Time",
    venue: "Venue",
    organizer: "Organizer",
    attendance: "Attendance",
    impact: "Program Impact",
    summary: "Program Summary",
    teacher_name: "Teacher's Name",
    teacher_designation: "Teacher's Designation",
    event_photos: "Event Photos"
  },
  my: {
    title: "Tajuk",
    date: "Tarikh",
    time: "Masa",
    venue: "Tempat",
    organizer: "Penganjur",
    attendance: "Kehadiran",
    impact: "Impak Program",
    summary: "Rumusan Program",
    teacher_name: "Nama Guru",
    teacher_designation: "Jawatan",
    event_photos: "Gambar Program"
  }
};
