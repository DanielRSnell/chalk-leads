import React from 'react';
import { X } from 'lucide-react';
import { useLeadStore } from '../../storage/leadStore';

export function Navigation() {
  const { closeWidget } = useLeadStore();
  
  return (
    <button
      onClick={closeWidget}
      className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200 p-2 rounded-lg backdrop-blur-sm"
      aria-label="Close lead capture widget"
    >
      <X className="w-5 h-5" />
    </button>
  );
}