import GetCurrentLocation from "./get-current-location-components/get-current-location";

export default function GetCurrentLocationPage () {
    
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Get Your Current Location
        </h1>
        <GetCurrentLocation />
      </div>
    </div>
  )
}