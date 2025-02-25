"use client";


import React, { useState } from 'react';
import { Search, MapPin, Compass } from "lucide-react";

const regions = [
  { code: "GR", name: "Greater Accra" },
  { code: "AS", name: "Ashanti" },
  { code: "WE", name: "Western" },
  { code: "CE", name: "Central" },
  { code: "EA", name: "Eastern" },
  { code: "VO", name: "Volta" },
  { code: "NO", name: "Northern" },
  { code: "UE", name: "Upper East" },
  { code: "UW", name: "Upper West" },
  { code: "SA", name: "Savannah" }
];

interface SearchResult {
  region: string | undefined;
  query: string;
  digitalAddress: string;
}

const AddressSearch = () => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedRegion && searchQuery) {
      setSearchResults({
        region: regions.find(r => r.code === selectedRegion)?.name,
        query: searchQuery,
        digitalAddress: `${selectedRegion}-${Math.random().toString().slice(2, 6)}`
      });
    }
  };

  return (
    <div className="w-full py-16 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Find Your Digital Address
          </h2>
          <p className="text-muted-foreground">
            Search by location or landmark to get your digital address
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Region Select */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium mb-2">
                Select Region
              </label>
              <select
                id="region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-2 rounded-md border bg-transparent"
                required
              >
                <option value="">Select a region...</option>
                {regions.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Enter Location or Landmark
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 p-2 rounded-md border bg-transparent"
                  placeholder="Enter location or landmark"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Search Address
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors"
              >
                <Compass className="w-4 h-4" />
                Use Current Location
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className="mt-6 bg-card border rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Location Found</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  Region: {searchResults.region}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  Location: {searchResults.query}
                </p>
                <p className="text-sm font-medium">
                  Digital Address: {searchResults.digitalAddress}
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors">
                <MapPin className="w-4 h-4" />
                View on Map
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSearch;