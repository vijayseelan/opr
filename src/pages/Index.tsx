
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">One Page Report</h1>
          <p className="text-xl text-gray-600 mb-8">Create and manage your reports efficiently</p>
        </div>
        <div className="space-x-4">
          <Link to="/signup">
            <Button size="lg">Sign Up</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">Log In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
