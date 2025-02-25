
// src/components/api-key-list.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useApiKeys } from '@/hooks/use-api-keys'

export function ApiKeyList() {
  const { data: apiKeys, isLoading, error } = useApiKeys()
  const [isGenerating, setIsGenerating] = useState(false)

  const generateNewKey = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Failed to generate key')
      
      toast.success('New API Key generated.', {
        description: 'You can now use this key to authenticate your requests.',
        action: {
            label: 'Copy Key',
            onClick: () => {
              toast.success('API Key copied to clipboard')
            }
        }
      })
    } catch {
        toast.error('Failed to generate key', {
            description: 'An error occurred while generating a new API key.',
            action: {
                label: 'Retry',
                onClick: generateNewKey
            }
        })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading API keys</div>

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys and monitor their usage.
            </CardDescription>
          </div>
          <Button 
            onClick={generateNewKey}
            disabled={isGenerating}
          >
            Generate New Key
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>API Key</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Requests (24h)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys?.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-mono">{key.key}</TableCell>
                <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {key.lastUsed 
                    ? new Date(key.lastUsed).toLocaleDateString()
                    : 'Never'
                  }
                </TableCell>
                <TableCell>{key.dailyRequests}</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    key.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}>
                    {key.active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Implement key revocation */}}
                  >
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}