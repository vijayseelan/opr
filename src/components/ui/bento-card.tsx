
import React from "react";
import { motion } from "framer-motion";
import { AnimatedGradient } from "@/components/ui/animated-gradient-with-svg";

interface BentoCardProps {
  title: React.ReactNode;
  value: string | number;
  subtitle?: string;
  colors: string[];
  delay: number;
  className?: string;
  onClick?: () => void;
}

const BentoCard: React.FC<BentoCardProps> = ({
  title,
  value,
  subtitle,
  colors,
  delay,
  className,
  onClick,
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay + 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className={`relative overflow-hidden h-full bg-background dark:bg-background/50 rounded-lg border cursor-pointer ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
    >
      <AnimatedGradient colors={colors} speed={0.05} blur="medium" />
      <motion.div
        className="relative z-10 p-3 sm:p-5 md:p-8 text-foreground h-full"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          className="text-sm sm:text-base md:text-lg text-foreground" 
          variants={item}
        >
          {title}
        </motion.div>
        <motion.p
          className="text-xl sm:text-2xl md:text-3xl font-medium mb-4 text-foreground"
          variants={item}
        >
          {value}
        </motion.p>
        {subtitle && (
          <motion.p 
            className="text-sm text-foreground/80" 
            variants={item}
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

export { BentoCard };
