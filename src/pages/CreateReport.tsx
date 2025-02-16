
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.success("Report created successfully!");
    console.log(values);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create New Report</h1>
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
          <Button type="submit" className="w-full">
            Create Report
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateReport;
