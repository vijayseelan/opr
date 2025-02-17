
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { Report } from "@/types/report";

const REPORTS_PER_PAGE = 9;

interface ProcessedImage {
  url: string;
  isPortrait: boolean;
  aspectRatio: number;
}

interface PageData {
  reports: Report[];
  nextPage: number | undefined;
  totalCount: number;
}

export const useReports = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery<PageData>({
    queryKey: ["reports"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const from = pageParam * REPORTS_PER_PAGE;
      const to = from + REPORTS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from("reports")
        .select("*", { count: 'exact' })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        toast.error("Failed to fetch reports");
        throw error;
      }

      const totalCount = count || 0;

      return {
        reports: data as Report[],
        nextPage: to < totalCount - 1 ? pageParam + 1 : undefined,
        totalCount,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  // Safely flatten the pages array to get all reports
  const reports = data?.pages.flatMap(page => page.reports) || [];

  const processImage = (url: string): Promise<ProcessedImage> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          url,
          isPortrait: img.naturalHeight > img.naturalWidth,
          aspectRatio: img.naturalWidth / img.naturalHeight,
        });
      };
      img.onerror = () => {
        resolve({
          url,
          isPortrait: false,
          aspectRatio: 16/9,
        });
      };
      // Add a cache breaker to force browser to load a fresh copy
      img.src = `${url}?${new Date().getTime()}`;
    });
  };

  const generateImagesHtml = (images: ProcessedImage[]) => {
    if (!images.length) return '';

    const portraitImages = images.filter(img => img.isPortrait);
    const landscapeImages = images.filter(img => !img.isPortrait);

    const portraitHtml = portraitImages.length ? `
      <div style="margin-bottom: 15px;">
        <div style="display: grid; grid-template-columns: repeat(${portraitImages.length <= 4 ? 2 : 3}, 1fr); gap: 15px;">
          ${portraitImages.map(image => `
            <div>
              <img src="${image.url}" 
                   style="width: 100%; height: 400px; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    const landscapeHtml = landscapeImages.length ? `
      <div style="margin-bottom: 15px;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          ${landscapeImages.map(image => `
            <div>
              <img src="${image.url}" 
                   style="width: 100%; height: 300px; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    return `
      <div style="margin-top: 30px; margin-bottom: 30px;">
        <h2 style="font-size: 18px; margin-bottom: 15px; color: #1a1f2c;">Event Photos</h2>
        ${portraitHtml}
        ${landscapeHtml}
      </div>
    `;
  };

  const downloadReport = async (report: Report) => {
    const toastId = toast.loading("Generating PDF...");
    
    try {
      const { data: templateSettings } = await supabase
        .from("template_settings")
        .select("*")
        .eq("user_id", report.user_id)
        .eq("is_active", true)
        .single();

      // Process images
      const processedImages = await Promise.all((report.images || []).map(processImage));

      const headerHtml = templateSettings ? `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #ddd;">
          ${templateSettings.school_logo ? `
            <img src="${templateSettings.school_logo}" alt="School Logo" style="height: 80px; object-fit: contain;" />
          ` : '<div style="width: 80px;"></div>'}
          
          <div style="text-align: center; flex-grow: 1; padding: 0 20px;">
            <h2 style="margin: 0; color: ${templateSettings.primary_color || '#1a1f2c'}; font-size: 24px;">
              ${templateSettings.school_name || ''}
            </h2>
          </div>
          
          ${templateSettings.additional_logos?.length ? `
            <img src="${templateSettings.additional_logos[0]}" alt="Additional Logo" style="height: 80px; object-fit: contain;" />
          ` : '<div style="width: 80px;"></div>'}
        </div>
      ` : '';

      const imagesHtml = generateImagesHtml(processedImages);

      const reportElement = document.createElement("div");
      reportElement.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          ${headerHtml}
          
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
          
          ${imagesHtml}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd;">
            <div style="text-align: right;">
              <p style="margin-bottom: 5px; font-size: 14px;"><strong>Teacher's Name:</strong> ${report.teacher_name}</p>
              <p style="font-size: 14px;"><strong>Designation:</strong> ${report.teacher_designation}</p>
            </div>
          </div>
        </div>
      `;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${report.title || 'report'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      await html2pdf().set(opt).from(reportElement).save();
      toast.dismiss(toastId);
      toast.success("Report downloaded successfully!");
    } catch (error) {
      toast.dismiss(toastId);
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    downloadReport,
    duplicateReport,
  };
};
