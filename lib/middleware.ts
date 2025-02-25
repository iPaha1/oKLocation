// app/lib/middleware.ts
import { prisma } from './prisma';

export async function validateApiKey(request: Request) {
  const authHeader = request.headers.get('authorization');
  const apiSecret = request.headers.get('x-api-secret');

  if (!authHeader?.startsWith('Bearer ') || !apiSecret) {
    return {
      error: 'Missing or invalid authentication',
      status: 401
    };
  }

  const apiKey = authHeader.split(' ')[1];

  try {
    // Find API key in database
    const keyData = await prisma.apiKey.findFirst({
      where: {
        key: apiKey,
        secret: apiSecret,
        active: true
      }
    });

    if (!keyData) {
      return {
        error: 'Invalid API key or secret',
        status: 401
      };
    }

    // Check rate limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const requestCount = await prisma.apiRequest.count({
      where: {
        apiKeyId: keyData.id,
        createdAt: {
          gte: today
        }
      }
    });

    if (requestCount >= keyData.rateLimitQuota) {
      return {
        error: 'Rate limit exceeded',
        status: 429
      };
    }

    // Log API request
    await prisma.apiRequest.create({
      data: {
        apiKeyId: keyData.id,
        endpoint: request.url,
        status: 200,
        duration: 0 // You can calculate actual duration if needed
      }
    });

    // Update API key usage
    await prisma.apiKey.update({
      where: { id: keyData.id },
      data: {
        dailyRequests: requestCount + 1,
        lastUsed: new Date()
      }
    });

    return { keyData };
  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      error: 'Internal server error',
      status: 500
    };
  }
}