// app/(dashboard)/dashboard/dashboard-components/api-management.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy, Key } from 'lucide-react'
import { toast } from 'sonner'

interface ApiKey {
  id: string
  key: string
  secret: string
  active: boolean
  requests: number
  dailyRequests: number
  monthlyRequests: number
  createdAt: string
  lastUsed?: string
}

export default function ApiKeysManager() {
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [newKeyDetails, setNewKeyDetails] = useState<{ key: string; secret: string } | null>(null)
  const queryClient = useQueryClient()

  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await fetch('/api/keys')
      if (!response.ok) throw new Error('Failed to fetch API keys')
      return response.json()
    }
  })

  // Create new API key
  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/keys', {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to create API key')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      setNewKeyDetails({ key: data.key, secret: data.secret })
      setShowNewKeyDialog(true)
      toast.success('API key generated successfully')
    }
  })

  // Deactivate API key
  const deactivateMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to deactivate API key')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('API key deactivated successfully')
    }
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys and monitor their usage
            </CardDescription>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Key className="w-4 h-4 mr-2" />
            Generate New Key
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apiKeys?.map((key) => (
            <Card key={key.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">{key.key}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(key.key)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(key.createdAt).toLocaleDateString()}
                    {key.lastUsed && ` • Last used: ${new Date(key.lastUsed).toLocaleDateString()}`}
                  </div>
                  <div className="text-sm">
                    Requests today: {key.dailyRequests} • Monthly: {key.monthlyRequests}
                  </div>
                </div>
                {key.active && (
                  <AlertDialog>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate API Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The API key will no longer work.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deactivateMutation.mutate(key.id)}
                        >
                          Deactivate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </Card>
          ))}
        </div>
      </CardContent>

      {/* New Key Dialog */}
      <AlertDialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>New API Key Generated</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    Make sure to copy your API key and secret now. You won&apos;t be able to see the secret again!
                  </p>
                </div>
                {newKeyDetails && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium">API Key</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="flex-1 p-2 bg-muted rounded text-sm">
                          {newKeyDetails.key}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(newKeyDetails.key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">API Secret</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="flex-1 p-2 bg-muted rounded text-sm">
                          {newKeyDetails.secret}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(newKeyDetails.secret)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowNewKeyDialog(false)}>
              I&apos;ve saved my API key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}








// "use client";

// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import { 
//   Card, 
//   CardContent, 
//   CardHeader, 
//   CardTitle, 
//   CardDescription 
// } from '@/components/ui/card';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from '@/components/ui/alert-dialog';
// import { Copy, Key, AlertTriangle } from 'lucide-react';
// import { toast } from 'sonner';

// export default function ApiKeysManager() {
//   const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
//   const [newKeyDetails, setNewKeyDetails] = useState<null | { key: string; secret: string }>(null);
//   const queryClient = useQueryClient();

//   // Fetch API keys
//   const { data: apiKeys, isLoading, error } = useQuery({
//     queryKey: ['api-keys'],
//     queryFn: async () => {
//       const response = await fetch('/api/keys');
//       if (!response.ok) throw new Error('Failed to fetch API keys');
//       return response.json();
//     },
//   });

//   // Create new API key
//   const createMutation = useMutation({
//     mutationFn: async () => {
//       const response = await fetch('/api/keys', {
//         method: 'POST',
//       });
//       if (!response.ok) throw new Error('Failed to create API key');
//       return response.json();
//     },
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ['api-keys'] });
//       setNewKeyDetails({ key: data.key, secret: data.secret });
//       setShowNewKeyDialog(true);
//       toast.success('API key generated successfully');
//     },
//     onError: () => {
//         toast.error('Failed to generate API key');
//     },
//   });

//   // Deactivate API key
//   const deactivateMutation = useMutation({
//     mutationFn: async (keyId: string) => {
//       const response = await fetch(`/api/keys?id=${keyId}`, {
//         method: 'DELETE',
//       });
//       if (!response.ok) throw new Error('Failed to deactivate API key');
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['api-keys'] });
//         toast.success('API key deactivated successfully');
//     },
//     onError: () => {
//         toast.error('Failed to deactivate API key');
//     },
//   });

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     toast.success('Copied to clipboard');
//   };

