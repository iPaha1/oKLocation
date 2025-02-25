// lib/api-validate.ts

import { prisma } from "./prisma"

interface ValidationResult {
  valid: boolean;
  error?: string;
  keyId?: string;
  rateLimitQuota?: number;
  dailyRequests?: number;
}

export async function validateApiKey(apiKey: string, apiSecret: string): Promise<ValidationResult> {
  try {
    // Check if API key exists and is active
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      select: {
        id: true,
        active: true,
        secret: true,
        rateLimitQuota: true,
        dailyRequests: true,
        userId: true
      }
    });

    console.log('API key:', key);

    if (!key) {
      return {
        valid: false,
        error: 'Invalid API key'
      };
    }

    if (!key.active) {
      return {
        valid: false,
        error: 'API key is inactive'
      };
    }

    // Validate secret
    if (key.secret !== apiSecret) {
      return {
        valid: false,
        error: 'Invalid API secret'
      };
    }

    // Check rate limit
    if (key.dailyRequests >= key.rateLimitQuota) {
      return {
        valid: false,
        error: 'Daily rate limit exceeded',
        rateLimitQuota: key.rateLimitQuota,
        dailyRequests: key.dailyRequests
      };
    }

    console.log('Rate so far:', key.dailyRequests);

    // Update usage statistics and last used timestamp
    await prisma.apiKey.update({
      where: { id: key.id },
      data: {
        lastUsed: new Date(),
        requests: { increment: 1 },
        dailyRequests: { increment: 1 },
        monthlyRequests: { increment: 1 }
      }
    });

    return {
      valid: true,
      keyId: key.id,
      rateLimitQuota: key.rateLimitQuota,
      dailyRequests: key.dailyRequests + 1
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return {
      valid: false,
      error: 'Error validating API key'
    };
  }
}

// Utility to reset daily request counts
export async function resetDailyRequests() {
  try {
    await prisma.apiKey.updateMany({
      data: {
        dailyRequests: 0
      }
    });
  } catch (error) {
    console.error('Error resetting daily requests:', error);
  }
}

// Utility to reset monthly request counts
export async function resetMonthlyRequests() {
  try {
    await prisma.apiKey.updateMany({
      data: {
        monthlyRequests: 0
      }
    });
  } catch (error) {
    console.error('Error resetting monthly requests:', error);
  }
}






// // src/lib/api-validate.ts

// import { prisma } from "./prisma"

// interface ValidationResult {
//   valid: boolean
//   error?: string
//   keyId?: string
// }

// export async function validateApiKey(apiKey: string): Promise<ValidationResult> {
//   try {
//     // Check if API key exists and is active
//     const key = await prisma.apiKey.findUnique({
//       where: { key: apiKey },
//       select: {
//         id: true,
//         active: true,
//         userId: true
//       }
//     })

//     if (!key) {
//       return {
//         valid: false,
//         error: 'Invalid API key'
//       }
//     }

//     if (!key.active) {
//       return {
//         valid: false,
//         error: 'API key is inactive'
//       }
//     }

//     // Update last used timestamp
//     await prisma.apiKey.update({
//       where: { id: key.id },
//       data: { lastUsed: new Date() }
//     })

//     return {
//       valid: true,
//       keyId: key.id
//     }
//   } catch (error) {
//     console.error('API key validation error:', error)
//     return {
//       valid: false,
//       error: 'Error validating API key'
//     }
//   }
// }