"use client";

import { useState, useEffect } from 'react';

const GetRegion = () => {
  interface ResultType {
    postcode: string;
    district: string; // Updated to match the API response
    region: string;   // Updated to match the API response
  }
  
  const [result, setResult] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPostcode = async (districtName: string, localityName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/postcode/get-post-code?district=${encodeURIComponent(districtName)}&locality=${encodeURIComponent(localityName)}`,
        {
          method: 'GET',
        }
      );

      console.log("THIS IS THE RESPONSE: ", response);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      console.log('API Response:', data); // Log the API response
      setResult(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };


// const fetchPostcode = async (district: string, locality: string) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(
//         `/api/v1/address?district=${encodeURIComponent(district)}&locality=${encodeURIComponent(locality)}`,
//         {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
//             'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET || '',
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to fetch data');
//       }

//       const data = await response.json();
//       console.log('API Response:', data); // Log the API response
//       setResult(data);
//     } catch (error) {
//       if (error instanceof Error) {
//         setError(error.message);
//       } else {
//         setError('An unknown error occurred');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
  
  useEffect(() => {
    // Example district and locality names
    const districtName = 'Accra'; // Replace with the actual district name
    const localityName = 'Ablekuma Central Municipal District'; // Replace with the actual locality name

    fetchPostcode(districtName, localityName);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Postcode and Connections</h1>
      {result ? (
        <div>
          <p>Postcode: {result.postcode}</p>
          <p>District: {result.district}</p>
          <p>Region: {result.region}</p>
        </div>
      ) : (
        <p>No data found</p>
      )}
    </div>
  );
};

export default GetRegion;





// "use client";

// import { useState, useEffect } from 'react';

// const GetRegion = () => {
//   interface ResultType {
//     postcode: string;
//     locality: { name: string };
//     district: { name: string };
//     region: { name: string };
//   }
  
//   const [result, setResult] = useState<ResultType | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchPostcodeAndConnections = async (latitude: number, longitude: number) => {
//     setLoading(true);
//     setError(null);
  
//     try {
//       const response = await fetch(
//         `/api/v1/postcode/get-post-code-by-coordinate?lat=${latitude}&lng=${longitude}`,
//         {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
//             'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET || '',
//           },
//         }
//       );
  
//       if (!response.ok) {
//         throw new Error('Failed to fetch data');
//       }
  
//       const data = await response.json();
//       setResult(data);
//     } catch (error) {
//       if (error instanceof Error) {
//         setError(error.message);
//       } else {
//         setError('An unknown error occurred');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Example coordinates
//     const latitude = 5.541742;
//     const longitude = -0.256021;

//     fetchPostcodeAndConnections(latitude, longitude);
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }


  
//   return (
//     <div>
//       <h1>Postcode and Connections</h1>
//       {result ? (
//         <div>
//           <p>Postcode: {result.postcode}</p>
//           <p>Locality: {result.locality.name}</p>
//           <p>District: {result.district.name}</p>
//           <p>Region: {result.region.name}</p>
//         </div>
//       ) : (
//         <p>No data found</p>
//       )}
//     </div>
//   );
// };

// export default GetRegion;
