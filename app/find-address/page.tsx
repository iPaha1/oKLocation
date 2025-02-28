// app/find-address/page.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AddressDetails from "./find-address-components/address-details";
import AddressMap from "./find-address-components/address-map";

interface SavedLocation {
  id: string;
  latitude: number;
  longitude: number;
  districtCode?: string;
  regionCode?: string;
  address?: string;
  digitalAddress: string;
  district?: string;
  region?: string;
  postCode?: string;
  createdAt: string;
  updatedAt: string;
}

export default function FindAddressPage() {
  const [digitalAddress, setDigitalAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState<SavedLocation | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        toast.error(`Error getting location: ${error.message}`);
      }
    );
  };

  // Search for address
  const handleSearch = async () => {
    if (!digitalAddress.trim()) {
      toast.error("Please enter a digital address");
      return;
    }

    setIsLoading(true);
    setLocationData(null);

    try {
      const response = await fetch(`/api/v1/find-address?address=${encodeURIComponent(digitalAddress)}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to find address");
      }

      const data = await response.json();
      
      if (!data) {
        toast.error("Address not found");
        return;
      }

      setLocationData(data);
      
      // Also get current location
      getCurrentLocation();
      
    } catch (error) {
      console.error("Error searching for address:", error);
      toast.error(error instanceof Error ? error.message : "Error searching for address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Find Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter digital address (e.g. GA-123-456)"
                value={digitalAddress}
                onChange={(e) => setDigitalAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="mr-2 h-5 w-5" />
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>

            {locationData && (
              <div className="space-y-4">
                <AddressDetails location={locationData} />
                
                <div className="h-[400px] relative rounded-lg overflow-hidden border">
                  <AddressMap 
                    destinationLocation={{
                      lat: locationData.latitude,
                      lng: locationData.longitude
                    }}
                    currentLocation={currentLocation}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}