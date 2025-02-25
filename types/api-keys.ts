// types/api-keys.ts
export interface ApiKey {
    id: string
    key: string
    active: boolean
    requests: number
    createdAt: Date
    updatedAt: Date
    lastUsed?: Date | null
    dailyRequests: number
    monthlyRequests: number
    rateLimitQuota: number
  }