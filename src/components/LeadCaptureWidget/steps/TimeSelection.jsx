import React from 'react';
import { Sun, Clock } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';
import { ServiceOption } from '../ui/ServiceOption';

export function TimeSelection() {
  const { formData, updateFormData, nextStep } = useLeadStore();
  
  const handleTimeSelect = (timeWindow) => {
    updateFormData('timeWindow', timeWindow);
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-md font-semibold text-foreground mb-2">
          What's your preferred start time?
        </h2>
        <p className="text-muted-foreground">
          Choose the time window that works best for you
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <ServiceOption
          icon={<Sun className="w-6 h-6" />}
          title="8AM—12PM"
          description="Morning"
          onClick={() => handleTimeSelect('morning')}
          selected={formData.timeWindow === 'morning'}
        />
        
        <ServiceOption
          icon={<Clock className="w-6 h-6" />}
          title="12PM—4PM"
          description="Afternoon"
          onClick={() => handleTimeSelect('afternoon')}
          selected={formData.timeWindow === 'afternoon'}
        />
      </div>
    </div>
  );
}