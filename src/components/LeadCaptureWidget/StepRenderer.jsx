import React, { useState, useEffect } from 'react';
import { 
  Truck, Users, ArrowUpDown, ArrowUp, ArrowDown, MapPin, Navigation,
  AlertTriangle, Building, Package, Shield, Wrench, Plus, X, Calendar,
  Clock, User, Mail, Phone, Check, MessageCircle, Home, Archive,
  Sunrise, Sun, Sunset
} from 'lucide-react';
import { useLeadStore } from '../../storage/leadStore';
import { ServiceOption } from './ui/ServiceOption';
import { AvatarPrompt } from './ui/AvatarPrompt';
import { MapboxPreview } from './ui/MapboxPreview';
import { CalendarControl } from './ui/CalendarControl';
import { GooglePlacesAutocomplete } from './ui/GooglePlacesAutocomplete';
import { WelcomeBack } from './steps/WelcomeBack';

// Icon mapping
const ICON_COMPONENTS = {
  Truck, Users, ArrowUpDown, ArrowUp, ArrowDown, MapPin, Navigation,
  AlertTriangle, Building, Package, Shield, Wrench, Plus, X, Calendar,
  Clock, User, Mail, Phone, Check, MessageCircle, Home, Archive,
  Sunrise, Sun, Sunset
};

