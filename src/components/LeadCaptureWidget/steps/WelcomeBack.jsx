import React from 'react';
import { Calendar, MapPin, DollarSign, ArrowRight, Plus } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';

export function WelcomeBack({ savedMove, onSelectMove, onNewMove }) {
  // Format the move date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format the time window
  const formatTimeWindow = (timeWindow) => {
    switch (timeWindow) {
      case 'morning': return '8AM—12PM';
      case 'afternoon': return '12PM—4PM';
      case 'evening': return '4PM—8PM';
      default: return 'Time not set';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Back Header */}
      <div className="w-full max-w-md mx-auto flex items-center gap-4 mb-6 p-4 bg-card/50 rounded-xl border border-border/30">
        <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
          <ArrowRight className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Welcome Back!
          </h2>
          <p className="text-sm text-muted-foreground">
            We found your previous moving quote
          </p>
        </div>
      </div>

      {/* Existing Move Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              {(savedMove?.serviceType || savedMove?.formData?.serviceType) === 'full-service' ? 'Full Service Moving' : 'Labor Only Services'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {(savedMove?.moveSize || savedMove?.formData?.moveSize) || 'Size not specified'}
            </p>
          </div>
          {savedMove?.estimate?.total && (
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                ${Math.round(savedMove.estimate.total).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Estimated Total
              </div>
            </div>
          )}
        </div>

        {/* Move Details */}
        <div className="space-y-3">
          {/* Date & Time */}
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium text-foreground">
                {formatDate(savedMove?.moveDate || savedMove?.formData?.moveDate)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTimeWindow(savedMove?.timeWindow || savedMove?.formData?.timeWindow)}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-foreground">
                <span className="font-medium">From:</span> {(savedMove?.addresses?.pickup?.address || savedMove?.formData?.addresses?.pickup?.address) || 'Address not set'}
              </div>
              <div className="text-sm text-foreground">
                <span className="font-medium">To:</span> {(savedMove?.addresses?.destination?.address || savedMove?.formData?.addresses?.destination?.address) || 'Address not set'}
              </div>
            </div>
          </div>

          {/* Contact */}
          {(savedMove?.contact?.firstName || savedMove?.formData?.contact?.firstName) && (
            <div className="text-sm text-muted-foreground">
              Contact: {(savedMove?.contact?.firstName || savedMove?.formData?.contact?.firstName)} {(savedMove?.contact?.lastName || savedMove?.formData?.contact?.lastName)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onSelectMove}
            className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Continue with this move
          </button>
        </div>
      </div>

      {/* New Move Option */}
      <div className="text-center">
        <button
          onClick={onNewMove}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
          Start a new moving quote instead
        </button>
      </div>
    </div>
  );
}