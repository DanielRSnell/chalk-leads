import React, { useState, useEffect } from 'react';
import { MAPBOX_TOKEN } from '../../../utils/constants';

export function MapboxPreview({ address, locationLabel }) {
  const [mapUrl, setMapUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [coordinates, setCoordinates] = useState(null);

  useEffect(() => {
    const geocodeAddress = async () => {
      if (!address || !address.trim()) {
        setMapUrl('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Use Mapbox Geocoding API to get coordinates
        const encodedAddress = encodeURIComponent(address.trim());
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
        
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          setCoordinates({ lat, lng });
          
          // Create static map URL with Mapbox Static Images API
          const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s-building+ff0000(${lng},${lat})/${lng},${lat},14,0/400x256@2x?access_token=${MAPBOX_TOKEN}`;
          setMapUrl(staticMapUrl);
        } else {
          setMapUrl('');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setMapUrl('');
      } finally {
        setIsLoading(false);
      }
    };

    geocodeAddress();
  }, [address]);

  if (!address || !address.trim()) {
    return null;
  }

  return (
    <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-success rounded-full" />
        <p className="text-sm font-medium text-foreground">Location Preview</p>
      </div>
      
      <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-sm">
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 shadow-sm">
            <p className="text-sm font-medium text-foreground">{locationLabel}</p>
          </div>
        </div>
        
        <div className="w-full h-64 bg-muted relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading map...</span>
              </div>
            </div>
          ) : mapUrl ? (
            <img 
              src={mapUrl}
              alt={`${locationLabel} Map`}
              className="w-full h-full object-cover"
              onError={() => setMapUrl('')}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Unable to load map preview</p>
                <p className="text-xs mt-1">Please verify the address</p>
              </div>
            </div>
          )}
        </div>
        
        {coordinates && (
          <div className="absolute bottom-4 right-4">
            <div className="bg-card/90 backdrop-blur-sm px-2 py-1 rounded border border-border/50 shadow-sm">
              <p className="text-xs text-muted-foreground">
                {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}