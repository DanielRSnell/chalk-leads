import React from 'react';

export function ServiceOption({ icon, title, description, onClick, selected = false }) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full p-4 rounded-lg border transition-all duration-200
        ${selected 
          ? 'border-primary bg-primary/5 shadow-sm' 
          : 'border-border/60 hover:border-primary/40 hover:bg-primary/5'
        }
      `}
    >
      <div className="flex items-center space-x-4">
        <div className={`
          p-2 rounded-lg transition-colors flex-shrink-0
          ${selected 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
          }
        `}>
          {icon}
        </div>
        
        <div className="text-left flex-1">
          <h3 className="font-semibold text-foreground mb-1 text-md">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-primary/5" />
    </button>
  );
}