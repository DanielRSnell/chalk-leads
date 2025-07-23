import React, { useState } from 'react';
import { ArrowUp, Building, Truck, AlertTriangle, Plus, X } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';

const COMMON_CHALLENGES = [
  { id: 'stairs', label: 'Stairs (flights)', icon: ArrowUp, hasInput: true, inputType: 'number', inputPlaceholder: 'Number of flights' },
  { id: 'elevator', label: 'Elevator available', icon: Building, hasInput: false },
  { id: 'narrow_doorway', label: 'Narrow doorways', icon: AlertTriangle, hasInput: false },
  { id: 'parking_distance', label: 'Long distance from parking', icon: Truck, hasInput: true, inputType: 'text', inputPlaceholder: 'Approximate distance' },
  { id: 'heavy_items', label: 'Heavy/bulky items', icon: AlertTriangle, hasInput: false },
  { id: 'fragile_items', label: 'Fragile items', icon: AlertTriangle, hasInput: false }
];

export function FromLocationChallenges() {
  const { formData, updateFormData, nextStep } = useLeadStore();
  const [selectedChallenges, setSelectedChallenges] = useState(formData.addresses?.pickup?.challenges || []);
  const [customChallenge, setCustomChallenge] = useState('');
  
  const handleChallengeToggle = (challengeId) => {
    const existing = selectedChallenges.find(c => c.id === challengeId);
    if (existing) {
      setSelectedChallenges(selectedChallenges.filter(c => c.id !== challengeId));
    } else {
      const challengeTemplate = COMMON_CHALLENGES.find(c => c.id === challengeId);
      setSelectedChallenges([...selectedChallenges, {
        id: challengeId,
        label: challengeTemplate.label,
        value: challengeTemplate.hasInput ? '' : true
      }]);
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
    updateFormData('addresses', {
      ...formData.addresses,
      pickup: {
        ...formData.addresses.pickup,
        challenges: selectedChallenges
      }
    });
    nextStep();
  };
  
  return (
    <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-2xl mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Pickup Location Challenges
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Help us prepare the right equipment and crew for your pickup location
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Common Challenges */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <h3 className="text-sm font-medium text-foreground">Common challenges</h3>
          </div>
          
          <div className="space-y-2">
            {COMMON_CHALLENGES.map((challenge) => {
              const isSelected = selectedChallenges.some(c => c.id === challenge.id);
              const selectedChallenge = selectedChallenges.find(c => c.id === challenge.id);
              const Icon = challenge.icon;
              
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
                      <Icon className="w-5 h-5" />
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
        
        {/* Action Buttons */}
        <div className="border-t border-border/20 pt-6 mt-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => nextStep()}
              className="
                flex-1 py-3 px-4 border border-border rounded-lg text-sm font-medium
                hover:bg-muted/50 hover:border-border/60 transition-all duration-200
                text-muted-foreground hover:text-foreground
              "
            >
              Skip
            </button>
            <div className="w-px bg-border/30 self-stretch mx-1" />
            <button
              type="submit"
              className="
                flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg 
                text-sm font-semibold shadow-sm hover:shadow-md
                hover:bg-primary/90 active:scale-[0.99]
                transition-all duration-200
              "
            >
              Continue
              </button>
          </div>
        </div>
      </form>
      
      {/* Footer Note */}
      <div className="mt-8 pt-6 border-t border-border/30">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
          <p className="text-sm">
            This helps us bring the right equipment and estimate time accurately
          </p>
          <div className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}