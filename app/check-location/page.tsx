// import { generateGhanaPostcodes } from "@/lib/generate-post-codes";
// import { getPostCodeFromDB } from "@/lib/get-postcode-from-database";
// import { getPostCodeFromDB } from "@/lib/get-postcode-from-database";
import GetLocationByCoordinates from "./check-location-components/check-location";
import OpenStreetGetLocationByCoordinates from "./check-location-components/check-location-with-open-street";
// import { GetPostCodeFromDatabase } from "@/lib/get-postcode-from-database";


export default async function GetLocationByCoordinatesPage(): Promise<JSX.Element> {

  // Generate all postcodes
// const postcodes = generateGhanaPostcodes();
// console.log('Generated postcodes:', postcodes);


// const postcode = await getPostCodeFromDB({
//   locality: 'New Russia',
//   district: 'Ablekuma Central',
//   region: 'GREATER ACCRA',
// });

// console.log("THIS IS THE POST CODE I AM GETTING: ",postcode);



  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Get Location Details by Coordinates
        </h1>
        <GetLocationByCoordinates />
        <OpenStreetGetLocationByCoordinates />
      </div>
    </div>
  )
}