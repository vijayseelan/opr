
import { FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Report } from "@/types/report";

interface ReportCardProps {
  report: Report;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export const ReportCard = ({ report, onClick, onDelete }: ReportCardProps) => {
  return (
    <Card
      className="relative cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div 
        className="absolute top-4 right-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <AlertDialog>
          <AlertDialogTrigger>
            <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive transition-colors" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Report</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this report? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(report.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div onClick={onClick}>
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
      </div>
    </Card>
  );
};
