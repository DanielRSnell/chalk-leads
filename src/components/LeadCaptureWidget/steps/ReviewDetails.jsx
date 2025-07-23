import React, { useState, useEffect } from 'react';
import { Check, Calendar, Clock, MapPin, User, Mail, Phone, ChevronDown, ChevronUp, DollarSign, Package, Truck, AlertTriangle } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';

export function ReviewDetails() {
  const { 
    formData, 
    nextStep,
    calculateEstimate, 
    currentEstimate, 
    formattedPricing 
  } = useLeadStore();
  const [expandedAccordions, setExpandedAccordions] = useState({
    estimate: true,
    services: false,
    supplies: false,
    details: false
  });

  // Calculate estimate when component mounts
  useEffect(() => {
    calculateEstimate();
  }, [calculateEstimate]);

  // Save estimate data to window when it's calculated
  useEffect(() => {
    if (currentEstimate && formattedPricing) {
      window.estimateData = {
        estimate: currentEstimate,
        formattedPricing: formattedPricing
      };
      console.log('Saved estimate data to window:', window.estimateData);
    }
  }, [currentEstimate, formattedPricing]);

  // Expose navigation functions to StepNavigation
  useEffect(() => {
    window.reviewDetailsNavigation = {
      handleContinue: handleContinue,
      canSkip: false,
      buttonText: 'Continue to Final Review'
    };
    
    return () => {
      delete window.reviewDetailsNavigation;
    };
  }, []);
  
  const handleContinue = () => {
    // Make sure we have current estimate data
    if (!currentEstimate) {
      console.log('No estimate found, calculating...');
      calculateEstimate();
    }
    
    // Use the window estimate data if available
    const estimate = window.estimateData?.estimate || currentEstimate;
    const pricing = window.estimateData?.formattedPricing || formattedPricing;
    
    // Save review data to localStorage before proceeding to confirmation
    const reviewData = {
      timestamp: new Date().toISOString(),
      formData: formData,
      estimate: estimate,
      formattedPricing: pricing,
      reviewDetails: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      }
    };
    
    console.log('Saving review data to localStorage:', reviewData);
    localStorage.setItem('moovinleads_review', JSON.stringify(reviewData));
    
    // Continue to confirmation screen
    nextStep();
  };

  const toggleAccordion = (section) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const formatDate = (date) => {
    if (!date) return 'Not selected';
    return new Date(date).toLocaleDateString();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Review Your Details
        </h2>
        <p className="text-muted-foreground">
          Please review your moving details and estimate before proceeding
        </p>
      </div>

      {/* Estimate Display */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Estimated Total</span>
        </div>
        <div className="text-3xl font-bold text-primary mb-1">
          {formattedPricing?.total || '$0'}
        </div>
        <div className="text-sm text-muted-foreground">
          Estimated time: {currentEstimate?.estimatedHours || 0} hours
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {/* Estimate Breakdown Accordion */}
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('estimate')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Estimate Breakdown</span>
            </div>
            {expandedAccordions.estimate ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          
          {expandedAccordions.estimate && (
            <div className="px-4 pb-4 border-t border-border/30">
              <div className="space-y-3 pt-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Base Price ({formData.moveSize})</span>
                  <span className="text-sm font-medium">${currentEstimate?.basePrice || 0}</span>
                </div>
                
                {currentEstimate?.modifiers?.map((modifier, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{modifier.name}</span>
                    <span className="text-sm font-medium">
                      {modifier.type === 'multiplier' ? `×${modifier.value}` : `+$${modifier.value}`}
                    </span>
                  </div>
                ))}
                
                {currentEstimate?.challenges?.length > 0 && (
                  <>
                    <div className="text-sm font-medium text-foreground pt-2">Challenges:</div>
                    {currentEstimate.challenges.map((challenge, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {challenge.name} ({challenge.location})
                        </span>
                        <span className="text-sm font-medium">+${challenge.amount}</span>
                      </div>
                    ))}
                  </>
                )}
                
                {currentEstimate?.additionalServices?.length > 0 && (
                  <>
                    <div className="text-sm font-medium text-foreground pt-2">Additional Services:</div>
                    {currentEstimate.additionalServices.map((service, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{service.name}</span>
                        <span className="text-sm font-medium">+${Math.round(service.amount)}</span>
                      </div>
                    ))}
                  </>
                )}
                
                <div className="border-t border-border/30 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="text-sm font-medium">{formattedPricing?.subtotal || '$0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tax (8%)</span>
                    <span className="text-sm font-medium">{formattedPricing?.tax || '$0'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border/30 mt-2">
                    <span>Total</span>
                    <span>{formattedPricing?.total || '$0'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Services Accordion */}
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('services')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Services & Add-ons</span>
            </div>
            {expandedAccordions.services ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          
          {expandedAccordions.services && (
            <div className="px-4 pb-4 border-t border-border/30">
              <div className="space-y-3 pt-3">
                <div>
                  <div className="text-sm font-medium text-foreground mb-2">Service Type</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="w-4 h-4" />
                    {formData.serviceType === 'full-service' ? 'Full Service Moving' : 'Labor Only Services'}
                  </div>
                  {formData.laborType && (
                    <div className="text-sm text-muted-foreground ml-6">
                      {formData.laborType.replace('-', ' & ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  )}
                </div>
                
                {formData.additionalServices.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-foreground mb-2">Additional Services</div>
                    <ul className="space-y-1">
                      {formData.additionalServices.map((service, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="w-3 h-3" />
                          {service.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {(formData.addresses?.pickup?.challenges?.length > 0 || formData.addresses?.destination?.challenges?.length > 0) && (
                  <div>
                    <div className="text-sm font-medium text-foreground mb-2">Location Challenges</div>
                    {formData.addresses?.pickup?.challenges?.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Pickup Location:</div>
                        <ul className="space-y-1">
                          {formData.addresses.pickup.challenges.map((challenge, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <AlertTriangle className="w-3 h-3" />
                              {challenge.label}
                              {challenge.value && ` (${challenge.value})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {formData.addresses?.destination?.challenges?.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Destination:</div>
                        <ul className="space-y-1">
                          {formData.addresses.destination.challenges.map((challenge, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <AlertTriangle className="w-3 h-3" />
                              {challenge.label}
                              {challenge.value && ` (${challenge.value})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Moving Supplies Accordion */}
        {currentEstimate?.movingSupplies?.length > 0 && (
          <div className="border border-border/50 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('supplies')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Moving Supplies</span>
              </div>
              {expandedAccordions.supplies ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            {expandedAccordions.supplies && (
              <div className="px-4 pb-4 border-t border-border/30">
                <div className="space-y-3 pt-3">
                  {currentEstimate.movingSupplies.map((supply, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {supply.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${supply.price.toFixed(2)} × {supply.quantity}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        ${supply.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-border/30 pt-3 mt-3">
                    <div className="flex justify-between font-medium text-foreground">
                      <span>Supplies Total</span>
                      <span>
                        ${currentEstimate.movingSupplies.reduce((total, supply) => total + supply.amount, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Move Details Accordion */}
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('details')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Move Details</span>
            </div>
            {expandedAccordions.details ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          
          {expandedAccordions.details && (
            <div className="px-4 pb-4 border-t border-border/30">
              <div className="space-y-3 pt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Move Date</div>
                    <div className="text-sm text-muted-foreground">{formatDate(formData.moveDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Time Window</div>
                    <div className="text-sm text-muted-foreground">
                      {formData.timeWindow === 'morning' ? '8AM—12PM' : 
                       formData.timeWindow === 'afternoon' ? '12PM—4PM' : 
                       formData.timeWindow === 'evening' ? '4PM—8PM' : 'Not selected'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Addresses</div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">From:</span> {formData.addresses?.pickup?.address || 'Not specified'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">To:</span> {formData.addresses?.destination?.address || 'Not specified'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Contact Information</div>
                    <div className="text-sm text-muted-foreground">
                      {formData.contact.firstName} {formData.contact.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {formData.contact.email}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {formData.contact.phone}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}