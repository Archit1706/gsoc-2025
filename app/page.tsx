import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { ClosuresProvider } from '@/context/ClosuresContext';
import Layout from '@/components/Layout/Layout';
import ClosureForm from '@/components/Forms/ClosureForm';
import L from 'leaflet';

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(
  () => import('@/components/Map/MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<L.LatLng | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  const handleToggleForm = () => {
    if (isFormOpen) {
      // Reset location selection when closing form
      setSelectedLocation(null);
      setIsSelectingLocation(false);
    }
    setIsFormOpen(!isFormOpen);
  };

  const handleLocationSelect = () => {
    setIsSelectingLocation(true);
  };

  const handleMapClick = (latlng: L.LatLng) => {
    if (isSelectingLocation) {
      setSelectedLocation(latlng);
      setIsSelectingLocation(false);
    }
  };

  return (
    <ClosuresProvider>
      <div className="h-screen">
        <Layout
          onToggleForm={handleToggleForm}
          isFormOpen={isFormOpen}
        >
          <MapComponent
            onMapClick={handleMapClick}
            selectedLocation={selectedLocation}
            isSelecting={isSelectingLocation}
          />

          <ClosureForm
            isOpen={isFormOpen}
            onClose={handleToggleForm}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            isSelectingLocation={isSelectingLocation}
          />
        </Layout>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ClosuresProvider>
  );
}