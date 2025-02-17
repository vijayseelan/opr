
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-6 items-center justify-center px-4"
      >
        <div className="text-4xl md:text-7xl font-bold dark:text-white text-center">
          One Page Report
        </div>
        <div className="font-light text-xl md:text-2xl dark:text-neutral-200 text-center">
          Create and manage your reports efficiently
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
    </AuroraBackground>
  );
};

export default Index;
