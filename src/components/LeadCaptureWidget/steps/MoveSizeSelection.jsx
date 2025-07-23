import React from 'react';
import { useLeadStore } from '../../../storage/leadStore';

export function MoveSizeSelection() {
  const { formData, updateFormData, nextStep } = useLeadStore();
  
  const sizes = [
    { value: 'studio', label: 'Studio' },
    { value: '1-bedroom', label: '1 Bedroom' },
    { value: '2-bedroom', label: '2 Bedroom' },
    { value: '3-bedroom', label: '3 Bedroom' },
    { value: '4-bedroom', label: '4 Bedroom' },
    { value: '5-bedroom+', label: '5+ Bedroom' }
  ];
  
  const handleSizeSelect = (size) => {
    updateFormData('moveSize', size);
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-md font-semibold text-foreground mb-2">
          What size is your move?
        </h2>
        <p className="text-muted-foreground">
          Select the size that best describes your move
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {sizes.map((size) => (
          <button
            key={size.value}
            onClick={() => handleSizeSelect(size.value)}
            className={`
              p-4 rounded-lg border transition-all duration-200 text-center
              ${formData.moveSize === size.value
                ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                : 'border-border/60 hover:border-primary/40 hover:bg-primary/5 text-foreground'
              }
            `}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
}