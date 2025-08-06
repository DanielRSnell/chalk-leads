import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';

export function AddressCollection() {
  const { formData, updateFormData, nextStep, errors } = useLeadStore();
  const [pickupAddress, setPickupAddress] = useState(formData.addresses?.pickup || '');
  const [destinationAddress, setDestinationAddress] = useState(formData.addresses?.destination || '');
  
  const handlePickupChange = (e) => {
    setPickupAddress(e.target.value);
  };
  
  const handleDestinationChange = (e) => {
    setDestinationAddress(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (pickupAddress.trim() && destinationAddress.trim()) {
      updateFormData('addresses', {
        pickup: pickupAddress.trim(),
        destination: destinationAddress.trim()
      });
      nextStep();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-md font-semibold text-foreground mb-2">
          Where are you moving?
        </h2>
        <p className="text-muted-foreground">
          Enter your pickup and destination addresses
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pickup Address */}
        <div className="relative">
          <MapPin className="input-icon" />
          <input
            type="text"
            value={pickupAddress}
            onChange={handlePickupChange}
            placeholder="Pickup address..."
            className={`
              w-full pl-10 pr-4 py-3 border rounded-lg transition-colors
              ${errors.pickupAddress
                ? 'border-destructive focus:border-destructive focus:ring-destructive'
                : 'border-input focus:border-primary focus:ring-primary'
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2
            `}
          />
          {errors.pickupAddress && (
            <p className="mt-1 text-sm text-destructive">{errors.pickupAddress}</p>
          )}
        </div>
        
        {/* Destination Address */}
        <div className="relative">
          <Navigation className="input-icon" />
          <input
            type="text"
            value={destinationAddress}
            onChange={handleDestinationChange}
            placeholder="Destination address..."
            className={`
              w-full pl-10 pr-4 py-3 border rounded-lg transition-colors
              ${errors.destinationAddress
                ? 'border-destructive focus:border-destructive focus:ring-destructive'
                : 'border-input focus:border-primary focus:ring-primary'
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2
            `}
          />
          {errors.destinationAddress && (
            <p className="mt-1 text-sm text-destructive">{errors.destinationAddress}</p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Continue
        </button>
      </form>
      
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          We'll use this to provide accurate pricing and availability
        </p>
      </div>
    </div>
  );
}