import React from 'react';
import { useLeadStore } from '../../storage/leadStore';
import { getStepByIndex, STEP_ORDER } from '../../data';

// Legacy components that have their own navigation
const LEGACY_COMPONENTS = [
  'confirmation', 
  'date', 
  'time', 
  'move-type', 
  'voiceflow-screen'
];

export function StepNavigation() {
  const { 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    canGoBack, 
    isLastStep,
    validateCurrentStep 
  } = useLeadStore();
  
  // Get current step data to determine button configuration
  const currentStepData = getStepByIndex(currentStep);
  const currentStepId = STEP_ORDER[currentStep];
  const isDataDriven = Boolean(currentStepData);
  const isLegacyComponent = LEGACY_COMPONENTS.includes(currentStepId);
  
  // Show navigation for data-driven steps or special hybrid components that use fixed footer
  const hybridComponents = ['moving-supplies-selection', 'review-details', 'contact'];
  if (!isDataDriven && !hybridComponents.includes(currentStepId)) {
    return null;
  }
  
  // Hide navigation for legacy components that manage their own navigation
  if (isLegacyComponent) {
    return null;
  }
  
  // Don't show navigation for steps that auto-advance
  const isAutoAdvance = currentStepData?.buttons?.primary?.action === 'auto';
  if (isAutoAdvance) {
    return null;
  }
  
  const handleContinue = () => {
    // Special handling for components with custom navigation
    if (currentStepId === 'moving-supplies-selection' && window.movingSuppliesNavigation) {
      window.movingSuppliesNavigation.handleContinue();
      return;
    }
    
    if (currentStepId === 'review-details' && window.reviewDetailsNavigation) {
      window.reviewDetailsNavigation.handleContinue();
      return;
    }
    
    if (currentStepId === 'contact' && window.contactInfoNavigation) {
      window.contactInfoNavigation.handleContinue();
      return;
    }
    
    // Validate current step before proceeding
    if (validateCurrentStep()) {
      nextStep();
    }
  };
  
  const handleSkip = () => {
    // Special handling for moving supplies selection
    if (currentStepId === 'moving-supplies-selection' && window.movingSuppliesNavigation) {
      window.movingSuppliesNavigation.handleSkip();
      return;
    }
    
    nextStep();
  };
  
  // For data-driven steps, check if skip is allowed
  let canSkip = !currentStepData?.validation?.required;
  let buttonText = currentStepData?.buttons?.primary?.text || 'Continue';
  
  // Override for components with custom navigation
  if (currentStepId === 'moving-supplies-selection' && window.movingSuppliesNavigation) {
    canSkip = window.movingSuppliesNavigation.canSkip;
    buttonText = window.movingSuppliesNavigation.buttonText;
  } else if (currentStepId === 'review-details' && window.reviewDetailsNavigation) {
    canSkip = window.reviewDetailsNavigation.canSkip;
    buttonText = window.reviewDetailsNavigation.buttonText;
  } else if (currentStepId === 'contact' && window.contactInfoNavigation) {
    canSkip = window.contactInfoNavigation.canSkip;
    buttonText = window.contactInfoNavigation.buttonText;
  }
  
  return (
    <div className="bg-card border-t border-border/30 px-6 py-4">
      <div className="flex gap-3">
        {canSkip && (
          <>
            <button
              type="button"
              onClick={handleSkip}
              className="
                flex-1 py-3 px-4 border border-border rounded-lg text-sm font-medium
                hover:bg-muted/50 hover:border-border/60 transition-all duration-200
                text-muted-foreground hover:text-foreground
              "
            >
              Skip
            </button>
            <div className="w-px bg-border/30 self-stretch mx-1" />
          </>
        )}
        <button
          onClick={handleContinue}
          className={`
            py-3 px-4 bg-primary text-primary-foreground rounded-lg 
            hover:bg-primary/90 transition-all duration-200 font-medium text-sm
            disabled:opacity-50 disabled:cursor-not-allowed
            ${canSkip ? 'flex-1' : 'w-full'}
          `}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}