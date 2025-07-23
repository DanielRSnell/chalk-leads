import React from 'react';
import { useLeadStore } from '../../../storage/leadStore';
import { CalendarControl } from '../ui/CalendarControl';

export function DateSelection() {
  const { formData, updateFormData, nextStep } = useLeadStore();
  
  const handleDateSelect = (date) => {
    updateFormData('moveDate', date);
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      {/* Horizontal Header Card */}
      <div className="w-full max-w-md mx-auto flex items-center gap-4 mb-6 p-4 bg-card/50 rounded-xl border border-border/30">
        <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
          <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h2 className="text-md font-semibold text-foreground mb-1">
            When do you need to move?
          </h2>
          <p className="text-sm text-muted-foreground">
            Select your preferred moving date
          </p>
        </div>
      </div>
      
      <CalendarControl
        selectedDate={formData.moveDate}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
}