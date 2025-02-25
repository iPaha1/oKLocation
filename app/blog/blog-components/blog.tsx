// app/blog/page.tsx

import { Card } from '@/components/ui/card';

export default function Blog() {
  return (
    <div className="container mx-auto py-12 px-4 mt-20">
      <h1 className="text-4xl font-bold mb-8">About oKLocation API</h1>

      {/* Introduction */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Introduction</h2>
        <p className="text-muted-foreground">
          The oKLocation API is a powerful tool designed to provide accurate and detailed location information for Ghana. It converts latitude and longitude coordinates into digital addresses, districts, regions, and other relevant location data. This API is particularly useful for applications that require precise location-based services, such as delivery tracking, emergency response, and urban planning.
        </p>
      </Card>

      {/* Use Cases */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Use Cases</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Delivery Services:</strong> Convert GPS coordinates into readable addresses for accurate package delivery.
          </li>
          <li>
            <strong>Emergency Response:</strong> Quickly identify the exact location of emergencies using digital addresses.
          </li>
          <li>
            <strong>Urban Planning:</strong> Analyze location data for infrastructure development and resource allocation.
          </li>
          <li>
            <strong>Ride-Hailing Apps:</strong> Provide precise pickup and drop-off locations for drivers and passengers.
          </li>
          <li>
            <strong>E-Commerce:</strong> Validate customer addresses for seamless order processing.
          </li>
        </ul>
      </Card>

      {/* Purpose */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Purpose</h2>
        <p className="text-muted-foreground">
          The primary purpose of the oKLocation API is to simplify location-based services in Ghana. By converting raw GPS coordinates into meaningful addresses, it bridges the gap between technology and real-world applications. This API is designed to:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>Enhance accuracy in location-based services.</li>
          <li>Improve user experience by providing readable addresses.</li>
          <li>Support businesses and developers in building location-aware applications.</li>
          <li>Promote the use of digital addresses in Ghana.</li>
        </ul>
      </Card>

      {/* Relevance */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Relevance</h2>
        <p className="text-muted-foreground">
          In a rapidly digitizing world, accurate location data is crucial for various industries. The oKLocation API is particularly relevant in Ghana, where traditional addressing systems can be inconsistent. By providing a standardized way to generate digital addresses, this API:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>Supports the Ghana Post GPS initiative.</li>
          <li>Facilitates easier navigation and location tracking.</li>
          <li>Enables businesses to operate more efficiently.</li>
          <li>Encourages the adoption of digital solutions in everyday life.</li>
        </ul>
      </Card>

      {/* Detailed API Documentation */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">API Documentation</h2>
        <p className="text-muted-foreground mb-4">
          The oKLocation API is easy to integrate and provides comprehensive location data. Below is a detailed guide on how to use the API.
        </p>

        {/* Authentication */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Authentication</h3>
          <p className="text-muted-foreground">
            To use the API, you need an API key and secret. Include these in your requests as headers:
          </p>
          <pre className="bg-muted p-4 rounded-md mt-2">
            <code>
              Authorization: Bearer YOUR_API_KEY<br />
              x-api-secret: YOUR_API_SECRET
            </code>
          </pre>
        </div>

        {/* Endpoints */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Endpoints</h3>
          <p className="text-muted-foreground">
            The API provides the following endpoint:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>
              <strong>GET /api/v1/address:</strong> Convert latitude and longitude coordinates into a digital address.
            </li>
          </ul>
        </div>

        {/* Example Request */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Example Request</h3>
          <pre className="bg-muted p-4 rounded-md mt-2">
            <code>
              GET /api/v1/address?lat=5.6037&lng=-0.1870<br />
              Authorization: Bearer YOUR_API_KEY<br />
              x-api-secret: YOUR_API_SECRET
            </code>
          </pre>
        </div>

        {/* Example Response */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Example Response</h3>
          <pre className="bg-muted p-4 rounded-md mt-2">
            <code>
              {JSON.stringify(
                {
                  address: 'GA-123-4567',
                  district: 'Accra',
                  region: 'Greater Accra',
                  coordinates: {
                    latitude: 5.6037,
                    longitude: -0.1870,
                  },
                  postCode: 'GA-123',
                },
                null,
                2
              )}
            </code>
          </pre>
        </div>

        {/* Error Handling */}
        <div>
          <h3 className="text-xl font-bold mb-2">Error Handling</h3>
          <p className="text-muted-foreground">
            The API returns standard HTTP status codes for errors:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>400:</strong> Missing or invalid parameters.</li>
            <li><strong>401:</strong> Unauthorized access (invalid API key or secret).</li>
            <li><strong>429:</strong> Rate limit exceeded.</li>
            <li><strong>500:</strong> Internal server error.</li>
          </ul>
        </div>
      </Card>

      {/* Call to Action */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Get Started</h2>
        <p className="text-muted-foreground">
          Ready to integrate the oKLocation API into your application?{' '}
          <a
            href="/documentation"
            className="text-primary hover:underline"
          >
            Visit the documentation
          </a>{' '}
          to learn more.
        </p>
      </Card>
    </div>
  );
}