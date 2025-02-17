
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, Download, Eye, Pencil } from "lucide-react";
import { Report } from "@/types/report";
import { format } from "date-fns";
import { ReportPreview } from "./ReportPreview";
import { useState } from "react";

interface ReportDetailProps {
  report: Report;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDuplicate: (report: Report) => Promise<void>;
  onDownload: (report: Report) => Promise<void>;
}

export const ReportDetail = ({
  report,
  onClose,
  onEdit,
  onDuplicate,
  onDownload,
}: ReportDetailProps) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <Sheet open onOpenChange={onClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{report.title}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => onEdit(report.id)}
                className="flex-1"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => onDuplicate(report)}
                className="flex-1"
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                onClick={() => onDownload(report)}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-muted-foreground">Date</h3>
                <p>{format(new Date(report.date), "MMMM d, yyyy")}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground">Time</h3>
                <p>{report.time}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground">Venue</h3>
                <p>{report.venue}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground">Organizer</h3>
                <p>{report.organizer}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground">Attendance</h3>
                <p>{report.attendance}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground">Program Impact</h3>
                <p>{report.impact}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground">Program Summary</h3>
                <p>{report.summary}</p>
              </div>
              {report.images && report.images.length > 0 && (
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Event Photos
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {report.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Event photo ${index + 1}`}
                        className="rounded-lg object-cover w-full aspect-video"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ReportPreview
        report={report}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
};
