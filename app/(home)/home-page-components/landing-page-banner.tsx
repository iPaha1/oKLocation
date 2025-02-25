"use client";

import React, { useState, useEffect } from 'react';
import { 
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import LoginForm from './get-your-address';

const videoUrl = "https://res.cloudinary.com/dprxr852x/video/upload/v1740044772/ys8iyec4eqsrj2tlnn5m.mp4";
const mobileVideoUrl ="https://res.cloudinary.com/dprxr852x/video/upload/v1740047044/zvjog9lx5u4tlydi9evl.mp4"



const LandingPageBanner = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  console.log(isLoaded)

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative h-[600px] md:h-[800px] bg-black dark:bg-gray-900">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
        
        <video
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsLoaded(true)}
        />
       <video
          className="absolute inset-0 w-full h-full object-cover md:hidden"
          src={mobileVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsLoaded(true)}
        /> 
      </div>
     
      {/* Login Dialog */}
      <Dialog open={showLoginForm} onOpenChange={setShowLoginForm}>
        <DialogContent className="p-4">
          <DialogTitle className="text-2xl font-bold mb-4">Login</DialogTitle>
          <LoginForm onClose={() => setShowLoginForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPageBanner;