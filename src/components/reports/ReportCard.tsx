
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Report } from "@/types/report";

interface ReportCardProps {
  report: Report;
  onClick: () => void;
}

export const ReportCard = ({ report, onClick }: ReportCardProps) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          {report.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Date: {format(new Date(report.date), "dd MMMM yyyy")}
          <br />
          Venue: {report.venue}
        </p>
      </CardContent>
    </Card>
  );
};
