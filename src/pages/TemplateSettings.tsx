
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { CustomField } from "@/types/template";
import { FormFieldsSection } from "@/components/template/FormFieldsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  school_name: z.string().min(1, "School name is required"),
  school_logo: z.string().optional(),
  additional_logos: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TemplateSettings = () => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      school_name: "",
      school_logo: "",
      additional_logos: [],
    },
  });

  const { data: templateSettings } = useQuery({
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

  useEffect(() => {
    if (templateSettings) {
      form.reset({
        school_name: templateSettings.school_name || "",
        school_logo: templateSettings.school_logo || "",
        additional_logos: templateSettings.additional_logos || [],
      });
      // Parse custom fields from JSON if necessary
      const fields = templateSettings.custom_fields as CustomField[] || [];
      setCustomFields(fields);
    }
  }, [templateSettings, form]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>, field: "school_logo" | "additional_logos") => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            if (field === "school_logo") {
              form.setValue("school_logo", e.target.result as string);
            } else {
              const currentLogos = form.getValues("additional_logos") || [];
              form.setValue("additional_logos", [...currentLogos, e.target.result as string]);
            }
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please upload only image files");
      }
    });
  };

  const removeLogo = (index: number) => {
    const currentLogos = form.getValues("additional_logos") || [];
    form.setValue(
      "additional_logos",
      currentLogos.filter((_, i) => i !== index)
    );
  };

  async function onSubmit(values: FormValues) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to save settings");
        return;
      }

      // Convert customFields to a plain object for Supabase
      const customFieldsData = customFields.map(field => ({
        ...field,
        name: {
          en: field.name.en,
          my: field.name.my
        }
      }));

      const { error } = await supabase
        .from("template_settings")
        .upsert({
          user_id: user.id,
          school_name: values.school_name,
          school_logo: values.school_logo,
          additional_logos: values.additional_logos,
          custom_fields: customFieldsData,
          is_active: true,
          name: values.school_name // Use school name as template name
        });

      if (error) throw error;
      toast.success("Template settings saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save template settings");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Template Settings</h1>
      
      <Tabs defaultValue="header">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="header">Header Settings</TabsTrigger>
          <TabsTrigger value="fields">Form Fields</TabsTrigger>
        </TabsList>
        
        <TabsContent value="header" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="school_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter school name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>School Logo</FormLabel>
                {form.watch("school_logo") && (
                  <div className="relative w-40 h-40">
                    <img
                      src={form.watch("school_logo")}
                      alt="School logo"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => form.setValue("school_logo", "")}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                )}
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-40 h-40 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                    <ImagePlus className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, "school_logo")}
                      className="hidden"
                    />
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <FormLabel>Additional Logos</FormLabel>
                <div className="grid grid-cols-3 gap-4">
                  {form.watch("additional_logos")?.map((logo, index) => (
                    <div key={index} className="relative w-40 h-40">
                      <img
                        src={logo}
                        alt={`Additional logo ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => removeLogo(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-40 h-40 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                      <ImagePlus className="h-8 w-8 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">Add Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, "additional_logos")}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Save Settings
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="fields" className="space-y-6">
          <div className="space-y-6">
            <FormFieldsSection
              fields={customFields}
              onChange={setCustomFields}
            />
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              className="w-full"
            >
              Save Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateSettings;
