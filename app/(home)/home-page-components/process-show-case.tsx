import React from 'react';
import { motion } from "framer-motion";
import { 
  MapPin,
  Search,
  Compass,
  CheckCircle,
  Share2,
  Navigation,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Search,
    title: "Search Location",
    description: "Enter an address, landmark, or use your current GPS location to start the process",
    color: "from-blue-500 to-violet-500",
    link: "#search-location"
  },
  {
    icon: Compass,
    title: "Verify Location",
    description: "Confirm the exact location on our interactive map with satellite view",
    color: "from-violet-500 to-pink-500",
    link: "#verify-location"
  },
  {
    icon: MapPin,
    title: "Generate Address",
    description: "Get your unique digital address code with postcode for the selected location",
    color: "from-emerald-500 to-blue-500",
    link: "#generate-code"
  },
  {
    icon: CheckCircle,
    title: "Validate Address",
    description: "Ensure your digital address meets all official requirements",
    color: "from-orange-500 to-red-500",
    link: "#validate"
  },
  {
    icon: Share2,
    title: "Share & Save",
    description: "Save your digital address and share it easily with others",
    color: "from-cyan-500 to-blue-500",
    link: "#share"
  },
  {
    icon: Navigation,
    title: "Use Address",
    description: "Use your digital address for deliveries, registration, and more",
    color: "from-green-500 to-emerald-500",
    link: "#use"
  }
];

interface ProcessCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  color: string;
  link: string;
  delay: number;
  stepNumber: number;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ 
  icon: Icon,
  title, 
  description, 
  color,
  link,
  delay,
  stepNumber 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="relative group cursor-pointer" onClick={() => window.location.href = link}>
      <div className="relative overflow-hidden rounded-xl border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-background/80 transition-colors">
        {/* Step number */}
        <div className="absolute top-4 right-4 text-sm font-medium text-muted-foreground">
          Step {stepNumber}
        </div>
        
        {/* Icon with gradient background */}
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r opacity-75 blur-lg transition-all group-hover:opacity-100" />
          <div className={cn(
            "relative flex items-center justify-center w-12 h-12 rounded-lg",
            "bg-gradient-to-r",
            color
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <div className="flex items-center text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
          Learn More 
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  </motion.div>
);

const ProcessShowcase = () => {
  return (
    <div className="relative overflow-hidden py-20 bg-muted/50">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight mb-4"
          >
            How Digital Addressing Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Get your digital address in six simple steps - Quick, easy, and reliable
          </motion.p>
        </div>

        {/* Process Flow Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <ProcessCard
              key={index}
              {...step}
              delay={index * 0.1}
              stepNumber={index + 1}
            />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Get Your Digital Address Now
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProcessShowcase;