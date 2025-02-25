// app/api/keys/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

// Get user's API keys
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId,
        active: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Create new API key
export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Generate new API key and secret
    const key = `gps_${crypto.randomBytes(16).toString('hex')}`
    const secret = crypto.randomBytes(32).toString('hex')

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        key,
        secret,
        active: true,
        rateLimitQuota: 1000 // Default daily limit
      }
    })

    return NextResponse.json(apiKey)
  } catch (error) {
    console.error('Error creating API key:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}