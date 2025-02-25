// app/generate-address/page.tsx

import React from 'react';
import OpenStreetGenerateAddress from './generate-address-compoennts/generate-address';

export const metadata = {
  title: 'Generate Digital Address | oKLocation',
  description: 'Generate a digital address from your current location'
};

const GenerateAddressPage = () => {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-20">
      <div className="py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">
            Generate Digital Address
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Get your digital address using your current location
          </p>
        </div>
        <OpenStreetGenerateAddress />
      </div>
    </main>
  );
};

export default GenerateAddressPage;