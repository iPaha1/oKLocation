// app/api/usage/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get all active API keys for the user
    const activeKeys = await prisma.apiKey.findMany({
      where: {
        userId,
        active: true
      },
      select: {
        id: true
      }
    })

    const keyIds = activeKeys.map(key => key.id as string)

    // Get API requests for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const requests = await prisma.apiRequest.findMany({
      where: {
        apiKeyId: {
          in: keyIds
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Group requests by day
    const usage = requests.reduce((acc: Record<string, number>, request) => {
      const date = request.createdAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Convert to array format for the chart
    const usageData = Object.entries(usage).map(([date, requests]) => ({
      date,
      requests
    }))

    // Sort by date
    usageData.sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json(usageData)
  } catch (error) {
    console.error('Error fetching API usage:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}