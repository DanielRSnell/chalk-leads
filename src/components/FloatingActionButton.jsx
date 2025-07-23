import React from 'react';
import { MessageSquare, X, Truck } from 'lucide-react';
import { useLeadStore } from '../storage/leadStore';

export function FloatingActionButton() {
  const { isWidgetOpen, openWidget, closeWidget } = useLeadStore();
  
  const handleClick = () => {
    if (isWidgetOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  };
  
  return (
    <div className={`fixed bottom-6 right-6 z-[1000000] ${isWidgetOpen ? 'hidden md:block' : 'block'}`}>
      <div className="relative group">
        {/* Main Button */}
        <button
          onClick={handleClick}
          style={{
            position: 'relative',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: 'none',
            background: isWidgetOpen ? '#6B7280' : '#F4C443',
            color: isWidgetOpen ? '#FFFFFF' : '#1A1A1A',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: '1000001',
            pointerEvents: 'auto'
          }}
          aria-label={isWidgetOpen ? 'Close lead capture widget' : 'Open lead capture widget'}
        >
          {isWidgetOpen ? (
            <X className="w-6 h-6 text-foreground transition-transform duration-200" />
          ) : (
            <Truck className="w-6 h-6 text-primary-foreground transition-transform duration-200" />
          )}
        </button>

        {/* Pulse Rings when closed */}
        {!isWidgetOpen && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
          </>
        )}

        {/* Tooltip */}
        <div className={`
          absolute bottom-full right-0 mb-3
          px-3 py-2 bg-card border border-border rounded-lg shadow-lg
          text-sm font-medium text-card-foreground
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 ease-out
          transform translate-y-1 group-hover:translate-y-0
          whitespace-nowrap
          before:absolute before:top-full before:right-4
          before:w-0 before:h-0 before:border-l-4 before:border-r-4
          before:border-t-4 before:border-transparent before:border-t-border
        `}>
          {isWidgetOpen ? 'Close moving quote' : 'Get free quote'}
        </div>
      </div>
    </div>
  );
}