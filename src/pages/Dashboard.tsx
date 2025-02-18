
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileEdit, Files, CircleDot, CalendarDays, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useReports } from "@/hooks/useReports";
import { format } from "date-fns";
import InteractiveBentoGallery from "@/components/ui/interactive-bento-gallery";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Report } from "@/types/report";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { reports: initialReports, isLoading } = useReports();
  const [reports, setReports] = useState<Report[]>(initialReports);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to access the dashboard");
        navigate("/login");
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  // Subscribe to real-time changes
  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  useEffect(() => {
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setReports(prev => [payload.new as Report, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setReports(prev => prev.filter(report => report.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setReports(prev => prev.map(report => 
              report.id === payload.new.id ? payload.new as Report : report
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate statistics
  const totalReports = reports.length;
  const reportsThisMonth = reports.filter(report => {
    const reportDate = new Date(report.date);
    const currentDate = new Date();
    return reportDate.getMonth() === currentDate.getMonth() &&
           reportDate.getFullYear() === currentDate.getFullYear();
  }).length;

  const mostRecentReport = reports.length > 0 ? reports[0] : null;

  // Transform reports with images into gallery items - limit to 9 random images
  const galleryItems = reports
    .filter(report => report.images && report.images.length > 0)
    .flatMap(report => 
      report.images.map((imageUrl, index) => ({
        id: Math.random(), // Use random id to ensure uniqueness
        type: "image",
        title: report.title,
        desc: `${format(new Date(report.date), "MMMM d, yyyy")} - ${report.venue}`,
        url: imageUrl,
        span: "", // We'll set this after shuffling
      }))
    )
    // Shuffle array
    .sort(() => Math.random() - 0.5)
    // Take only first 9 items
    .slice(0, 9)
    // Set spans based on position
    .map((item, index) => ({
      ...item,
      span: index % 3 === 0 
        ? "md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-2"
        : "md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2",
    }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Files className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : totalReports}</div>
            <p className="text-xs text-muted-foreground">
              Reports created in total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports This Month</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : reportsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Reports created this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Report</CardTitle>
            <CircleDot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm">Loading...</div>
            ) : mostRecentReport ? (
              <div className="space-y-1">
                <div className="font-medium truncate">{mostRecentReport.title}</div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(mostRecentReport.date), "MMM d, yyyy")}
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No reports yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/create-report">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileEdit className="h-5 w-5" />
                Create New Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              Create a new event report using our simple form template.
            </CardContent>
          </Card>
        </Link>
        <Link to="/all-reports">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Files className="h-5 w-5" />
                View All Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              Access and manage all previously created event reports.
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Most Recent Report Preview */}
      {mostRecentReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Most Recent Report Details
              <Link 
                to={`/edit-report/${mostRecentReport.id}`}
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                View Details <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium">Title</div>
                <div className="text-sm text-muted-foreground">{mostRecentReport.title}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Event Date</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(mostRecentReport.date), "MMMM d, yyyy")}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Venue</div>
                <div className="text-sm text-muted-foreground">{mostRecentReport.venue}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Organizer</div>
                <div className="text-sm text-muted-foreground">{mostRecentReport.organizer}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Attendance</div>
                <div className="text-sm text-muted-foreground">{mostRecentReport.attendance}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Summary</div>
              <div className="text-sm text-muted-foreground line-clamp-2">{mostRecentReport.summary}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Images Gallery */}
      {galleryItems.length > 0 && (
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Report Images Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <InteractiveBentoGallery
              mediaItems={galleryItems}
              title="Event Reports Gallery"
              description="Explore images from various events"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
