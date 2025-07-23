import React, { useEffect } from 'react';
import { Truck } from 'lucide-react';
import { useLeadStore } from '../../storage/leadStore';
import { ProgressBar } from './ProgressBar';
import { Navigation } from './Navigation';
import { StepNavigation } from './StepNavigation';
import { StepRenderer } from './StepRenderer';
import { Confirmation } from './steps/Confirmation';
import { ContactInfo } from './steps/ContactInfo';
import { DateSelection } from './steps/DateSelection';
import { TimeSelection } from './steps/TimeSelection';
import { MoveTypeSelection } from './steps/MoveTypeSelection';
import { ReviewDetails } from './steps/ReviewDetails';
import { MovingSuppliesSelection } from './steps/MovingSuppliesSelection';
import { VoiceflowScreen } from './steps/VoiceflowScreen';
import { getStepByIndex, getTotalSteps, STEP_ORDER } from '../../data';

// Legacy components that haven't been converted to data-driven yet
const LEGACY_COMPONENTS = {
  'confirmation': Confirmation,
  'contact': ContactInfo,
  'date': DateSelection,
  'time': TimeSelection,
  'move-type': MoveTypeSelection,
  'review-details': ReviewDetails,
  'moving-supplies-selection': MovingSuppliesSelection,
  'voiceflow-screen': VoiceflowScreen
};

// Step configuration - mix of data-driven and legacy
const STEPS = STEP_ORDER.map((stepId, index) => {
  const stepData = getStepByIndex(index);
  
  if (stepData) {
    return {
      id: stepId,
      title: stepData.title,
      component: StepRenderer,
      stepData: stepData,
      isDataDriven: true
    };
  }
  
  // Fallback for legacy components
  const legacyComponent = LEGACY_COMPONENTS[stepId];
  if (legacyComponent) {
    return {
      id: stepId,
      title: stepId.charAt(0).toUpperCase() + stepId.slice(1).replace('-', ' '),
      component: legacyComponent,
      isDataDriven: false
    };
  }
  
  return null;
}).filter(Boolean);

// Add any remaining legacy steps not in STEP_ORDER
Object.keys(LEGACY_COMPONENTS).forEach(stepId => {
  if (!STEP_ORDER.includes(stepId)) {
    STEPS.push({
      id: stepId,
      title: stepId.charAt(0).toUpperCase() + stepId.slice(1).replace('-', ' '),
      component: LEGACY_COMPONENTS[stepId],
      isDataDriven: false
    });
  }
});

export function LeadCaptureWidget() {
  const { currentStep, canGoBack, companyName, isWidgetOpen, formData, currentEstimate, formattedPricing } = useLeadStore();
  const totalSteps = STEPS.length;
  
  // Load Voiceflow script immediately when component mounts
  useEffect(() => {
    if (!window.voiceflowScriptLoaded) {
      console.log('Loading Voiceflow script...');
      const script = document.createElement('script');
      script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
      script.type = "text/javascript";
      script.onload = function() {
        console.log('Voiceflow script loaded successfully');
        window.voiceflowScriptLoaded = true;
      };
      script.onerror = function() {
        console.error('Failed to load Voiceflow script');
      };
      document.head.appendChild(script);
    }
  }, []); // Empty dependency array means this runs once on mount
  
  // Expose lead data to window for Voiceflow
  useEffect(() => {
    // Get the full review data from localStorage if it exists
    const savedReviewData = localStorage.getItem('moovinleads_review');
    const reviewData = savedReviewData ? JSON.parse(savedReviewData) : null;
    
    // Use estimate from window (saved from ReviewDetails), then fallback to store, then localStorage
    const estimate = window.estimateData?.estimate || currentEstimate || reviewData?.estimate || null;
    const pricing = window.estimateData?.formattedPricing || formattedPricing || reviewData?.formattedPricing || null;
    
    console.log('Debug - window.estimateData:', window.estimateData);
    console.log('Debug - final estimate:', estimate);
    console.log('Debug - final pricing:', pricing);
    
    window.leadData = {
      ...formData,
      estimate: estimate,
      pricing: pricing,
      timestamp: new Date().toISOString(),
      // Include review details if available
      ...(reviewData?.reviewDetails && { reviewDetails: reviewData.reviewDetails }),
      // Include any additional review data
      ...(reviewData && { savedReviewData: reviewData })
    };
    
    console.log('Debug - window.leadData:', window.leadData);
  }, [formData, currentEstimate, formattedPricing]);
  
  // Don't render the widget if it's closed
  if (!isWidgetOpen) {
    return null;
  }
  
  const currentStepConfig = STEPS[currentStep];
  const StepComponent = currentStepConfig?.component;
  
  if (!currentStepConfig) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-[999999] md:bottom-24 md:right-6 md:top-auto md:left-auto md:w-full md:max-w-lg md:h-[calc(100vh-8rem)] md:max-h-[900px] md:inset-auto">
      <div className="bg-card/98 backdrop-blur-xl md:rounded-xl shadow-2xl border-2 border-border/30 overflow-hidden animate-in slide-in-from-bottom-8 fade-in-0 duration-500 h-full flex flex-col" style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(229, 231, 235, 0.2)'
      }}>
        {/* Header */}
        <div className="bg-primary px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-primary-foreground font-bold text-lg leading-tight">
                  {companyName}
                </h1>
                <p className="text-primary-foreground/85 text-sm font-medium">
                  Get your free moving quote
                </p>
              </div>
            </div>
            <Navigation />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="border-b border-border/30">
          <ProgressBar 
            currentStep={currentStep} 
            totalSteps={totalSteps}
            canGoBack={canGoBack}
          />
        </div>
        
        {/* Step Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-8 overflow-y-auto relative">
            <div className="space-y-6">
              {currentStepConfig.isDataDriven ? (
                <StepComponent stepData={currentStepConfig.stepData} />
              ) : (
                <StepComponent />
              )}
            </div>
          </div>
          
          {/* Fixed Step Navigation */}
          <StepNavigation />
        </div>
        
        {/* Footer */}
        <div className="bg-muted/50 backdrop-blur-sm px-6 py-3 border-t border-border/30">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
            <p className="text-muted-foreground text-xs font-medium">
              Powered by MoovinLeads
            </p>
            <div className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}