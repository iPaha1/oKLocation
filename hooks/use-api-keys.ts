// src/hooks/use-api-keys.ts
import { useQuery } from '@tanstack/react-query'
import { ApiKey } from '@/types/api-keys'

export function useApiKeys() {
  return useQuery<ApiKey[]>({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await fetch('/api/keys')
      if (!response.ok) {
        throw new Error('Failed to fetch API keys')
      }
      return response.json()
    }
  })
}