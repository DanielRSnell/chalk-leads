import React, { useEffect, useRef, useState } from 'react';
import { MapPin, AlertTriangle, Check } from 'lucide-react';

// API key should be provided via environment variables or server-side configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

export function GooglePlacesAutocomplete({ 
  value, 
  onChange, 
  placeholder, 
  label,
  icon: IconComponent 
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [selectedFromAutocomplete, setSelectedFromAutocomplete] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Google Places API
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsScriptLoaded(true);
      return;
    }

    if (!GOOGLE_PLACES_API_KEY) {
      console.error('Google Places API key not configured');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Places API');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize autocomplete when script is loaded
  useEffect(() => {
    if (isScriptLoaded && inputRef.current && !autocompleteRef.current) {
      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'address_components', 'geometry', 'place_id']
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (place.formatted_address) {
            setSelectedFromAutocomplete(true);
            onChange(place.formatted_address);
          }
        });
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error);
      }
    }
  }, [isScriptLoaded, onChange]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSelectedFromAutocomplete(false);
    onChange(newValue);
  };

  const handleInputBlur = () => {
    // Check if user typed something but didn't select from autocomplete
    if (value && !selectedFromAutocomplete && value.trim().length > 10) {
      setManualAddress(value);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmAddress = () => {
    setSelectedFromAutocomplete(true);
    setShowConfirmDialog(false);
    onChange(manualAddress);
  };

  const handleCancelAddress = () => {
    setShowConfirmDialog(false);
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative group mt-3">
        {IconComponent && (
          <IconComponent className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-4 py-3 border rounded-xl text-sm
            transition-all duration-200 placeholder:text-muted-foreground/60
            border-border hover:border-border/80 focus:border-primary 
            focus:ring-4 focus:ring-primary/10 focus:outline-none 
            bg-background/50 hover:bg-background
          "
        />
        {selectedFromAutocomplete && value && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Check className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>

      {/* Address Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 shadow-2xl max-w-md mx-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Address is different from what we found
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  We couldn't find this exact address in our database. Is this address correct?
                </p>
                <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">
                      {manualAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancelAddress}
                className="flex-1 py-2.5 px-4 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                Let me fix it
              </button>
              <button
                onClick={handleConfirmAddress}
                className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Confirm address
              </button>
            </div>
          </div>
        </div>
      )}

      {!isScriptLoaded && !GOOGLE_PLACES_API_KEY && (
        <div className="text-xs text-red-500">
          Google Places API key not configured
        </div>
      )}

      {!isScriptLoaded && GOOGLE_PLACES_API_KEY && (
        <div className="text-xs text-muted-foreground">
          Loading address suggestions...
        </div>
      )}
    </div>
  );
}