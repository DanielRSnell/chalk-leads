import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';
import { ServiceOption } from '../ui/ServiceOption';

export function LaborTypeSelection() {
  const { formData, updateFormData, nextStep } = useLeadStore();
  
  // Only show if labor-only service was selected
  if (formData.serviceType !== 'labor-only') {
    // Skip this step for full-service moves
    React.useEffect(() => {
      nextStep();
    }, []);
    return null;
  }
  
  const handleLaborTypeSelect = (laborType) => {
    updateFormData('laborType', laborType);
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-md font-semibold text-foreground mb-2">
          What do you need help with?
        </h2>
        <p className="text-muted-foreground">
          Select the type of labor assistance you need
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <ServiceOption
          icon={<ArrowUpDown className="w-6 h-6" />}
          title="Loading & Unloading"
          description="Our crews help you load at a starting location and unload at a destination location"
          onClick={() => handleLaborTypeSelect('loading-unloading')}
          selected={formData.laborType === 'loading-unloading'}
        />
        
        <ServiceOption
          icon={<ArrowUp className="w-6 h-6" />}
          title="Loading Only"
          description="We help you load your items"
          onClick={() => handleLaborTypeSelect('loading-only')}
          selected={formData.laborType === 'loading-only'}
        />
        
        <ServiceOption
          icon={<ArrowDown className="w-6 h-6" />}
          title="Unloading Only"
          description="We help you unload previously loaded items"
          onClick={() => handleLaborTypeSelect('unloading-only')}
          selected={formData.laborType === 'unloading-only'}
        />
      </div>
    </div>
  );
}