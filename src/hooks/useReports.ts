
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
        <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px; color: #1a1f2c;">${report.title}</h1>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tr style="background-color: #F1F0FB;">
            <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold; width: 30%;">Date</td>
            <td style="padding: 12px; border: 1px solid #8E9196;">${report.date}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold; background-color: #F1F0FB;">Time</td>
            <td style="padding: 12px; border: 1px solid #8E9196;">${report.time}</td>
          </tr>
          <tr style="background-color: #F1F0FB;">
            <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold;">Venue</td>
            <td style="padding: 12px; border: 1px solid #8E9196;">${report.venue}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold; background-color: #F1F0FB;">Organizer</td>
            <td style="padding: 12px; border: 1px solid #8E9196;">${report.organizer}</td>
          </tr>
          <tr style="background-color: #F1F0FB;">
            <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold;">Attendance</td>
            <td style="padding: 12px; border: 1px solid #8E9196;">${report.attendance}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold; background-color: #F1F0FB;">Program Impact</td>
            <td style="padding: 12px; border: 1px solid #8E9196;">${report.impact}</td>
          </tr>
          <tr style="background-color: #F1F0FB;">
            <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold;">Program Summary</td>
            <td style="padding: 12px; border: 1px solid #8E9196;">${report.summary}</td>
          </tr>
        </table>
        
        ${report.images?.length ? `
          <div style="margin-top: 30px;">
            <h2 style="font-size: 18px; margin-bottom: 15px; color: #1a1f2c;">Event Photos</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
              ${report.images.map(image => `
                <div style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <img src="${image}" style="width: 100%; height: 200px; object-fit: cover;" />
                </div>
              `).join('')}
            </div>
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
