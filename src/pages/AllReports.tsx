
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, Edit, Copy, Download, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { Link } from "react-router-dom";

interface Report {
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
  created_at: string;  // Added this field to match the database schema
}

const AllReports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch reports");
        throw error;
      }
      return data as Report[];
    },
  });

  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadReport = async (report: Report) => {
    const reportElement = document.createElement("div");
    reportElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center; font-size: 16px; margin-bottom: 20px;">${report.title}</h1>
        
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div>
              <strong>Date:</strong> ${report.date}
            </div>
            <div>
              <strong>Time:</strong> ${report.time}
            </div>
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Venue:</strong> ${report.venue}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Organizer:</strong> ${report.organizer}
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Attendance:</strong>
          <p style="margin-top: 5px;">${report.attendance}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Program Impact:</strong>
          <p style="margin-top: 5px;">${report.impact}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Program Summary:</strong>
          <p style="margin-top: 5px;">${report.summary}</p>
        </div>
        
        ${report.images?.length ? `
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px;">
            ${report.images.map(image => `
              <img src="${image}" style="width: 100%; height: 100px; object-fit: cover;" />
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `${report.title || 'report'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      toast.loading("Generating PDF...");
      await html2pdf().set(opt).from(reportElement).save();
      toast.success("Report downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error(error);
    }
  };

  const duplicateReport = async (report: Report) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to duplicate reports");
        return;
      }

      const { id, created_at, user_id, ...reportData } = report;
      const { error } = await supabase
        .from("reports")
        .insert([{ ...reportData, title: `${reportData.title} (Copy)`, user_id: user.id }]);

      if (error) throw error;

      toast.success("Report duplicated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to duplicate report");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Reports</h1>
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <Card
            key={report.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedReport(report)}
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
        ))}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">{selectedReport.title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedReport(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Date</h3>
                    <p>{format(new Date(selectedReport.date), "dd MMMM yyyy")}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Time</h3>
                    <p>{selectedReport.time}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Venue</h3>
                  <p>{selectedReport.venue}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Organizer</h3>
                  <p>{selectedReport.organizer}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Attendance</h3>
                  <p>{selectedReport.attendance}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Program Impact</h3>
                  <p>{selectedReport.impact}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Program Summary</h3>
                  <p>{selectedReport.summary}</p>
                </div>

                {selectedReport.images && selectedReport.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Images</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedReport.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Report image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" asChild>
                  <Link to={`/edit-report/${selectedReport.id}`} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => duplicateReport(selectedReport)}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => downloadReport(selectedReport)}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllReports;
