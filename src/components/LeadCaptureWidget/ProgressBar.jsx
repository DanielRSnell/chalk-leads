import React from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useLeadStore } from '../../storage/leadStore';

export function ProgressBar({ currentStep, totalSteps, canGoBack }) {
  const { prevStep, closeWidget } = useLeadStore();
  
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isBackEnabled = currentStep > 0;
  
  return (
    <div className="bg-muted/30 px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        {/* Back Button */}
        <button
          onClick={prevStep}
          disabled={!isBackEnabled}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${isBackEnabled 
              ? 'text-foreground hover:bg-background border border-border/50 hover:border-border shadow-sm hover:shadow-md' 
              : 'text-muted-foreground cursor-not-allowed opacity-50'
            }
          `}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep + 1}
          </span>
          <div className="text-muted-foreground text-sm">
            of {totalSteps}
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={closeWidget}
          className="
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            text-muted-foreground hover:text-foreground hover:bg-background 
            border border-border/50 hover:border-border shadow-sm hover:shadow-md
            transition-all duration-200
          "
        >
          <X className="w-4 h-4" />
          Close
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner">
          {/* Animated glow effect behind progress */}
          <div 
            className="
              absolute top-0 left-0 h-full
              bg-gradient-to-r from-primary/30 to-primary/10
              rounded-full blur-sm
              animate-pulse
            "
            style={{ width: `${Math.min(progress + 10, 100)}%` }}
          />
          
          {/* Main progress bar with enhanced effects */}
          <div 
            className="
              absolute top-0 left-0 h-full 
              bg-gradient-to-r from-primary via-primary to-primary/90
              transition-all duration-700 ease-out
              shadow-lg
              relative overflow-hidden
            "
            style={{ 
              width: `${progress}%`,
              boxShadow: `
                0 0 8px rgba(244, 196, 67, 0.6),
                0 0 16px rgba(244, 196, 67, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.3)
              `
            }}
          >
            {/* Animated shine effect */}
            <div className="
              absolute inset-0 
              bg-gradient-to-r from-transparent via-white/20 to-transparent
              animate-pulse
              duration-1500
            " />
            
            {/* Moving sparkle effect */}
            <div 
              className="
                absolute top-0 right-0 h-full w-4
                bg-gradient-to-l from-white/40 to-transparent
                animate-pulse
              "
              style={{ 
                animation: 'sparkle 2s ease-in-out infinite',
                animationDelay: '0.5s'
              }}
            />
          </div>
          
          {/* Subtle overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground font-medium">
            {Math.round(progress)}% complete
          </p>
          <p className="text-xs text-muted-foreground">
            {totalSteps - currentStep - 1} steps remaining
          </p>
        </div>
      </div>
    </div>
  );
}