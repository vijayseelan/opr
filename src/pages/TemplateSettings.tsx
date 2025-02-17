
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImagePlus, Trash2 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const templateSettingsSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  headerText: z.string(),
  footerText: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  language: z.string(),
});

type TemplateSettingsValues = z.infer<typeof templateSettingsSchema>;

const TemplateSettings = () => {
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [additionalLogos, setAdditionalLogos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<TemplateSettingsValues>({
    resolver: zodResolver(templateSettingsSchema),
    defaultValues: {
      schoolName: "",
      headerText: "",
      footerText: "",
      primaryColor: "#000000",
      secondaryColor: "#666666",
      language: "en",
    },
  });

  const handleMainLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to upload logos");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setSchoolLogo(publicUrl);
      toast.success("Logo uploaded successfully");
    } catch (error: any) {
      toast.error("Error uploading logo");
      console.error("Error uploading logo:", error.message);
    }
  };

  const handleAdditionalLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to upload logos");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/additional_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setAdditionalLogos((prev) => [...prev, publicUrl]);
      toast.success("Additional logo uploaded successfully");
    } catch (error: any) {
      toast.error("Error uploading additional logo");
      console.error("Error uploading additional logo:", error.message);
    }
  };

  const removeAdditionalLogo = (index: number) => {
    setAdditionalLogos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: TemplateSettingsValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to save template settings");
        return;
      }

      const { error } = await supabase
        .from('template_settings')
        .upsert({
          user_id: user.id,
          school_name: values.schoolName,
          school_logo: schoolLogo,
          additional_logos: additionalLogos,
          primary_color: values.primaryColor,
          secondary_color: values.secondaryColor,
          language: values.language,
          header_text: values.headerText,
          footer_text: values.footerText,
        });

      if (error) throw error;

      toast.success("Template settings saved successfully");
    } catch (error: any) {
      toast.error("Error saving template settings");
      console.error("Error saving template settings:", error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Template Settings</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="schoolName"
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
                {schoolLogo ? (
                  <div className="relative w-48 h-48">
                    <img
                      src={schoolLogo}
                      alt="School logo"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setSchoolLogo(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                    <ImagePlus className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Upload School Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="space-y-4">
                <FormLabel>Additional Logos</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {additionalLogos.map((logo, index) => (
                    <div key={index} className="relative w-32 h-32">
                      <img
                        src={logo}
                        alt={`Additional logo ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeAdditionalLogo(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                    <ImagePlus className="h-6 w-6 text-gray-400" />
                    <span className="mt-2 text-xs text-gray-500">Add Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdditionalLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ms">Bahasa Melayu</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="headerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter header text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="footerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Footer Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter footer text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">
            Save Template Settings
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default TemplateSettings;
