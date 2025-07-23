import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';

export function FromLocation() {
  const { formData, updateFormData, nextStep, errors } = useLeadStore();
  const [address, setAddress] = useState(formData.addresses?.pickup?.address || '');
  
  const generateGoogleMapsUrl = (address) => {
    if (!address.trim()) return '';
    const encodedAddress = encodeURIComponent(address.trim());
    return `https://maps.google.com/maps?width=100%25&amp;height=300&amp;hl=en&amp;q=${encodedAddress}&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed`;
  };
  
  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (address.trim()) {
      const googleMapsUrl = generateGoogleMapsUrl(address);
      updateFormData('addresses', {
        ...formData.addresses,
        pickup: {
          ...formData.addresses.pickup,
          address: address.trim(),
          googleMapsUrl
        }
      });
      nextStep();
    }
  };
  
  const mapsUrl = address.trim() ? generateGoogleMapsUrl(address) : '';
  
  return (
    <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Where are you moving from?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Enter your pickup location so we can provide accurate pricing and logistics
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Address Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Pickup Address
          </label>
          <div className="relative group">
            <MapPin className="input-icon group-focus-within:text-primary" />
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder="Enter your current address..."
              className={`
                w-full pl-12 pr-4 py-3 border rounded-xl text-sm
                transition-all duration-200
                placeholder:text-muted-foreground/60
                ${errors.pickupAddress
                  ? 'border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10'
                  : 'border-border hover:border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10'
                }
                focus:outline-none bg-background/50 hover:bg-background
              `}
            />
          </div>
          {errors.pickupAddress && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1 h-1 bg-destructive rounded-full" />
              <p className="text-sm text-destructive font-medium">{errors.pickupAddress}</p>
            </div>
          )}
        </div>
        
        {/* Map Preview */}
        {mapsUrl && (
          <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <p className="text-sm font-medium text-foreground">Location Preview</p>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-sm">
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 shadow-sm">
                  <p className="text-sm font-medium text-foreground">Pickup Location</p>
                </div>
              </div>
              <div className="w-full h-64 bg-muted">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={mapsUrl}
                  title="Pickup Location Map"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Continue Button */}
        <div className="border-t border-border/20 pt-6 mt-6">
          <button
            type="submit"
            disabled={!address.trim()}
            className="
              w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg 
              font-semibold text-sm shadow-sm hover:shadow-md
              hover:bg-primary/90 active:scale-[0.99]
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              disabled:shadow-sm
            "
          >
            Continue
          </button>
        </div>
      </form>
      
      {/* Footer Note */}
      <div className="mt-8 pt-6 border-t border-border/30">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
          <p className="text-sm">
            Used for accurate pricing and route optimization
          </p>
          <div className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}