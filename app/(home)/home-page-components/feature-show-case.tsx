"use client";

import { motion } from "framer-motion";
import { 
  Smartphone, 
  Shield, 
  CreditCard, 
  Zap,
  Globe,
  Clock,
  Gift,
  PieChart,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Access your wallet anytime, anywhere with our intuitive mobile app",
    color: "from-blue-500 to-violet-500",
    link: "#mobile-app"
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Your money is protected with state-of-the-art encryption and security measures",
    color: "from-emerald-500 to-blue-500",
    link: "#security"
  },
  {
    icon: CreditCard,
    title: "Instant Transfers",
    description: "Send and receive money instantly across any wallet or bank account",
    color: "from-violet-500 to-pink-500",
    link: "#transfers"
  },
  {
    icon: Zap,
    title: "Quick Payments",
    description: "Pay bills, buy airtime, and make purchases with just a few taps",
    color: "from-orange-500 to-red-500",
    link: "#payments"
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Use your wallet internationally with competitive exchange rates",
    color: "from-cyan-500 to-blue-500",
    link: "#global"
  },
  {
    icon: Gift,
    title: "Rewards Program",
    description: "Earn points and cashback on every transaction you make",
    color: "from-pink-500 to-purple-500",
    link: "#rewards"
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Get help whenever you need it with our round-the-clock customer service",
    color: "from-green-500 to-emerald-500",
    link: "#support"
  },
  {
    icon: PieChart,
    title: "Expense Tracking",
    description: "Monitor your spending with detailed analytics and insights",
    color: "from-yellow-500 to-orange-500",
    link: "#analytics"
  }
];

const FeatureCard = ({ 
   
  title, 
  description, 
  color,
  link,
  delay 
}: { 
  icon: React.ComponentType; 
  title: string; 
  description: string;
  color: string;
  link: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="relative group cursor-pointer" onClick={() => window.location.href = link}>
      <div className="relative overflow-hidden rounded-xl border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-background/80 transition-colors">
        {/* Icon with gradient background */}
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r opacity-75 blur-lg transition-all group-hover:opacity-100" />
          <div className={cn(
            "relative flex items-center justify-center w-12 h-12 rounded-lg",
            "bg-gradient-to-r",
            color
          )}>
            {/* <Icon className="w-6 h-6 text-white" /> */}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        {/* Learn More Link */}
        <div className="flex items-center text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
          Learn More 
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  </motion.div>
);

const FeaturesShowcase = () => {
  return (
    <div className="relative overflow-hidden py-20">
      {/* Background gradient */}
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
            Powerful Features for Modern Finance
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Everything you need to manage your money efficiently and securely in one place
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              link={feature.link}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesShowcase;