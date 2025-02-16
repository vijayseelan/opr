
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search } from "lucide-react";

const AllReports = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Reports</h1>
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reports..." className="pl-8" />
        </div>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              SAMBUTAN HARI KEMERDEKAAN SESI AKADEMIK 2023/2024
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Date: 03 September 2023
              <br />
              Venue: SJKT LADANG SUNGKAP PARA
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AllReports;
