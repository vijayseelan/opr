
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { Report } from "@/types/report";
import { BentoCard } from "@/components/ui/bento-card";

interface ReportCardProps {
  report: Report;
  onClick: () => void;
  onDelete: (id: string) => void;
}

// Array of color combinations for cards
const cardColors = [
  ["#3B82F6", "#60A5FA", "#93C5FD"], // Blue
  ["#EC4899", "#F472B6", "#FDB4D3"], // Pink
  ["#8B5CF6", "#A78BFA", "#C4B5FD"], // Purple
  ["#10B981", "#34D399", "#6EE7B7"], // Green
  ["#F59E0B", "#FBBF24", "#FCD34D"], // Yellow
  ["#EF4444", "#F87171", "#FCA5A5"], // Red
];

export const ReportCard = ({ report, onClick }: ReportCardProps) => {
  // Get a random color combination based on the report id
  const colorIndex = parseInt(report.id.slice(-1), 16) % cardColors.length;
  const colors = cardColors[colorIndex];

  return (
    <BentoCard
      title={
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {report.title}
        </div>
      }
      value={format(new Date(report.date), "dd MMMM yyyy")}
      subtitle={`Venue: ${report.venue}`}
      colors={colors}
      delay={0.2}
      onClick={onClick}
    />
  );
};
