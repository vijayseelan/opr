
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileEdit, Files } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
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
    </div>
  );
};

export default Dashboard;
