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

export function ToLocationChallenges() {
  const { formData, updateFormData, nextStep } = useLeadStore();
  const [selectedChallenges, setSelectedChallenges] = useState(formData.addresses?.destination?.challenges || []);
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
      destination: {
        ...formData.addresses.destination,
        challenges: selectedChallenges
      }
    });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-2xl mb-4">
          <AlertTriangle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Destination Challenges
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Help us prepare for any challenges at your destination location
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Common Challenges */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-foreground">Common challenges:</h3>
          <div className="space-y-2">
            {COMMON_CHALLENGES.map((challenge) => {
              const isSelected = selectedChallenges.some(c => c.id === challenge.id);
              const selectedChallenge = selectedChallenges.find(c => c.id === challenge.id);
              const Icon = challenge.icon;
              
              return (
                <div key={challenge.id} className="space-y-2">
                  <div
                    onClick={() => handleChallengeToggle(challenge.id)}
                    className={`
                      flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-border/60 hover:border-primary/40 hover:bg-muted/20'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="flex-1 text-sm font-medium">{challenge.label}</span>
                    {isSelected && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  
                  {isSelected && challenge.hasInput && (
                    <input
                      type={challenge.inputType}
                      value={selectedChallenge?.value || ''}
                      onChange={(e) => handleChallengeValueChange(challenge.id, e.target.value)}
                      placeholder={challenge.inputPlaceholder}
                      className="w-full ml-8 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Custom Challenge Input */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-foreground">Add custom challenge:</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={customChallenge}
              onChange={(e) => setCustomChallenge(e.target.value)}
              placeholder="Describe any other challenges..."
              className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddCustomChallenge}
              disabled={!customChallenge.trim()}
              className="px-3 py-2 bg-muted border border-border rounded-md hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Selected Custom Challenges */}
        {selectedChallenges.filter(c => c.isCustom).length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-foreground">Custom challenges:</h3>
            {selectedChallenges.filter(c => c.isCustom).map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span className="text-sm">{challenge.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveChallenge(challenge.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
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
                flex-1 py-3 px-4 bg-success text-success-foreground rounded-lg 
                text-sm font-semibold shadow-sm hover:shadow-md
                hover:bg-success/90 active:scale-[0.99]
                transition-all duration-200
              "
            >
              Continue
            </button>
          </div>
        </div>
      </form>
      
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          This helps us prepare the right equipment and crew
        </p>
      </div>
    </div>
  );
}