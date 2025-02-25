// app/(routes)/documentation/components/documentation-content.tsx

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { CodeBlock } from './code-block';

export function DocumentationContent() {
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'curl'>('javascript');

  const endpoints = [
    {
      name: 'Get Location by Coordinates',
      method: 'GET',
      path: '/api/v1/address',
      description: 'Convert latitude and longitude coordinates to a oKLocation address.',
      parameters: [
        { name: 'lat', type: 'number', description: 'Latitude coordinate' },
        { name: 'lng', type: 'number', description: 'Longitude coordinate' },
      ],
      codeExamples: {
        javascript: `const response = await fetch('/api/v1/address?lat=5.6037&lng=-0.1870', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'x-api-secret': 'YOUR_API_SECRET'
  }
});

const data = await response.json();
console.log(data);`,
        python: `import requests

response = requests.get(
    'https://api.example.com/v1/address',
    params={'lat': 5.6037, 'lng': -0.1870},
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'x-api-secret': 'YOUR_API_SECRET'
    }
)

data = response.json()
print(data)`,
        curl: `curl -X GET 'https://api.example.com/v1/address?lat=5.6037&lng=-0.1870' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'x-api-secret: YOUR_API_SECRET'`,
      },
      response: {
        success: {
          address: 'GA-123-4567',
          district: 'Accra',
          region: 'Greater Accra',
          coordinates: {
            latitude: 5.6037,
            longitude: -0.1870,
          },
          postCode: 'GA-123',
        },
      },
    },
    // Add more endpoints here
  ];

  return (
    <div className="space-y-8">
      {/* Authentication Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Authentication</h2>
        <p className="text-muted-foreground mb-4">
          To use the oKLocation API, you need an API key and secret. You can get these from your dashboard.
        </p>
        <div className="bg-muted p-4 rounded-md">
          <p className="font-mono text-sm">
            Authorization: Bearer YOUR_API_KEY
            <br />
            x-api-secret: YOUR_API_SECRET
          </p>
        </div>
      </Card>

      {/* Rate Limits Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
        <p className="text-muted-foreground">
          The API has the following rate limits:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>100 requests per day for free tier</li>
          <li>1000 requests per day for basic tier</li>
          <li>Custom limits available for enterprise plans</li>
        </ul>
      </Card>


    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
      <p className="text-muted-foreground">
        The API has the following rate limits:
      </p>
      <ul className="list-disc list-inside mt-2 space-y-2">
        <li>100 requests per day for free tier</li>
        <li>1000 requests per day for basic tier</li>
        <li>Custom limits available for enterprise plans</li>
      </ul>
      <p className="text-muted-foreground mt-4">
        Need higher rate limits?{' '}
        <a
          href="/apply-for-higher-rate-limits"
          className="text-primary hover:underline"
        >
          Contact our team
        </a>{' '}
        to discuss custom plans.
      </p>
    </Card>

      {/* Error Handling Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
        <p className="text-muted-foreground mb-4">
          The API returns standard HTTP status codes to indicate success or failure. Below are the common error responses:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-muted rounded-md">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Status Code</th>
                <th className="px-4 py-2 text-left font-semibold">Message</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 font-mono">400</td>
                <td className="px-4 py-2">Missing or invalid parameters</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">401</td>
                <td className="px-4 py-2">Unauthorized access (invalid API key or secret)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">429</td>
                <td className="px-4 py-2">Rate limit exceeded</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">500</td>
                <td className="px-4 py-2">Internal server error</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Endpoints Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Endpoints</h2>
        {endpoints.map((endpoint) => (
          <Card key={endpoint.path} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm font-mono">
                {endpoint.method}
              </span>
              <span className="font-mono text-sm">{endpoint.path}</span>
            </div>

            <p className="text-muted-foreground mb-4">{endpoint.description}</p>

            {/* Parameters */}
            <div className="mb-6">
              <h3 className="font-bold mb-2">Parameters</h3>
              <ul className="space-y-2">
                {endpoint.parameters.map((param) => (
                  <li key={param.name} className="flex items-start gap-2">
                    <span className="font-mono text-sm">{param.name}</span>
                    <span className="text-muted-foreground text-sm">({param.type})</span>
                    <span className="text-sm">{param.description}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code Examples */}
            <div className="mb-6">
              <h3 className="font-bold mb-2">Example Request</h3>
              <Tabs value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as 'javascript' | 'python' | 'curl')}>
                <TabsList>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>
                <TabsContent value={selectedLanguage}>
                  <CodeBlock code={endpoint.codeExamples[selectedLanguage]} language={selectedLanguage} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Response */}
            <div>
              <h3 className="font-bold mb-2">Example Response</h3>
              <CodeBlock code={JSON.stringify(endpoint.response.success, null, 2)} language="json" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}








// // app/(routes)/documentation/components/documentation-content.tsx
// 'use client'

