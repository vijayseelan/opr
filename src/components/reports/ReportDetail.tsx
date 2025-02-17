
import { format } from "date-fns";
import { Edit, Copy, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Report } from "@/types/report";
import { ThreeDPhotoCarousel } from "@/components/ui/3d-carousel";

interface ReportDetailProps {
  report: Report;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDuplicate: (report: Report) => void;
  onDownload: (report: Report) => void;
}

export const ReportDetail = ({
  report,
  onClose,
  onEdit,
  onDuplicate,
  onDownload,
}: ReportDetailProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold">{report.title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Date</h3>
                <p>{format(new Date(report.date), "dd MMMM yyyy")}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Time</h3>
                <p>{report.time}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Venue</h3>
              <p>{report.venue}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Organizer</h3>
              <p>{report.organizer}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Attendance</h3>
              <p>{report.attendance}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Program Impact</h3>
              <p>{report.impact}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Program Summary</h3>
              <p>{report.summary}</p>
            </div>

            {report.images && report.images.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Images</h3>
                <ThreeDPhotoCarousel images={report.images} />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => onEdit(report.id)}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => onDuplicate(report)}
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => onDownload(report)}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
