// lib/api-tracking.ts

import { prisma } from "./prisma";

interface TrackRequestParams {
  apiKeyId: string;
  endpoint: string;
  status: number;
  duration: number;
}

export async function trackApiRequest({
  apiKeyId,
  endpoint,
  status,
  duration
}: TrackRequestParams) {
  try {
    await prisma.apiRequest.create({
      data: {
        apiKeyId,
        endpoint,
        status,
        duration
      }
    });
  } catch (error) {
    console.error('Error tracking API request:', error);
    // Don't throw error - we don't want to affect the API response
  }
}

// Utility to get API usage statistics
export async function getApiUsageStats(apiKeyId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const [dailyRequests, monthlyRequests, avgDuration] = await Promise.all([
      // Get daily requests count
      prisma.apiRequest.count({
        where: {
          apiKeyId,
          createdAt: {
            gte: startOfDay
          }
        }
      }),
      // Get monthly requests count
      prisma.apiRequest.count({
        where: {
          apiKeyId,
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      // Get average request duration
      prisma.apiRequest.aggregate({
        where: {
          apiKeyId,
          createdAt: {
            gte: startOfMonth
          }
        },
        _avg: {
          duration: true
        }
      })
    ]);

    return {
      dailyRequests,
      monthlyRequests,
      averageDuration: avgDuration._avg.duration || 0
    };
  } catch (error) {
    console.error('Error getting API usage stats:', error);
    throw error;
  }
}

// Utility to clean up old request logs
export async function cleanupOldRequestLogs(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  try {
    await prisma.apiRequest.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up old request logs:', error);
  }
}