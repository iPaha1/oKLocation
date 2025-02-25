import fs from 'fs';
import path from 'path';
import osmtogeojson from 'osmtogeojson';
import fetch from 'node-fetch';
import { GeoJSON } from 'geojson'; // Import GeoJSON types

async function downloadDistrictBoundaries() {
  // Overpass query to fetch district boundaries (admin_level=6) in Ghana
  const query = `
    [out:json][timeout:300];
    area["ISO3166-1"="GH"]->.ghana;
    (
      relation["admin_level"="6"]["boundary"="administrative"](area.ghana);
      way["admin_level"="6"]["boundary"="administrative"](area.ghana);
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    console.log('Fetching district boundaries from Overpass API...');
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('District boundaries data received from Overpass API');
    return await response.json();
  } catch (error) {
    console.error('Error downloading district boundaries data:', error);
    throw error;
  }
}

async function saveDistrictBoundaries() {
  try {
    // Fetch district boundaries from Overpass API
    const osmData = await downloadDistrictBoundaries();

    // Convert OSM data to GeoJSON and assert the type as GeoJSON.FeatureCollection
    const geojson = osmtogeojson(osmData) as GeoJSON.FeatureCollection;

    // Filter out duplicates and invalid districts
    const uniqueDistricts = new Map<string, GeoJSON.Feature<GeoJSON.Geometry>>();

    for (const feature of geojson.features) {
      const properties = feature.properties;
      const name = properties ? properties.name : null;
      if (name && !uniqueDistricts.has(name)) {
        uniqueDistricts.set(name, feature);
      }
    }

    // Create a new GeoJSON object with unique districts
    const filteredGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: Array.from(uniqueDistricts.values()),
    };

    // Log the number of districts saved
    const numberOfDistricts = filteredGeoJSON.features.length;
    console.log(`Number of districts saved: ${numberOfDistricts}`);

    // Save the filtered GeoJSON data to a file
    const outputDir = path.join(__dirname, '../lib/ghana-post/data/districts/one');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'district-boundaries.json');
    fs.writeFileSync(outputPath, JSON.stringify(filteredGeoJSON, null, 2));

    console.log('\nDistrict boundaries saved to:', outputPath);
  } catch (error) {
    console.error('Error processing district boundaries data:', error);
    process.exit(1);
  }
}

// Execute the script
saveDistrictBoundaries();






// import fs from 'fs';
// import path from 'path';
// import osmtogeojson from 'osmtogeojson';
// import fetch from 'node-fetch';

// async function downloadDistrictBoundaries() {
//   // Overpass query to fetch district boundaries (admin_level=6) in Ghana
//   const query = `
//     [out:json][timeout:300];
//     area["ISO3166-1"="GH"]->.ghana;
//     (
//       relation["admin_level"="6"]["boundary"="administrative"](area.ghana);
//       way["admin_level"="6"]["boundary"="administrative"](area.ghana);
//     );
//     out body;
//     >;
//     out skel qt;
//   `;

//   try {
//     console.log('Fetching district boundaries from Overpass API...');
//     const response = await fetch('https://overpass-api.de/api/interpreter', {
//       method: 'POST',
//       body: query,
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     console.log('District boundaries data received from Overpass API');
//     return await response.json();
//   } catch (error) {
//     console.error('Error downloading district boundaries data:', error);
//     throw error;
//   }
// }

// async function saveDistrictBoundaries() {
//   try {
//     // Fetch district boundaries from Overpass API
//     const osmData = await downloadDistrictBoundaries();

//     // Convert OSM data to GeoJSON
//     const geojson = osmtogeojson(osmData);

//     // Filter out duplicates and invalid districts
//     const uniqueDistricts = new Map<string, GeoJSON.Feature<GeoJSON.Geometry>>();

//     for (const feature of geojson.features) {
//       const properties = feature.properties;
//       const name = properties ? properties.name : null;
//       if (name && !uniqueDistricts.has(name)) {
//         uniqueDistricts.set(name, feature);
//       }
//     }

//     // Create a new GeoJSON object with unique districts
//     const filteredGeoJSON = {
//       type: 'FeatureCollection',
//       features: Array.from(uniqueDistricts.values()),
//     };

//     // Log the number of districts saved
//     const numberOfDistricts = filteredGeoJSON.features.length;
//     console.log(`Number of districts saved: ${numberOfDistricts}`);

//     // Save the filtered GeoJSON data to a file
//     const outputDir = path.join(__dirname, '../lib/ghana-post/data/districts/one');
//     if (!fs.existsSync(outputDir)) {
//       fs.mkdirSync(outputDir, { recursive: true });
//     }

//     const outputPath = path.join(outputDir, 'district-boundaries.json');
//     fs.writeFileSync(outputPath, JSON.stringify(filteredGeoJSON, null, 2));

//     console.log('\nDistrict boundaries saved to:', outputPath);
//   } catch (error) {
//     console.error('Error processing district boundaries data:', error);
//     process.exit(1);
//   }
// }

// // Execute the script
// saveDistrictBoundaries();





// // import fs from 'fs';
// // import path from 'path';
// // import osmtogeojson from 'osmtogeojson';
// // import fetch from 'node-fetch';

// // async function downloadDistrictBoundaries() {
// //   // Overpass query to fetch district boundaries (admin_level=6) in Ghana
// //   const query = `
// //     [out:json][timeout:300];
// //     area["ISO3166-1"="GH"]->.ghana;
// //     (
// //       relation["admin_level"="6"]["boundary"="administrative"](area.ghana);
// //       way["admin_level"="6"]["boundary"="administrative"](area.ghana);
// //     );
// //     out body;
// //     >;
// //     out skel qt;
// //   `;

// //   try {
// //     console.log('Fetching district boundaries from Overpass API...');
// //     const response = await fetch('https://overpass-api.de/api/interpreter', {
// //       method: 'POST',
// //       body: query,
// //       headers: {
// //         'Content-Type': 'application/x-www-form-urlencoded'
// //       }
// //     });

// //     if (!response.ok) {
// //       throw new Error(`HTTP error! status: ${response.status}`);
// //     }

// //     console.log('District boundaries data received from Overpass API');
// //     return await response.json();
// //   } catch (error) {
// //     console.error('Error downloading district boundaries data:', error);
// //     throw error;
// //   }
// // }

// // async function saveDistrictBoundaries() {
// //   try {
// //     // Fetch district boundaries from Overpass API
// //     const osmData = await downloadDistrictBoundaries();

// //     // Convert OSM data to GeoJSON
// //     const geojson = osmtogeojson(osmData);

// //     // Save the GeoJSON data to a file
// //     const outputDir = path.join(__dirname, '../lib/ghana-post/data/districts');
// //     if (!fs.existsSync(outputDir)) {
// //       fs.mkdirSync(outputDir, { recursive: true });
// //     }

// //     const outputPath = path.join(outputDir, 'district-boundaries.json');
// //     fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));

// //     const numberOfDistricts = geojson.features.length;
// //     console.log(`Number of districts saved: ${numberOfDistricts}`);

// //     console.log('\nDistrict boundaries saved to:', outputPath);
// //   } catch (error) {
// //     console.error('Error processing district boundaries data:', error);
// //     process.exit(1);
// //   }
// // }

// // // Execute the script
// // saveDistrictBoundaries();