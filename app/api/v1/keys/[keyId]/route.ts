// app/api/v1/keys/[keyId]/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get keyId from URL
    const keyId = request.url.split('/').pop();

    if (!keyId) {
      return NextResponse.json(
        { error: 'Invalid key ID' },
        { status: 400 }
      );
    }

    const apiKey = await prisma.apiKey.update({
      where: {
        id: keyId,
        userId
      },
      data: {
        active: false
      }
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error('Error deactivating API key:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}




// import { prisma } from "@/lib/prisma"
// import { auth } from "@clerk/nextjs/server"
// import { NextRequest, NextResponse } from "next/server"

// // app/api/keys/[keyId]/route.ts
// export async function DELETE(
//   request: NextRequest,
//     { params }: { params: { keyId: string } }
//   ) {
//     try {
//       const { userId } = await auth()
  
//       if (!userId) {
//         return new NextResponse('Unauthorized', { status: 401 })
//       }
  
//       // Deactivate the API key
//       const apiKey = await prisma.apiKey.update({
//         where: {
//           id: params.keyId,
//           userId // Ensure the key belongs to the user
//         },
//         data: {
//           active: false
//         }
//       })
  
//       return NextResponse.json(apiKey)
//     } catch (error) {
//       console.error('Error deactivating API key:', error)
//       return new NextResponse('Internal Server Error', { status: 500 })
//     }
//   }