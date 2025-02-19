import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Report } from "@/types/report";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { translations } from "@/utils/reportTranslations";

interface ProcessedImage {
  url: string;
  isPortrait: boolean;
  aspectRatio: number;
}

interface ReportPreviewProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportPreview = ({ report, isOpen, onClose }: ReportPreviewProps) => {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const language = report.language || 'en';
  const t = translations[language];

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
          aspectRatio: 16/9, // default aspect ratio if image fails to load
        });
      };
      img.src = url;
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
        <h2 style="font-size: 18px; margin-bottom: 15px; color: #1a1f2c;">${t.event_photos}</h2>
        ${portraitHtml}
        ${landscapeHtml}
      </div>
    `;
  };

  useEffect(() => {
    const generatePreview = async () => {
      try {
        if (report.images?.length) {
          const processed = await Promise.all(report.images.map(processImage));
          setProcessedImages(processed);
        }

        const { data: templateSettings } = await supabase
          .from("template_settings")
          .select("*")
          .eq("user_id", report.user_id)
          .eq("is_active", true)
          .single();

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

        const html = `
          <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
            ${headerHtml}
            
            <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px; color: #1a1f2c;">${report.title}</h1>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="background-color: #F1F0FB;">
                <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold; width: 30%;">${t.date}</td>
                <td style="padding: 12px; border: 1px solid #8E9196;">${report.date}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold; background-color: #F1F0FB;">${t.time}</td>
                <td style="padding: 12px; border: 1px solid #8E9196;">${report.time}</td>
              </tr>
              <tr style="background-color: #F1F0FB;">
                <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold;">${t.venue}</td>
                <td style="padding: 12px; border: 1px solid #8E9196;">${report.venue}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold; background-color: #F1F0FB;">${t.organizer}</td>
                <td style="padding: 12px; border: 1px solid #8E9196;">${report.organizer}</td>
              </tr>
              <tr style="background-color: #F1F0FB;">
                <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold;">${t.attendance}</td>
                <td style="padding: 12px; border: 1px solid #8E9196;">${report.attendance}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold; background-color: #F1F0FB;">${t.impact}</td>
                <td style="padding: 12px; border: 1px solid #8E9196;">${report.impact}</td>
              </tr>
              <tr style="background-color: #F1F0FB;">
                <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold;">${t.summary}</td>
                <td style="padding: 12px; border: 1px solid #8E9196;">${report.summary}</td>
              </tr>
            </table>
            
            ${imagesHtml}

            <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd;">
              <div style="text-align: right;">
                <p style="margin-bottom: 5px; font-size: 14px;"><strong>${t.teacher_name}:</strong> ${report.teacher_name}</p>
                <p style="font-size: 14px;"><strong>${t.teacher_designation}:</strong> ${report.teacher_designation}</p>
              </div>
            </div>
          </div>
        `;

        setPreviewHtml(html);
      } catch (error) {
        console.error('Preview generation error:', error);
        toast.error("Failed to generate preview");
      }
    };

    if (isOpen) {
      generatePreview();
    }
  }, [isOpen, report, t]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[90vw] sm:max-w-[90vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Report Preview</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
