import React, { useState, useEffect } from 'react';
import { Check, Calendar, Clock, MapPin, User, Mail, Phone, MessageCircle, X, ChevronDown, ChevronUp, DollarSign, Package, Truck, AlertTriangle } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';

export function Confirmation() {
  const { 
    formData, 
    updateFormData, 
    submitLead, 
    isSubmitting, 
    errors, 
    calculateEstimate, 
    currentEstimate, 
    formattedPricing 
  } = useLeadStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showVoiceflowModal, setShowVoiceflowModal] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState({
    estimate: true,
    services: false,
    details: false
  });

  // Calculate estimate when component mounts
  useEffect(() => {
    calculateEstimate();
  }, [calculateEstimate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.termsAccepted) {
      return;
    }
    
    try {
      await submitLead();
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit lead:', error);
    }
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
  
  if (isSubmitted) {
    return (
      <>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-success-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Thank you for your request!
            </h2>
            <p className="text-muted-foreground mb-6">
              We've received your moving request and will contact you soon with a detailed quote.
            </p>
          </div>
          
          {/* Have Questions Button */}
          <div className="border-t border-border/20 pt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVoiceflowModal(true);
              }}
              className="
                inline-flex items-center gap-2 px-6 py-3 
                bg-primary/10 text-primary border border-primary/20 
                rounded-lg hover:bg-primary/20 transition-all duration-200
                font-medium text-sm
              "
            >
              <MessageCircle className="w-4 h-4" />
              Have Questions?
            </button>
          </div>
        </div>

        {/* Voiceflow Modal */}
        {showVoiceflowModal && (
          <div 
            className="fixed inset-0 z-[9999999] flex items-center justify-center p-4"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowVoiceflowModal(false);
              }}
            />
            <div 
              className="relative bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <h3 className="text-lg font-semibold text-foreground">
                  Chat Support
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVoiceflowModal(false);
                  }}
                  className="
                    p-2 hover:bg-muted rounded-lg transition-colors
                    text-muted-foreground hover:text-foreground
                  "
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Voiceflow Container */}
              <div className="p-6">
                <div 
                  id="voiceflow-moving" 
                  className="w-full min-h-[400px] bg-background rounded-lg border border-border/50"
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Check Mark */}
      <div className="text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-success/20">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Review Your Moving Estimate
        </h2>
        <p className="text-muted-foreground">
          Here's your personalized moving estimate and details
        </p>
      </div>

      {/* Estimate Display */}
      <div className="bg-success/5 border border-success/20 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-success" />
          <span className="text-sm font-medium text-success">Estimated Total</span>
        </div>
        <div className="text-3xl font-bold text-success mb-1">
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-muted-foreground">
              I agree to the terms and conditions and privacy policy
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-sm text-destructive">{errors.termsAccepted}</p>
          )}
          
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={formData.newsletterOptIn}
              onChange={(e) => updateFormData('newsletterOptIn', e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-muted-foreground">
              I'd like to receive moving tips and special offers
            </span>
          </label>
        </div>
        
        {errors.submit && (
          <p className="text-sm text-destructive text-center">{errors.submit}</p>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || !formData.termsAccepted}
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Get Estimate'}
        </button>
      </form>
    </div>
  );
}