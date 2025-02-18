
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileEdit, Users, Rocket, Download } from "lucide-react";

const Index = () => {
  return (
    <AuroraBackground>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-6 items-center justify-center px-4 py-24"
        >
          <div className="text-4xl md:text-7xl font-bold dark:text-white text-center">
            One Page Report
          </div>
          <div className="font-light text-xl md:text-2xl dark:text-neutral-200 text-center max-w-2xl">
            Create and manage your reports efficiently with our intuitive platform designed for educational institutions
          </div>
          <div className="flex gap-4 mt-4">
            <Link to="/signup">
              <Button size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80">
                Sign Up
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-2">
                Log In
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="py-20 px-4 md:px-6"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 dark:text-white">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                <CardHeader>
                  <FileEdit className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Easy Report Creation</CardTitle>
                </CardHeader>
                <CardContent>
                  Create detailed event reports with customizable templates and fields
                </CardContent>
              </Card>
              <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                <CardHeader>
                  <Users className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Team Collaboration</CardTitle>
                </CardHeader>
                <CardContent>
                  Share and manage reports across your educational institution
                </CardContent>
              </Card>
              <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                <CardHeader>
                  <Rocket className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Custom Branding</CardTitle>
                </CardHeader>
                <CardContent>
                  Add your school's logo and customize the appearance of your reports
                </CardContent>
              </Card>
              <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                <CardHeader>
                  <Download className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                  Download reports in PDF format with professional formatting
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.section>

        {/* About Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="py-20 px-4 md:px-6 bg-white/50 dark:bg-black/50 backdrop-blur-sm"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 dark:text-white">
              About One Page Report
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              One Page Report is a comprehensive report management system designed specifically for educational institutions. Our platform streamlines the process of creating, managing, and sharing event reports, making it easier for teachers and staff to document and track school activities.
            </p>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
              With features like customizable templates, multilingual support, and professional PDF exports, we help you maintain consistent and professional documentation of all your school events.
            </p>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="py-6 px-4 text-center text-sm text-gray-600 dark:text-gray-400 mt-auto">
          <p>All rights reserved. Proudly presented by Unit ICT, SJKT Ladang Sungkap Para</p>
        </footer>
      </div>
    </AuroraBackground>
  );
};

export default Index;
