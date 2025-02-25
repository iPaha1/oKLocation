// app/api/keys/route.ts
import { NextResponse } from "next/server";

import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Generate a new API key and secret
    const key = `gps_${crypto.randomBytes(16).toString("hex")}`;
    const secret = crypto.randomBytes(32).toString("hex");

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        key,
        secret,
        active: true,
        rateLimitQuota: 100, // Default daily limit
      },
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error("Error creating API key:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE request to deactivate an API key
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!keyId) {
      return new NextResponse("Key ID is required", { status: 400 });
    }

    const apiKey = await prisma.apiKey.update({
      where: {
        id: keyId,
        userId, // Ensure the key belongs to the user
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error("Error deactivating API key:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}