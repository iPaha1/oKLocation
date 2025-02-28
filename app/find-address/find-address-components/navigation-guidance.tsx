// app/find-address/components/navigation-guidance.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation, Map, AlertCircle, Timer } from "lucide-react";
import { toast } from "sonner";

interface NavigationGuidanceProps {
  currentLocation: { lat: number; lng: number } | null;
  destinationType: 'pickup' | 'delivery';
  destination: { lat: number; lng: number };
  onNavigate: () => void;
}

export default function NavigationGuidance({
  currentLocation,
  destination,
  onNavigate,
}: NavigationGuidanceProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
    }
  }, []);

  // Calculate route info
  useEffect(() => {
    if (currentLocation && googleMapsLoaded) {
      const directionsService = new google.maps.DirectionsService();

      directionsService.route(
        {
          origin: currentLocation,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            const route = result.routes[0].legs[0];
            setRouteInfo({
              distance: route.distance?.text || 'Unknown',
              duration: route.duration?.text || 'Unknown',
            });
          } else {
            console.error("Failed to calculate route:", status);
            toast.error("Failed to calculate route");
          }
        }
      );
    }
  }, [currentLocation, destination, googleMapsLoaded]);

  const handleStartNavigation = () => {
    try {
      if (!currentLocation) {
        toast.error("Unable to start navigation without current location");
        return;
      }

      // Validate coordinates
      if (
        typeof currentLocation.lat !== 'number' ||
        typeof currentLocation.lng !== 'number' ||
        !isFinite(currentLocation.lat) ||
        !isFinite(currentLocation.lng) ||
        typeof destination.lat !== 'number' ||
        typeof destination.lng !== 'number' ||
        !isFinite(destination.lat) ||
        !isFinite(destination.lng)
      ) {
        toast.error("Invalid coordinates");
        return;
      }

      setIsExpanded(true);
      onNavigate();

      // Open in Google Maps app/web
      const origin = `${currentLocation.lat},${currentLocation.lng}`;
      const dest = `${destination.lat},${destination.lng}`;
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&travelmode=driving`;

      window.open(url, '_blank');
    } catch (error) {
      console.error("Error during navigation:", error);
      toast.error("Failed to start navigation");
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-sm px-4">
      <Card className={`bg-white/95 backdrop-blur-sm shadow-lg transition-all duration-300 ${isExpanded ? 'p-6' : 'p-4'}`}>
        {/* Route Information */}
        {routeInfo && (
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div className="flex items-center space-x-2">
              <Map className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Distance:</span>
              <span className="font-medium">{routeInfo.distance}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">ETA:</span>
              <span className="font-medium">{routeInfo.duration}</span>
            </div>
          </div>
        )}

        {/* Main Navigation Button */}
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white"
          onClick={handleStartNavigation}
          disabled={!currentLocation || !googleMapsLoaded}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Navigate to Location
        </Button>

        {/* Quick Actions */}
        {isExpanded && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                toast.info("Issue reported");
                setIsExpanded(false);
              }}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}