// import { useState } from 'react'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Card } from '@/components/ui/card'
// import { CodeBlock } from './code-block'


// export function DocumentationContent() {
//   const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'curl'>('javascript')

//   const endpoints = [
//     {
//       name: 'Get Location by Coordinates',
//       method: 'GET',
//       path: '/api/v1/address',
//       description: 'Convert latitude and longitude coordinates to a oKLocation address.',
//       parameters: [
//         { name: 'lat', type: 'number', description: 'Latitude coordinate' },
//         { name: 'lng', type: 'number', description: 'Longitude coordinate' }
//       ],
//       codeExamples: {
//         javascript: `const response = await fetch('/api/v1/address?lat=5.6037&lng=-0.1870', {
//   headers: {
//     'Authorization': 'Bearer YOUR_API_KEY',
//     'x-api-secret': 'YOUR_API_SECRET'
//   }
// });

// const data = await response.json();
// console.log(data);`,
//         python: `import requests

// response = requests.get(
//     'https://api.example.com/v1/address',
//     params={'lat': 5.6037, 'lng': -0.1870},
//     headers={
//         'Authorization': 'Bearer YOUR_API_KEY',
//         'x-api-secret': 'YOUR_API_SECRET'
//     }
// )

// data = response.json()
// print(data)`,
//         curl: `curl -X GET 'https://api.example.com/v1/address?lat=5.6037&lng=-0.1870' \\
//   -H 'Authorization: Bearer YOUR_API_KEY' \\
//   -H 'x-api-secret: YOUR_API_SECRET'`
//       },
//       response: {
//         success: {
//           address: 'GA-123-4567',
//           district: 'Accra',
//           region: 'Greater Accra',
//           coordinates: {
//             latitude: 5.6037,
//             longitude: -0.1870
//           },
//           postCode: 'GA-123'
//         }
//       }
//     }
//     // Add more endpoints here
//   ]

//   return (
//     <div className="space-y-8">
//       {/* Authentication */}
//       <Card className="p-6">
//         <h2 className="text-2xl font-bold mb-4">Authentication</h2>
//         <p className="text-muted-foreground mb-4">
//           To use the oKLocation API, you need an API key and secret. You can get these from your dashboard.
//         </p>
//         <div className="bg-muted p-4 rounded-md">
//           <p className="font-mono text-sm">
//             Authorization: Bearer YOUR_API_KEY
//             <br />
//             x-api-secret: YOUR_API_SECRET
//           </p>
//         </div>
//       </Card>

//       {/* Rate Limits */}
//       <Card className="p-6">
//         <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
//         <p className="text-muted-foreground">
//           The API has the following rate limits:
//         </p>
//         <ul className="list-disc list-inside mt-2 space-y-2">
//           <li>100 requests per day for free tier</li>
//           <li>1000 requests per day for basic tier</li>
//           <li>Custom limits available for enterprise plans</li>
//         </ul>
//       </Card>

//       {/* Endpoints */}
//       <div className="space-y-6">
//         <h2 className="text-2xl font-bold">Endpoints</h2>
//         {endpoints.map((endpoint) => (
//           <Card key={endpoint.path} className="p-6">
//             <div className="flex items-center gap-2 mb-4">
//               <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm font-mono">
//                 {endpoint.method}
//               </span>
//               <span className="font-mono text-sm">{endpoint.path}</span>
//             </div>
            
//             <p className="text-muted-foreground mb-4">{endpoint.description}</p>

//             {/* Parameters */}
//             <div className="mb-6">
//               <h3 className="font-bold mb-2">Parameters</h3>
//               <ul className="space-y-2">
//                 {endpoint.parameters.map((param) => (
//                   <li key={param.name} className="flex items-start gap-2">
//                     <span className="font-mono text-sm">{param.name}</span>
//                     <span className="text-muted-foreground text-sm">({param.type})</span>
//                     <span className="text-sm">{param.description}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Code Examples */}
//             <div className="mb-6">
//               <h3 className="font-bold mb-2">Example Request</h3>
//               <Tabs value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as 'javascript' | 'python' | 'curl')}>
//                 <TabsList>
//                   <TabsTrigger value="javascript">JavaScript</TabsTrigger>
//                   <TabsTrigger value="python">Python</TabsTrigger>
//                   <TabsTrigger value="curl">cURL</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value={selectedLanguage}>
//                   <CodeBlock 
//                     code={endpoint.codeExamples[selectedLanguage]} 
//                     language={selectedLanguage}
//                   />
//                 </TabsContent>
//               </Tabs>
//             </div>

//             {/* Response */}
//             <div>
//               <h3 className="font-bold mb-2">Example Response</h3>
//               <CodeBlock
//                 code={JSON.stringify(endpoint.response.success, null, 2)}
//                 language="json"
//               />
//             </div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )
// }