// app/api/v1/coordinates/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect('/sign-in');
  }

  // Get parameters from URL
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lng = url.searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing latitude or longitude parameters' },
      { status: 400 }
    );
  }

  const location = await prisma.savedLocation.findFirst({
    where: {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    },
  });

  if (!location) {
    return NextResponse.json(
      { error: 'Location not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(location);
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect('/sign-in');
  }

  // Get parameters from URL and request body
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lng = url.searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing latitude or longitude parameters' },
      { status: 400 }
    );
  }

  const location = await prisma.savedLocation.create({
    data: {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      digitalAddress: 'defaultAddress', // Replace with actual digital address
    },
  });

  return NextResponse.json(location, { status: 201 });
}




// // src/app/api/v1/coordinates/route.ts
// import { NextResponse } from 'next/server'
// import { auth } from '@clerk/nextjs/server';
// import { prisma } from '@/lib/prisma';

// export async function GET(
//   request: Request,
//   { params }: { params: { lat: string; lng: string } }
// ) {
//   const { userId } = await auth()

//   if (!userId) {
//     return NextResponse.redirect('/sign-in')
//   }

//   const { lat, lng } = params

//   const location = await prisma.savedLocation.findFirst({
//     where: {
//       latitude: parseFloat(lat),
//       longitude: parseFloat(lng),
//     },
//   })

//   if (!location) {
//     return NextResponse.json({ error: 'Location not found' }, { status: 404 })
//   }

//   return NextResponse.json(location)
// }

// export async function POST(
//   request: Request,
//   { params }: { params: { lat: string; lng: string } }
// ) {
//   // const { userId } = auth()

//   // if (!userId) {
//   //   return NextResponse.redirect('/sign-in')
//   // }

//   const { lat, lng } = params

//   const location = await prisma.savedLocation.create({
//     data: {
//       latitude: parseFloat(lat),
//       longitude: parseFloat(lng),
//       digitalAddress: 'defaultAddress', // Replace 'defaultAddress' with the actual digital address value
//     },
//   })

//   return NextResponse.json(location, { status: 201 })
// }