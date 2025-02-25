// app/not-found.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background/95">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center text-center">
          {/* Animated 404 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative">
              <motion.h1 
                className="text-9xl font-bold text-primary/10"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  delay: 0.1
                }}
              >
                404
              </motion.h1>
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                  Page Not Found
                </h2>
              </motion.div>
            </div>
          </motion.div>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-lg text-muted-foreground max-w-lg"
          >
            Oops! It seems the location you&apos;re looking for doesn&apos;t exist. 
            Don&apos;t worry, even the best navigation systems take a wrong turn sometimes.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              asChild
              className="gap-2"
            >
              <Link href="/">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="gap-2"
            >
              <Link href="/help">
                <Search className="w-4 h-4" />
                Search Help Center
              </Link>
            </Button>
          </motion.div>

          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <button 
              onClick={() => window.history.back()}
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back to Previous Page
            </button>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-grid-white/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}