import React from 'react';
import { Truck, Users } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';
import { ServiceOption } from '../ui/ServiceOption';
import { AvatarPrompt } from '../ui/AvatarPrompt';

export function WelcomeScreen() {
  const { updateFormData, nextStep } = useLeadStore();
  
  const handleServiceSelect = (serviceType) => {
    updateFormData('serviceType', serviceType);
    nextStep();
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center">
      <AvatarPrompt message="How can we help you today?" />
      
      <div className="grid grid-cols-1 gap-4 w-full">
        <ServiceOption
          icon={<Truck className="w-8 h-8" />}
          title="Full Service Moving"
          description="We bring the crew and the trucks"
          onClick={() => handleServiceSelect('full-service')}
        />
        
        <ServiceOption
          icon={<Users className="w-8 h-8" />}
          title="Labor Only Services"
          description="Our professionals help you load and/or unload into your own truck"
          onClick={() => handleServiceSelect('labor-only')}
        />
      </div>
      
      <button
        className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        onClick={() => {
          // Handle existing booking flow
          console.log('Existing booking clicked');
        }}
      >
        I have an existing booking
      </button>
    </div>
  );
}