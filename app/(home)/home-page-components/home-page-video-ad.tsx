"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import GetYourAddress from './get-your-address';


const videoUrl = "https://res.cloudinary.com/dprxr852x/video/upload/v1738533611/bqdjywwwkg4azzkpsczn.mp4";



const HomePageVideoAd = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative h-[400px] md:h-[700px] bg-black dark:bg-gray-900 mt-20">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
        
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsLoaded(true)}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4">
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              className="text-center space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Logo/Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mx-auto mb-6"
              >
                {/* <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur">
                  <Sparkles className="w-8 h-8 text-white" />
                </div> */}
              </motion.div>

              {/* Heading */}
              <motion.h1 
                className="text-4xl md:text-6xl font-extralight text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {/* Modern Digital Wallet 
                <span className="text-emerald-400"> for Africa</span> */}
              </motion.h1>

              {/* Description */}
              <motion.p 
                className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-extralight hidden md:block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {/* Send money, make payments, and manage your finances with ease.
                Fast, secure, and reliable. */}
              </motion.p>

              {/* Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
               
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <motion.div 
              className="flex flex-col items-center gap-2"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
            {/* Add your content here */}
          </motion.div>
        </motion.div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginForm} onOpenChange={setShowLoginForm}>
        <DialogContent className="p-4">
          <DialogTitle className="text-2xl font-bold mb-4">Login</DialogTitle>
          <GetYourAddress onClose={() => setShowLoginForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePageVideoAd;