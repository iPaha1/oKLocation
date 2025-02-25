// src/hooks/use-api-usage.ts
import { useQuery } from '@tanstack/react-query'

export function useApiUsage() {
  return useQuery({
    queryKey: ['api-usage'],
    queryFn: async () => {
      const response = await fetch('/api/usage')
      if (!response.ok) {
        throw new Error('Failed to fetch API usage')
      }
      return response.json()
    },
    refetchInterval: 60000, // Refetch every minute
  })
}

// let's get all the saved locations from the database
export function useSavedLocations() {
  return useQuery({
    queryKey: ['saved-locations'],
    queryFn: async () => {
      const response = await fetch('/api/v1/saved-locations')
      if (!response.ok) {
        throw new Error('Failed to fetch saved locations')
      }
      return response.json()
    },
  })
}

// let's get a saved location by its address (digitalAddress)


export function useSavedLocation(address: string) {
  return useQuery({
    queryKey: ['saved-location', address],
    queryFn: async () => {
      const response = await fetch(`/api/v1/saved-locations?address=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch saved location')
      }
      return response.json()
    },
  })
}
