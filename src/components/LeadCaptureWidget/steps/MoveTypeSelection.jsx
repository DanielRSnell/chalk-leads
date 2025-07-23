import React from 'react';
import { Home, Package, Building } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';
import { ServiceOption } from '../ui/ServiceOption';

export function MoveTypeSelection() {
  const { formData, updateFormData, nextStep } = useLeadStore();
  
  const handleLocationTypeSelect = (locationType) => {
    updateFormData('locationType', locationType);
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-md font-semibold text-foreground mb-2">
          What type of location are you moving?
        </h2>
        <p className="text-muted-foreground">
          Select the type of location for your move
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <ServiceOption
          icon={<Home className="w-8 h-8" />}
          title="A home..."
          description="Residential move"
          onClick={() => handleLocationTypeSelect('home')}
          selected={formData.locationType === 'home'}
        />
        
        <ServiceOption
          icon={<Package className="w-8 h-8" />}
          title="Storage unit..."
          description="Storage facility"
          onClick={() => handleLocationTypeSelect('storage')}
          selected={formData.locationType === 'storage'}
        />
        
        <ServiceOption
          icon={<Building className="w-8 h-8" />}
          title="An office..."
          description="Commercial space"
          onClick={() => handleLocationTypeSelect('office')}
          selected={formData.locationType === 'office'}
        />
      </div>
    </div>
  );
}