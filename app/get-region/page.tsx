import GetRegion from "./get-region-components/get-region";

// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

const Home = async () => {



    // const region = await prisma.postcodeRegion.findUnique({
    //     where: {
    //         code: 'GA' // replace 'some-id' with the actual id value
    //     },
    //     include: {
    //         districts: true
    //     }
    // });

    // console.log("THIS IS THE REGION: ", region )

    // const district = await prisma.district.findFirst({
    //     where: {
    //         name: 'Accra'
    //     },
    //     include: {
    //         localities: true,
    //     }
    // })

    // console.log("THIS IS THE DISTRICT: ", district)

    // const locality = await prisma.locality.findFirst({
    //     where: {
    //         name: 'adawso',
    //     },
    // })

    // console.log("THIS IS THE LOCALITY: ", locality)

  return (
    <div>
      <h1>Welcome to the Region Finder</h1>
      <GetRegion />
    </div>
  );
}

export default Home;



// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// const GetRegion = async () => {

//     // const region = await prisma.postcodeRegion.findUnique({
//     //     where: {
//     //         code: 'GA' // replace 'some-id' with the actual id value
//     //     },
//     //     include: {
//     //         districts: true
//     //     }
//     // });

//     // console.log("THIS IS THE REGION: ", region )

//     const district = await prisma.district.findFirst({
//         where: {
//             name: 'Accra'
//         },
//         include: {
//             localities: true,
//         }
//     })

//     console.log("THIS IS THE DISTRICT: ", district)

//     const locality = await prisma.locality.findFirst({
//         where: {
//             name: 'adawso',
//         },
//     })

//     console.log("THIS IS THE LOCALITY: ", locality)

//     (async () => {
//         const latitude = 40.7128; // Example latitude
//         const longitude = -74.006; // Example longitude
      
//         try {
//           const result = await getPostcodeAndConnections(latitude, longitude);
//           console.log('Postcode and Connections:', result);
//         } catch (error) {
//           console.error('Error:', error);
//         }
//       })();
    
//     return (
//         <div>
//             The regions will be here 
//         </div>
//     )
// }

// export default GetRegion;