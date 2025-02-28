// app/find-address/components/address-details.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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

interface AddressDetailsProps {
  location: SavedLocation;
}

export default function AddressDetails({ location }: AddressDetailsProps) {
  const handleCopyAddress = () => {
    const addressText = [
      location.digitalAddress,
      location.address,
      location.district,
      location.region,
      location.postCode,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(addressText);
    toast.success("Address copied to clipboard");
  };

  const handleCopyCoordinates = () => {
    const coordinatesText = `${location.latitude},${location.longitude}`;
    navigator.clipboard.writeText(coordinatesText);
    toast.success("Coordinates copied to clipboard");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          {/* Digital Address Badge */}
          <div className="flex items-center justify-between">
            <Badge className="bg-primary text-white px-3 py-1 text-sm">
              {location.digitalAddress}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
              <Copy className="h-4 w-4 mr-1" />
              Copy Address
            </Button>
          </div>

          {/* Address Details */}
          <div className="space-y-2">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground mr-2" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="text-sm font-medium">
                  {location.address || "No formatted address available"}
                </p>
              </div>
            </div>

            {/* Administrative Areas */}
            <div className="grid grid-cols-2 gap-2">
              {location.district && (
                <div className="text-sm">
                  <span className="text-muted-foreground">District:</span>{" "}
                  <span className="font-medium">{location.district}</span>
                </div>
              )}
              {location.region && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Region:</span>{" "}
                  <span className="font-medium">{location.region}</span>
                </div>
              )}
              {location.postCode && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Postal Code:</span>{" "}
                  <span className="font-medium">{location.postCode}</span>
                </div>
              )}
              {(location.districtCode || location.regionCode) && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Code:</span>{" "}
                  <span className="font-medium">
                    {[location.regionCode, location.districtCode]
                      .filter(Boolean)
                      .join("-")}
                  </span>
                </div>
              )}
            </div>

            {/* Coordinates */}
            <div className="flex items-start">
              <div className="flex-1 flex justify-between items-center mt-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">Coordinates:</span>{" "}
                  <span className="font-medium">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCoordinates}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Last Updated */}
            {/* <div className="flex items-center pt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>Last Updated: {new Date(location.updatedAt).toLocaleString()}</span>
            </div> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}