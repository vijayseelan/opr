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
import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  venue: z.string().min(1, "Venue is required"),
  organizer: z.string().min(1, "Organizer is required"),
  attendance: z.string().min(1, "Attendance details are required"),
  impact: z.string().min(1, "Program impact is required"),
  summary: z.string().min(1, "Program summary is required"),
});

const CreateReport = () => {
  const [images, setImages] = useState<string[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
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
    },
  });

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.success("Report created successfully!");
    console.log({ ...values, images });
  }

  const downloadReport = async () => {
    if (!reportRef.current) return;

    const values = form.getValues();
    const reportElement = document.createElement('div');
    
    reportElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center; font-size: 16px; margin-bottom: 20px;">${values.title}</h1>
        
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div>
              <strong>Date:</strong> ${values.date}
            </div>
            <div>
              <strong>Time:</strong> ${values.time}
            </div>
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Venue:</strong> ${values.venue}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Organizer:</strong> ${values.organizer}
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Attendance:</strong>
          <p style="margin-top: 5px;">${values.attendance}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Program Impact:</strong>
          <p style="margin-top: 5px;">${values.impact}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Program Summary:</strong>
          <p style="margin-top: 5px;">${values.summary}</p>
        </div>
        
        ${images.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px;">
            ${images.map(image => `
              <img src="${image}" style="width: 100%; height: 100px; object-fit: cover;" />
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `${values.title || 'report'}.pdf`,
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Report</h1>
        <Button 
          onClick={downloadReport} 
          variant="outline" 
          className="gap-2"
          disabled={!form.formState.isValid}
        >
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>
      
      <div ref={reportRef}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (Tajuk)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter report title" {...field} />
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
                    <FormLabel>Date</FormLabel>
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
                    <FormLabel>Time</FormLabel>
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
                  <FormLabel>Venue (Tempat)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter venue" {...field} />
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
                  <FormLabel>Organizer (Penganjur)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organizer" {...field} />
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
                  <FormLabel>Attendance (Kehadiran)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter attendance details"
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
                  <FormLabel>Program Impact (Impak Program)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter program impact"
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
                  <FormLabel>Program Summary (Rumusan Program)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter program summary"
                      {...field}
                      rows={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Images</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              Create Report
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateReport;
