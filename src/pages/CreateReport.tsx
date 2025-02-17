import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ImagePlus, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Report } from "@/types/report";
import { translations } from "@/utils/reportTranslations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  venue: z.string().min(1, "Venue is required"),
  organizer: z.string().min(1, "Organizer is required"),
  attendance: z.string().min(1, "Attendance details are required"),
  impact: z.string().min(1, "Program impact is required"),
  summary: z.string().min(1, "Program summary is required"),
  teacher_name: z.string().min(1, "Teacher's name is required"),
  teacher_designation: z.string().min(1, "Teacher's designation is required"),
});

type FormValues = z.infer<typeof formSchema>;

const CreateReport = () => {
  const [images, setImages] = useState<string[]>([]);
  const [language, setLanguage] = useState<'en' | 'my'>('en');
  const reportRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const t = translations[language];

  const getPlaceholder = (fieldName: string) => {
    return language === 'en' ? 
      `Enter ${fieldName.toLowerCase()}` : 
      `Masukkan ${fieldName.toLowerCase()}`;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: "",
      time: "",
      venue: "",
      organizer: "",
      attendance: "",
      impact: "",
      summary: "",
      teacher_name: "",
      teacher_designation: "",
    },
  });

  const { data: report, isError } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        toast.error("Failed to fetch report");
        throw error;
      }
      
      if (!data) {
        toast.error("Report not found");
        navigate("/all-reports");
        return null;
      }
      
      return data as Report;
    },
    enabled: isEditing,
  });

  const { data: templateSettings, isLoading: isTemplateLoading } = useQuery({
    queryKey: ["templateSettings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("template_settings")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        toast.error("Failed to fetch template settings");
        throw error;
      }

      return data;
    },
  });

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = src;
    });
  };

  useEffect(() => {
    if (report) {
      form.reset({
        title: report.title,
        date: report.date,
        time: report.time,
        venue: report.venue,
        organizer: report.organizer,
        attendance: report.attendance,
        impact: report.impact,
        summary: report.summary,
        teacher_name: report.teacher_name,
        teacher_designation: report.teacher_designation,
      });
      if (report.images) {
        setImages(report.images);
      }
      if (report.language) {
        setLanguage(report.language);
      }
    }
  }, [report, form]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please upload only image files");
      }
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to create a report");
        return;
      }

      const reportData: Omit<Report, 'id' | 'created_at'> = {
        title: values.title,
        date: values.date,
        time: values.time,
        venue: values.venue,
        organizer: values.organizer,
        attendance: values.attendance,
        impact: values.impact,
        summary: values.summary,
        teacher_name: values.teacher_name,
        teacher_designation: values.teacher_designation,
        images: images,
        user_id: user.id,
        language: language
      };

      if (isEditing) {
        const { error } = await supabase
          .from('reports')
          .update(reportData)
          .eq('id', id!);

        if (error) throw error;
        toast.success("Report updated successfully!");
      } else {
        const { error } = await supabase
          .from('reports')
          .insert([reportData]);

        if (error) throw error;
        toast.success("Report created successfully!");
      }

      navigate('/all-reports');
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} report`);
      console.error('Error with report:', error);
    }
  };

  const downloadReport = async () => {
    if (!reportRef.current) return;
    
    try {
      toast.loading("Preparing PDF...");

      const imagesToPreload: string[] = [];
      if (templateSettings?.school_logo) {
        imagesToPreload.push(templateSettings.school_logo);
      }
      if (templateSettings?.additional_logos?.length) {
        imagesToPreload.push(...templateSettings.additional_logos);
      }
      if (images.length) {
        imagesToPreload.push(...images);
      }

      await Promise.all(imagesToPreload.map(preloadImage));

      const values = form.getValues();
      const reportElement = document.createElement('div');
      
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
      
      reportElement.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          ${headerHtml}
          
          <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px; color: #1a1f2c;">${values.title}</h1>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr style="background-color: #F1F0FB;">
              <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold; width: 30%;">Date</td>
              <td style="padding: 12px; border: 1px solid #8E9196;">${values.date}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold; background-color: #F1F0FB;">Time</td>
              <td style="padding: 12px; border: 1px solid #8E9196;">${values.time}</td>
            </tr>
            <tr style="background-color: #F1F0FB;">
              <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold;">Venue</td>
              <td style="padding: 12px; border: 1px solid #8E9196;">${values.venue}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold; background-color: #F1F0FB;">Organizer</td>
              <td style="padding: 12px; border: 1px solid #8E9196;">${values.organizer}</td>
            </tr>
            <tr style="background-color: #F1F0FB;">
              <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold;">Attendance</td>
              <td style="padding: 12px; border: 1px solid #8E9196;">${values.attendance}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold; background-color: #F1F0FB;">Program Impact</td>
              <td style="padding: 12px; border: 1px solid #8E9196;">${values.impact}</td>
            </tr>
            <tr style="background-color: #F1F0FB;">
              <td style="padding: 12px; border: 1px solid #8E9196; font-weight: bold;">Program Summary</td>
              <td style="padding: 12px; border: 1px solid #8E9196;">${values.summary}</td>
            </tr>
          </table>
          
          ${images.length > 0 ? `
            <div style="margin-top: 30px; margin-bottom: 30px;">
              <h2 style="font-size: 18px; margin-bottom: 15px; color: #1a1f2c;">Event Photos</h2>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
                ${images.map(image => `
                  <div style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <img src="${image}" style="width: 100%; height: 200px; object-fit: cover;" />
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd;">
            <div style="text-align: right;">
              <p style="margin-bottom: 5px; font-size: 14px;"><strong>Teacher's Name:</strong> ${values.teacher_name}</p>
              <p style="font-size: 14px;"><strong>Designation:</strong> ${values.teacher_designation}</p>
            </div>
          </div>
        </div>
      `;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${values.title || 'report'}.pdf`,
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
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 md:px-0">
      {templateSettings && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            {templateSettings.school_logo && (
              <img 
                src={templateSettings.school_logo} 
                alt="School Logo" 
                className="h-12 md:h-16 object-contain mx-auto md:mx-0"
              />
            )}
            <h2 className="text-xl md:text-2xl font-bold text-center flex-1" style={{ color: templateSettings.primary_color || '#1a1f2c' }}>
              {templateSettings.school_name}
            </h2>
            {templateSettings.additional_logos?.[0] && (
              <img 
                src={templateSettings.additional_logos[0]} 
                alt="Additional Logo" 
                className="h-12 md:h-16 object-contain mx-auto md:mx-0"
              />
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">
          {isEditing ? "Edit Report" : "Create New Report"}
        </h1>
        <div className="flex flex-col md:flex-row gap-3">
          <Select
            value={language}
            onValueChange={(value: 'en' | 'my') => setLanguage(value)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="my">Bahasa Melayu</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={downloadReport} 
            variant="outline" 
            className="gap-2 w-full md:w-auto"
            disabled={!form.formState.isValid}
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
      
      <div ref={reportRef}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.title}</FormLabel>
                  <FormControl>
                    <Input placeholder={getPlaceholder(t.title)} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.date}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.time}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.venue}</FormLabel>
                  <FormControl>
                    <Input placeholder={getPlaceholder(t.venue)} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organizer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.organizer}</FormLabel>
                  <FormControl>
                    <Input placeholder={getPlaceholder(t.organizer)} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attendance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.attendance}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={getPlaceholder(t.attendance)}
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.impact}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={getPlaceholder(t.impact)}
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.summary}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={getPlaceholder(t.summary)}
                      {...field}
                      rows={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="teacher_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.teacher_name}</FormLabel>
                    <FormControl>
                      <Input placeholder={getPlaceholder(t.teacher_name)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teacher_designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.teacher_designation}</FormLabel>
                    <FormControl>
                      <Input placeholder={getPlaceholder(t.teacher_designation)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel>{t.event_photos}</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Uploaded image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <ImagePlus className="h-8 w-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Add Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full">
              {isEditing ? "Update Report" : "Create Report"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateReport;
