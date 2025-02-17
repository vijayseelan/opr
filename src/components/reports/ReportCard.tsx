
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { Report } from "@/types/report";
import { BentoCard } from "@/components/ui/bento-card";

interface ReportCardProps {
  report: Report;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export const ReportCard = ({ report, onClick }: ReportCardProps) => {
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
      colors={["#3B82F6", "#60A5FA", "#93C5FD"]}
      delay={0.2}
      onClick={onClick}
    />
  );
};
