import { MapPin, Navigation, Globe, Building, Home, Mail, MapPinned } from 'lucide-react';
import { OpenStreetLocationDetails } from './open-street-location-details';

interface OpenStreetLocationInfoProps {
  locationDetails: OpenStreetLocationDetails | null | undefined;
  currentLocation: { lat: number; lng: number } | null;
}

export function OpenStreetLocationInfo({ locationDetails, currentLocation }: OpenStreetLocationInfoProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Address info</h2>

      <div className="space-y-4">
        {/* Digital Address */}
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 mt-1 text-green-600" />
          <div>
            <p className="font-medium">Digital Address</p>
            <p className="text-xl font-bold">{locationDetails?.address || '...'}</p>
            <p className="text-sm text-muted-foreground">Address version 2</p>
          </div>
        </div>

        {/* Street Name */}
        <div className="flex items-start space-x-3">
          <Navigation className="h-5 w-5 mt-1" />
          <div>
            <p className="font-medium">Street Name</p>
            <p>{locationDetails?.streetName || '...'}</p>
          </div>
        </div>

        {/* Region */}
        <div className="flex items-start space-x-3">
          <Globe className="h-5 w-5 mt-1" />
          <div>
            <p className="font-medium">Region</p>
            <p>{locationDetails?.region || '...'}</p>
          </div>
        </div>

        {/* District */}
        <div className="flex items-start space-x-3">
          <Building className="h-5 w-5 mt-1" />
          <div>
            <p className="font-medium">District</p>
            <p>{locationDetails?.district || '...'}</p>
          </div>
        </div>

        {/* Community */}
        <div className="flex items-start space-x-3">
          <Home className="h-5 w-5 mt-1" />
          <div>
            <p className="font-medium">Community</p>
            <p>{locationDetails?.community || '...'}</p>
          </div>
        </div>

        {/* Postal Area */}
        <div className="flex items-start space-x-3">
          <Mail className="h-5 w-5 mt-1" />
          <div>
            <p className="font-medium">Postal Area</p>
            <p>{locationDetails?.postalArea || '...'}</p>
          </div>
        </div>

        {/* Post Code */}
        <div className="flex items-start space-x-3">
          <MapPinned className="h-5 w-5 mt-1" />
          <div>
            <p className="font-medium">Post Code</p>
            <p>{locationDetails?.postCode || '...'}</p>
          </div>
        </div>

        {/* Coordinates */}
        <div className="flex items-start space-x-3">
          <Navigation className="h-5 w-5 mt-1" />
          <div>
            <p className="font-medium">Latitude,Longitude</p>
            <p>
              {currentLocation
                ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`
                : '...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}