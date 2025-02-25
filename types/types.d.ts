// For TypeScript support, add this to your types.d.ts file:
declare namespace NodeJS {
    interface ProcessEnv {
      UPSTASH_REDIS_URL: string
      UPSTASH_REDIS_TOKEN: string
    }
  }