//   if (isLoading) return <div className="flex items-center justify-center p-6">Loading...</div>;
//   if (error) return <div className="text-red-500 p-6">Error loading API keys</div>;

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle>API Keys</CardTitle>
//             <CardDescription>
//               Manage your API keys and monitor their usage
//             </CardDescription>
//           </div>
//           <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
//             <Key className="w-4 h-4 mr-2" />
//             Generate New Key
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {apiKeys?.map((key: { id: string; key: string; active: boolean; createdAt: string }) => (
//             <Card key={key.id} className="p-4">
//               <div className="flex items-center justify-between">
//                 <div className="space-y-2">
//                   <div className="flex items-center space-x-2">
//                     <span className="font-mono text-sm">{key.key}</span>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => copyToClipboard(key.key)}
//                     >
//                       <Copy className="w-4 h-4" />
//                     </Button>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <span className={`px-2 py-1 text-xs rounded-full ${
//                       key.active 
//                         ? 'bg-green-100 text-green-800' 
//                         : 'bg-red-100 text-red-800'
//                     }`}>
//                       {key.active ? 'Active' : 'Inactive'}
//                     </span>
//                     <span className="text-sm text-muted-foreground">
//                       Created on {new Date(key.createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//                 {key.active && (
//                   <AlertDialog>
//                     <AlertDialogTrigger asChild>
//                       <Button variant="destructive" size="sm">Deactivate</Button>
//                     </AlertDialogTrigger>
//                     <AlertDialogContent>
//                       <AlertDialogHeader>
//                         <AlertDialogTitle>Deactivate API Key</AlertDialogTitle>
//                         <AlertDialogDescription>
//                           Are you sure you want to deactivate this API key? 
//                           This action cannot be undone.
//                         </AlertDialogDescription>
//                       </AlertDialogHeader>
//                       <AlertDialogFooter>
//                         <AlertDialogCancel>Cancel</AlertDialogCancel>
//                         <AlertDialogAction
//                           onClick={() => deactivateMutation.mutate(key.id)}
//                         >
//                           Deactivate
//                         </AlertDialogAction>
//                       </AlertDialogFooter>
//                     </AlertDialogContent>
//                   </AlertDialog>
//                 )}
//               </div>
//             </Card>
//           ))}
//         </div>
//       </CardContent>

//       {/* New Key Dialog */}
//       <AlertDialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>New API Key Generated</AlertDialogTitle>
//             <AlertDialogDescription>
//               <div className="space-y-4">
//                 <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
//                   <div className="flex items-center space-x-2">
//                     <AlertTriangle className="w-4 h-4 text-yellow-600" />
//                     <span className="text-sm text-yellow-800">
//                       Make sure to copy your API key and secret now. 
//                       You won&apos;t be able to see the secret again!
//                     </span>
//                   </div>
//                 </div>
//                 {newKeyDetails && (
//                   <div className="space-y-2">
//                     <div>
//                       <label className="block text-sm font-medium">API Key</label>
//                       <div className="flex items-center space-x-2 mt-1">
//                         <code className="p-2 bg-muted rounded text-sm flex-1">
//                           {newKeyDetails.key}
//                         </code>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => copyToClipboard(newKeyDetails.key)}
//                         >
//                           <Copy className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium">API Secret</label>
//                       <div className="flex items-center space-x-2 mt-1">
//                         <code className="p-2 bg-muted rounded text-sm flex-1">
//                           {newKeyDetails.secret}
//                         </code>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => copyToClipboard(newKeyDetails.secret)}
//                         >
//                           <Copy className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogAction onClick={() => setShowNewKeyDialog(false)}>
//               I&apos;ve saved my API key
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </Card>
//   );
// }