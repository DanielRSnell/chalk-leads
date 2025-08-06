import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Clock, Loader2, Check, AlertTriangle, DollarSign } from 'lucide-react';

export function RouteCalculation({ pickupAddress, destinationAddress, onComplete }) {
  const [isLoading, setIsLoading] = useState(true);
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (pickupAddress && destinationAddress) {
      calculateRoute();
    }
  }, [pickupAddress, destinationAddress]);

  const handleConfirmRoute = () => {
    const distance = routeData?.distance?.miles || 10;
    const duration = routeData?.duration?.minutes || 20;
    
    console.log('✅ User confirmed route:', { distance, duration });
    
    onComplete({
      routeDistance: distance,
      routeDuration: duration,
      routeData: routeData
    });
  };

  // Set up global navigation for this step (always at top level)
  useEffect(() => {
    window.routeCalculationNavigation = {
      handleContinue: handleConfirmRoute,
      canSkip: false,
      buttonText: 'Confirm'
    };
    
    return () => {
      delete window.routeCalculationNavigation;
    };
  }, [routeData]);

  const calculateRoute = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🗺️ Calculating route from:', pickupAddress, 'to:', destinationAddress);
      
      const apiUrl = window.moovinleadsData?.apiUrl || '/wp-json/moovinleads/v1/';
      const url = `${apiUrl}mapbox/directions?pickup=${encodeURIComponent(pickupAddress)}&destination=${encodeURIComponent(destinationAddress)}`;
      
      console.log('🔍 Fetching route from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📍 Route calculated:', data);
      
      setRouteData(data);
      setShowConfirmation(true);
      
    } catch (err) {
      console.error('❌ Route calculation error:', err);
      setError(err.message);
      
      // Show confirmation with default distance after error
      setRouteData({
        distance: { miles: 10, text: '10 miles (estimated)' },
        duration: { minutes: 20, text: '20 min (estimated)' }
      });
      setShowConfirmation(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Route Calculation Issue
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We couldn't calculate the exact route, but we'll use an estimated distance for your quote.
          </p>
        </div>
        
        <div className="animate-pulse text-sm text-muted-foreground">
          Continuing with estimate...
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Calculating Route
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We're calculating the driving distance between your locations to provide an accurate estimate.
          </p>
        </div>
        
        <div className="space-y-3 w-full max-w-sm">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-sm font-medium text-foreground truncate">
                {pickupAddress}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Navigation className="w-5 h-5 text-primary animate-pulse" />
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">To</p>
              <p className="text-sm font-medium text-foreground truncate">
                {destinationAddress}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showConfirmation && routeData) {
    const distance = routeData?.distance?.miles || 10;
    const travelCost = distance * 4; // $4 per mile
    
    return (
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Distance
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {routeData?.distance?.text || 'N/A'}
            </div>
          </div>
          
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Travel Cost
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${travelCost}
            </div>
          </div>
        </div>
        
        <div className="w-full max-w-sm bg-card border border-border rounded-lg">
          <div className="flex items-start gap-3 p-4">
            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1 text-left">Pickup</p>
              <p className="text-sm text-foreground truncate">
                {pickupAddress}
              </p>
            </div>
          </div>
          
          <div className="border-t border-border/20"></div>
          
          <div className="flex items-start gap-3 p-4">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1 text-left">Destination</p>
              <p className="text-sm text-foreground truncate">
                {destinationAddress}
              </p>
            </div>
          </div>
        </div>
        
        
      </div>
    );
  }

  return null;
}