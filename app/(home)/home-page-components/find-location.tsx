"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Copy } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";

const FindAddressDialog = () => {
  const [gpsAddress, setGpsAddress] = useState("");
  const [locationInfo, setLocationInfo] = useState<{
    address?: string;
    district?: string;
    region?: string;
    streetNumber?: string;
    streetName?: string;
    neighborhood?: string;
    locality?: string;
    administrativeAreaLevel1?: string;
    administrativeAreaLevel2?: string;
    postalCode?: string;
    country?: string;
    plusCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    loading: boolean;
    error?: string;
  }>({ loading: false });

  // Validate oKLocation GPS address format
  const isValidGPSAddress = (address: string) => {
    const gpsRegex = /^[A-Z][A-Z0-9]-\d{3,4}-\d{2,4}(-\d)?$/;
    return gpsRegex.test(address);
  };

  const fetchAddressDetails = async () => {
    if (!isValidGPSAddress(gpsAddress)) {
      setLocationInfo({ loading: false, error: "Please enter a valid oKLocation GPS address" });
      return;
    }

    setLocationInfo({ loading: true, error: undefined });

    try {
      const response = await fetch(
        `api/v1/address/lookup?gps=${encodeURIComponent(gpsAddress)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
            "x-api-secret": `${process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address details");
      }

      const addressData = await response.json();
      console.log("API Response:", addressData);

      setLocationInfo({
        address: addressData.address,
        district: addressData.district,
        region: addressData.region,
        streetNumber: addressData.streetNumber,
        streetName: addressData.streetName,
        neighborhood: addressData.neighborhood,
        locality: addressData.locality,
        administrativeAreaLevel1: addressData.administrativeAreaLevel1,
        administrativeAreaLevel2: addressData.administrativeAreaLevel2,
        postalCode: addressData.postalCode,
        country: addressData.country,
        plusCode: addressData.plusCode,
        coordinates: addressData.coordinates,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching address details:", error);
      setLocationInfo({
        loading: false,
        error: "Error fetching address details. Please try again.",
      });
    }
  };

  const copyAddress = () => {
    if (locationInfo.address) {
      navigator.clipboard.writeText(locationInfo.address);
      toast.success("Address copied to clipboard");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          Find Address
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Find Digital Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gpsAddress">Enter Digital Address</Label>
                <Input
                  id="gpsAddress"
                  value={gpsAddress}
                  onChange={(e) => setGpsAddress(e.target.value)}
                  placeholder="e.g., AA-123-4567"
                  className="w-full"
                />
              </div>
              <Button onClick={fetchAddressDetails} disabled={locationInfo.loading} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                {locationInfo.loading ? "Fetching..." : "Get Address"}
              </Button>
              {locationInfo.error && <p className="text-red-500 text-sm">{locationInfo.error}</p>}
              {locationInfo.address && (
                <div className="mt-4 space-y-2">
                  <Label>Address Details</Label>
                  <div className="flex items-center gap-2">
                    <Input value={locationInfo.address} readOnly />
                    <Button size="icon" onClick={copyAddress}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {locationInfo.coordinates && (
                    <div className="text-sm text-muted-foreground">
                      Coordinates: {locationInfo.coordinates.latitude}, {locationInfo.coordinates.longitude}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default FindAddressDialog;