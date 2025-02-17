
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { Report } from "@/types/report";

export const useReports = () => {
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

  return {
    reports,
    isLoading,
    downloadReport,
    duplicateReport,
  };
};
