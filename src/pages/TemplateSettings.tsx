
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImagePlus, Trash2, Edit2, Copy, Check } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter, 
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
import { useQuery, useQueryClient } from "@tanstack/react-query";

const templateSettingsSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  schoolName: z.string().min(1, "School name is required"),
  headerText: z.string(),
  footerText: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  language: z.string(),
});

type TemplateSettingsValues = z.infer<typeof templateSettingsSchema>;

interface Template {
  id: string;
  name: string;
  school_name: string | null;
  school_logo: string | null;
  additional_logos: string[] | null;
  primary_color: string | null;
  secondary_color: string | null;
  language: string | null;
  is_active: boolean;
}

const TemplateSettings = () => {
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [additionalLogos, setAdditionalLogos] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('template_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as Template[];
    },
  });

  const form = useForm<TemplateSettingsValues>({
    resolver: zodResolver(templateSettingsSchema),
    defaultValues: {
      name: "",
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

  const setActiveTemplate = async (templateId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to set active template");
        return;
      }

      const { error } = await supabase
        .from('template_settings')
        .update({ is_active: true })
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success("Template set as active");
    } catch (error: any) {
      toast.error("Error setting active template");
      console.error("Error setting active template:", error.message);
    }
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
        .insert({
          user_id: user.id,
          name: values.name,
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

      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success("Template settings saved successfully");
      form.reset();
      setSchoolLogo(null);
      setAdditionalLogos([]);
    } catch (error: any) {
      toast.error("Error saving template settings");
      console.error("Error saving template settings:", error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Template Settings</h1>
        <Button onClick={() => setIsEditing(true)}>Create New Template</Button>
      </div>

      {/* Template Cards Grid */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <Card key={template.id} className={`relative ${template.is_active ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{template.name}</span>
                  {template.is_active && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Active
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.school_logo && (
                  <div className="w-32 h-32 mx-auto">
                    <img
                      src={template.school_logo}
                      alt="School logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                {template.school_name && (
                  <p className="text-center font-semibold">{template.school_name}</p>
                )}
                <div className="flex gap-2 flex-wrap">
                  {template.additional_logos?.map((logo, index) => (
                    <div key={index} className="w-12 h-12">
                      <img
                        src={logo}
                        alt={`Additional logo ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement edit functionality
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </Button>
                {!template.is_active && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setActiveTemplate(template.id)}
                  >
                    Set Active
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Template Form */}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter template name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Save Template
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default TemplateSettings;