export function StepRenderer({ stepData }) {
  const { formData, updateFormData, nextStep, addAdditionalService, removeAdditionalService, goToStep } = useLeadStore();
  const [localState, setLocalState] = useState({});
  const [savedMove, setSavedMove] = useState(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  
  // Challenge state management
  const challengeType = stepData?.challengeType || 'pickup';
  const currentChallenges = challengeType === 'pickup' 
    ? formData.addresses?.pickup?.challenges || []
    : formData.addresses?.destination?.challenges || [];
  
  const [selectedChallenges, setSelectedChallenges] = useState(currentChallenges);
  const [customChallenge, setCustomChallenge] = useState('');

  // Check for existing moves on welcome step
  useEffect(() => {
    if (stepData?.id === 'welcome') {
      const savedReviewData = localStorage.getItem('moovinleads_review');
      if (savedReviewData) {
        try {
          const reviewData = JSON.parse(savedReviewData);
          // Check both possible locations for moveDate
          const moveDate = reviewData?.moveDate || reviewData?.formData?.moveDate;
          
          console.log('Debug - savedReviewData:', reviewData);
          console.log('Debug - moveDate found:', moveDate);
          
          if (moveDate) {
            const moveDateObj = new Date(moveDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            console.log('Debug - moveDateObj:', moveDateObj);
            console.log('Debug - today:', today);
            console.log('Debug - moveDateObj >= today:', moveDateObj >= today);
            
            // If move date is today or future, show welcome back
            if (moveDateObj >= today) {
              setSavedMove(reviewData);
              setShowWelcomeBack(true);
              return;
            }
          }
        } catch (error) {
          console.error('Error parsing saved review data:', error);
        }
      }
    }
  }, [stepData]);

  // Handle conditional logic with proper hook usage
  React.useEffect(() => {
    if (!stepData) return;
    
    if (stepData.conditional) {
      const { field, value, skipIfNot } = stepData.conditional;
      const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], formData);
      
      if (skipIfNot && fieldValue !== value) {
        nextStep();
      }
    }
  }, [stepData, formData, nextStep]);

  // Sync challenge state with form data
  React.useEffect(() => {
    if (stepData?.layout?.type === 'challenges') {
      const newChallenges = challengeType === 'pickup' 
        ? formData.addresses?.pickup?.challenges || []
        : formData.addresses?.destination?.challenges || [];
      setSelectedChallenges(newChallenges);
    }
  }, [formData.addresses, challengeType, stepData?.layout?.type]);

  if (!stepData) return null;

  // Check conditional logic for rendering
  if (stepData.conditional) {
    const { field, value, skipIfNot } = stepData.conditional;
    const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], formData);
    
    if (skipIfNot && fieldValue !== value) {
      return null;
    }
  }

  const handleOptionSelect = (option) => {
    if (stepData.validation?.field) {
      updateFormData(stepData.validation.field, option.value);
    }
    
    if (stepData.buttons?.primary?.action === 'auto') {
      nextStep();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };


  const renderIcon = (iconName, size = 'w-5 h-5') => {
    const IconComponent = ICON_COMPONENTS[iconName];
    return IconComponent ? <IconComponent className={size} /> : null;
  };

  const renderHeader = () => {
    if (!stepData.title && !stepData.subtitle && !stepData.headerIcon && !stepData.prompt) {
      return null;
    }

    // Use horizontal card layout for all headers, including welcome screen
    return (
      <div className="w-full max-w-md mx-auto flex items-center gap-4 mb-6 p-4 bg-card/50 rounded-xl border border-border/30">
        {/* Icon - use User icon for welcome screen if no headerIcon specified */}
        <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
          {stepData.headerIcon ? (
            renderIcon(stepData.headerIcon.name, 'w-6 h-6 text-primary-foreground')
          ) : stepData.prompt ? (
            <User className="w-6 h-6 text-primary-foreground" />
          ) : (
            renderIcon('Package', 'w-6 h-6 text-primary-foreground')
          )}
        </div>
        
        <div className="flex-1 min-w-0 text-left">
          {/* Use prompt message as title for welcome screen */}
          {stepData.prompt && (
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {stepData.prompt.message}
            </h2>
          )}
          
          {stepData.title && !stepData.prompt && (
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {stepData.title}
            </h2>
          )}
          
          {stepData.subtitle && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stepData.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderServiceOptions = () => {
    const { columns = 1, centered = false, selectable = 'single' } = stepData.layout || {};
    const gridClass = columns === 2 ? 'grid-cols-2' : 'grid-cols-1';
    
    if (selectable === 'multiple') {
      // Handle additional services (multi-select)
      return renderAdditionalServices();
    }
    
    return (
      <div className={`grid ${gridClass} gap-4 w-full`}>
        {stepData.options.map((option) => (
          <ServiceOption
            key={option.id}
            icon={renderIcon(option.icon, 'w-8 h-8')}
            title={option.title}
            description={option.description}
            onClick={() => handleOptionSelect(option)}
            selected={formData[stepData.validation?.field] === option.value}
          />
        ))}
      </div>
    );
  };

  const renderAdditionalServices = () => {
    const isServiceSelected = (serviceId) => {
      return formData.additionalServices?.some(s => s.id === serviceId) || false;
    };

    const toggleService = (option) => {
      if (isServiceSelected(option.id)) {
        removeAdditionalService(option.id);
      } else {
        const serializableService = {
          id: option.id,
          name: option.title,
          description: option.description
        };
        addAdditionalService(serializableService);
      }
    };

    return (
      <div className="space-y-3">
        {stepData.options.map((option) => {
          const isSelected = isServiceSelected(option.id);
          const IconComponent = ICON_COMPONENTS[option.icon];
          
          return (
            <button
              key={option.id}
              onClick={() => toggleService(option)}
              className={`
                w-full p-4 rounded-lg border transition-all duration-200 text-left
                ${isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border/60 hover:border-primary/40 hover:bg-primary/5'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-lg transition-colors
                  ${isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {IconComponent && <IconComponent className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <div className="ml-auto">
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    ${isSelected
                      ? 'border-primary bg-primary'
                      : 'border-border'
                    }
                  `}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderButtonOptions = () => {
    const { columns = 2 } = stepData.layout || {};
    const gridClass = columns === 2 ? 'grid-cols-2' : 'grid-cols-1';
    
    return (
      <div className={`grid ${gridClass} gap-3`}>
        {stepData.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option)}
            className={`
              p-4 rounded-lg border transition-all duration-200 text-center
              ${formData[stepData.validation?.field] === option.value
                ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                : 'border-border/60 hover:border-primary/40 hover:bg-primary/5 text-foreground'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  const renderAddressField = (field) => {
    const fieldPath = field.validation?.field || '';
    const currentValue = fieldPath.split('.').reduce((obj, key) => obj?.[key], formData) || '';
    
    const handleAddressChange = (e) => {
      const value = e.target.value;
      
      // Handle nested address fields specially
      if (fieldPath === 'addresses.pickup.address') {
        updateFormData('addresses', {
          ...formData.addresses,
          pickup: {
            ...formData.addresses?.pickup,
            address: value
          }
        });
      } else if (fieldPath === 'addresses.destination.address') {
        updateFormData('addresses', {
          ...formData.addresses,
          destination: {
            ...formData.addresses?.destination,
            address: value
          }
        });
      } else {
        // Fallback to regular updateFormData for other fields
        updateFormData(fieldPath, value);
      }
    };

    const IconComponent = ICON_COMPONENTS[field.icon];
    const isPickupLocation = fieldPath === 'addresses.pickup.address';
    const locationLabel = isPickupLocation ? 'Pickup Location' : 'Destination';

    return (
      <div key={field.id} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {field.label}
          </label>
          <div className="relative group mt-3">
            {IconComponent && (
              <IconComponent className="input-icon group-focus-within:text-primary" />
            )}
            <input
              type="text"
              value={currentValue}
              onChange={handleAddressChange}
              placeholder={field.placeholder}
              className="
                w-full pl-12 pr-4 py-3 border rounded-xl text-sm
                transition-all duration-200 placeholder:text-muted-foreground/60
                border-border hover:border-border/80 focus:border-primary 
                focus:ring-4 focus:ring-primary/10 focus:outline-none 
                bg-background/50 hover:bg-background
              "
            />
          </div>
        </div>
        
        {/* Mapbox Preview */}
        {currentValue && field.features?.googleMapsPreview && (
          <MapboxPreview 
            address={currentValue}
            locationLabel={locationLabel}
          />
        )}
      </div>
    );
  };

  const renderForm = () => {
    // Check if form should be disabled (for address fields)
    const hasRequiredFields = stepData.fields?.some(field => field.required);
    const allRequiredFieldsFilled = stepData.fields?.every(field => {
      if (!field.required) return true;
      const fieldPath = field.validation?.field || '';
      const value = fieldPath.split('.').reduce((obj, key) => obj?.[key], formData) || '';
      return value.trim();
    });
    
    const isDisabled = hasRequiredFields && !allRequiredFieldsFilled;
    
    return (
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {stepData.fields?.map(renderAddressField)}
      </form>
    );
  };

  const renderFooter = () => {
    if (!stepData.footer?.note) return null;
    
    return (
      <div className="mt-8 pt-6 border-t border-border/30">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
          <p className="text-sm">{stepData.footer.note}</p>
          <div className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const handleDateSelect = (date) => {
      updateFormData('moveDate', date);
      nextStep();
    };

    return (
      <div className="flex justify-center">
        <CalendarControl
          selectedDate={formData.moveDate}
          onDateSelect={handleDateSelect}
        />
      </div>
    );
  };

  const renderChallenges = () => {
    
    const handleChallengeToggle = (challengeId) => {
      const existing = selectedChallenges.find(c => c.id === challengeId);
      if (existing) {
        setSelectedChallenges(selectedChallenges.filter(c => c.id !== challengeId));
      } else {
        const challengeTemplate = stepData.commonChallenges?.find(c => c.id === challengeId);
        if (challengeTemplate) {
          setSelectedChallenges([...selectedChallenges, {
            id: challengeId,
            label: challengeTemplate.label,
            value: challengeTemplate.hasInput ? '' : true
          }]);
        }
      }
    };
    
    const handleChallengeValueChange = (challengeId, value) => {
      setSelectedChallenges(selectedChallenges.map(c => 
        c.id === challengeId ? { ...c, value } : c
      ));
    };
    
    const handleAddCustomChallenge = () => {
      if (customChallenge.trim()) {
        const customId = `custom_${Date.now()}`;
        setSelectedChallenges([...selectedChallenges, {
          id: customId,
          label: customChallenge.trim(),
          value: true,
          isCustom: true
        }]);
        setCustomChallenge('');
      }
    };
    
    const handleRemoveChallenge = (challengeId) => {
      setSelectedChallenges(selectedChallenges.filter(c => c.id !== challengeId));
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (challengeType === 'pickup') {
        updateFormData('addresses', {
          ...formData.addresses,
          pickup: {
            ...formData.addresses?.pickup,
            challenges: selectedChallenges
          }
        });
      } else {
        updateFormData('addresses', {
          ...formData.addresses,
          destination: {
            ...formData.addresses?.destination,
            challenges: selectedChallenges
          }
        });
      }
      nextStep();
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Common Challenges */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <h3 className="text-sm font-medium text-foreground">Common challenges</h3>
          </div>
          
          <div className="space-y-2">
            {stepData.commonChallenges?.map((challenge) => {
              const isSelected = selectedChallenges.some(c => c.id === challenge.id);
              const selectedChallenge = selectedChallenges.find(c => c.id === challenge.id);
              const Icon = ICON_COMPONENTS[challenge.icon];
              
              return (
                <div key={challenge.id} className="space-y-3">
                  <div
                    onClick={() => handleChallengeToggle(challenge.id)}
                    className={`
                      group relative flex items-center p-3 rounded-lg border cursor-pointer 
                      transition-all duration-200
                      ${isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-border/60 hover:border-primary/40 hover:bg-muted/20'
                      }
                    `}
                  >
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-lg mr-4
                      transition-colors duration-200
                      ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:text-foreground'}
                    `}>
                      {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1">
                      <span className={`font-medium transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {challenge.label}
                      </span>
                    </div>
                    
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      transition-all duration-200
                      ${isSelected 
                        ? 'border-primary bg-primary' 
                        : 'border-border group-hover:border-primary/40'
                      }
                    `}>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                  
                  {isSelected && challenge.hasInput && (
                    <div className="ml-14 animate-in slide-in-from-top-2 duration-200">
                      <input
                        type={challenge.inputType}
                        value={selectedChallenge?.value || ''}
                        onChange={(e) => handleChallengeValueChange(challenge.id, e.target.value)}
                        placeholder={challenge.inputPlaceholder}
                        className="
                          w-full px-4 py-3 border border-border rounded-lg
                          focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
                          transition-all duration-200
                        "
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Custom Challenge Input */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <h3 className="text-sm font-medium text-foreground">Add custom challenge</h3>
          </div>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={customChallenge}
              onChange={(e) => setCustomChallenge(e.target.value)}
              placeholder="Describe any other challenges..."
              className="
                flex-1 px-4 py-3 border border-border rounded-lg
                focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
                transition-all duration-200
              "
            />
            <button
              type="button"
              onClick={handleAddCustomChallenge}
              disabled={!customChallenge.trim()}
              className="
                px-4 py-3 bg-accent text-accent-foreground rounded-lg
                hover:bg-accent/90 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                border border-border hover:border-accent
              "
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Selected Custom Challenges */}
        {selectedChallenges.filter(c => c.isCustom).length > 0 && (
          <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <h3 className="text-sm font-semibold text-foreground">Custom challenges added</h3>
            </div>
            
            <div className="space-y-2">
              {selectedChallenges.filter(c => c.isCustom).map((challenge) => (
                <div key={challenge.id} className="
                  flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50
                ">
                  <span className="text-sm font-medium text-foreground">{challenge.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChallenge(challenge.id)}
                    className="
                      p-1 text-muted-foreground hover:text-destructive 
                      hover:bg-destructive/10 rounded-md transition-all duration-200
                    "
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    );
  };

  const renderContent = () => {
    const { type = 'grid' } = stepData.layout || {};
    
    switch (type) {
      case 'calendar':
        return renderCalendar();
      case 'challenges':
        return renderChallenges();
      case 'form':
        return renderForm();
      case 'list':
        return renderServiceOptions(); // Handle list layout with service options
      case 'grid':
        if (stepData.options?.[0]?.type === 'service') {
          return renderServiceOptions();
        } else {
          return renderButtonOptions();
        }
      default:
        return renderButtonOptions();
    }
  };

  // Welcome back handlers
  const handleSelectMove = () => {
    if (savedMove) {
      // Handle both data structures - direct properties or nested formData
      const moveData = savedMove.formData ? savedMove.formData : savedMove;
      
      // Load the saved move data into the store
      Object.keys(moveData || {}).forEach(key => {
        updateFormData(key, moveData[key]);
      });
      
      // Set the estimate data to window for Voiceflow
      if (savedMove.estimate) {
        window.estimateData = {
          estimate: savedMove.estimate,
          formattedPricing: savedMove.formattedPricing || savedMove.pricing
        };
      }
      
      // Go directly to Voiceflow screen (step 15)
      goToStep(15);
    }
  };

  const handleNewMove = () => {
    // Clear localStorage and continue with normal flow
    localStorage.removeItem('moovinleads_review');
    setShowWelcomeBack(false);
    setSavedMove(null);
  };

  // Show Welcome Back screen if we have a saved move
  if (showWelcomeBack && savedMove && stepData?.id === 'welcome') {
    return (
      <WelcomeBack 
        savedMove={savedMove}
        onSelectMove={handleSelectMove}
        onNewMove={handleNewMove}
      />
    );
  }

  const containerClass = stepData.layout?.centered 
    ? "flex flex-col items-center justify-center space-y-6 text-center"
    : "space-y-6";

  return (
    <div className={containerClass}>
      {renderHeader()}
      {renderContent()}
      {stepData.buttons?.secondary && (
        <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
          {stepData.buttons.secondary.text}
        </button>
      )}
      {renderFooter()}
    </div>
  );
}