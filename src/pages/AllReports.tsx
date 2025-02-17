
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ReportCard } from "@/components/reports/ReportCard";
import { ReportDetail } from "@/components/reports/ReportDetail";
import { useReports } from "@/hooks/useReports";
import { Report } from "@/types/report";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AllReports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const navigate = useNavigate();
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    reports,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    downloadReport,
    duplicateReport
  } = useReports();

  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleEditReport = (reportId: string) => {
    setSelectedReport(null);
    navigate(`/edit-report/${reportId}`);
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;

      toast.success("Report deleted successfully");
      // Force a refetch of the reports
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete report");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Reports</h1>
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onClick={() => setSelectedReport(report)}
            onDelete={handleDeleteReport}
          />
        ))}
      </div>

      {/* Infinite scroll observer */}
      {hasNextPage && (
        <div
          ref={observerTarget}
          className="flex justify-center p-4"
        >
          {isFetchingNextPage ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          ) : (
            <div className="h-8" /> // Spacer
          )}
        </div>
      )}

      {selectedReport && (
        <ReportDetail
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onEdit={handleEditReport}
          onDuplicate={duplicateReport}
          onDownload={downloadReport}
        />
      )}
    </div>
  );
};

export default AllReports;
