import React, { useState, useRef, useEffect } from 'react';
import { MapPin, AlertTriangle, Check, Search, ChevronDown, Loader2 } from 'lucide-react';

export function MapboxAutofill({ 
  value, 
  onChange, 
  placeholder, 
  label,
  icon: IconComponent 
}) {
  console.log('🗺️ MapboxAutofill component mounted with props:', {
    value, placeholder, label, hasIcon: !!IconComponent, hasOnChange: !!onChange
  });
  
  const [selectedFromAutocomplete, setSelectedFromAutocomplete] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  // Debug state changes (can be removed in production)
  useEffect(() => {
    console.log('🔄 State update - suggestions:', suggestions.length, 'showSuggestions:', showSuggestions);
  }, [suggestions, showSuggestions]);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);
  
  // Test WordPress API on component mount
  useEffect(() => {
    const testWordPressAPI = async () => {
      try {
        console.log('🧪 Testing WordPress Mapbox API endpoint...');
        const apiUrl = window.moovinleadsData?.apiUrl || '/wp-json/moovinleads/v1/';
        const testUrl = `${apiUrl}mapbox/suggest?q=new%20york&limit=1`;
        
        console.log('🌐 API URL:', testUrl);
        
        const response = await fetch(testUrl);
        console.log('🧪 WordPress API status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ WordPress API working:', data);
        } else {
          const errorText = await response.text();
          console.error('❌ WordPress API failed:', response.status, errorText);
        }
      } catch (error) {
        console.error('❌ WordPress API test error:', error);
      }
    };
    
    testWordPressAPI();
  }, []);

  // Fetch suggestions from WordPress API
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const apiUrl = window.moovinleadsData?.apiUrl || '/wp-json/moovinleads/v1/';
      const url = `${apiUrl}mapbox/suggest?q=${encodeURIComponent(query)}&types=address&country=US&limit=5`;
      
      console.log('🔍 Fetching suggestions from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('💡 Received suggestions:', data);
      
      // Handle both direct API response and WordPress wrapped response
      let suggestions = [];
      if (data.suggestions && Array.isArray(data.suggestions)) {
        suggestions = data.suggestions;
      } else if (data.features && Array.isArray(data.features)) {
        // Direct Mapbox API response format
        suggestions = data.features;
      } else if (Array.isArray(data)) {
        // Simple array format
        suggestions = data;
      }
      
      console.log('✅ Loaded', suggestions.length, 'suggestions');
      
      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = (query) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    console.log('📝 Input changed:', newValue);
    
    setSelectedFromAutocomplete(false);
    setActiveSuggestion(-1);
    onChange(newValue);
    
    // Start debounced search
    debouncedSearch(newValue);
  };

  const handleSuggestionSelect = (suggestion) => {
    console.log('🎯 Suggestion selected:', suggestion);
    
    // Extract address from Mapbox Search Box API response format
    const address = suggestion.full_address ||
                   suggestion.place_formatted ||
                   suggestion.address ||
                   suggestion.name ||
                   suggestion.place_name ||
                   suggestion.properties?.full_address ||
                   suggestion.text;
    
    if (address) {
      console.log('✅ Setting address from suggestion:', address);
      setSelectedFromAutocomplete(true);
      setShowSuggestions(false);
      setActiveSuggestion(-1);
      onChange(address);
    } else {
      console.warn('⚠️ No address found in suggestion:', suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!showSuggestions && suggestions.length > 0) {
          setShowSuggestions(true);
          setActiveSuggestion(0);
        } else if (showSuggestions && suggestions.length > 0) {
          setActiveSuggestion(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (showSuggestions && suggestions.length > 0) {
          setActiveSuggestion(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
        }
        break;
        
      case 'Enter':
        if (showSuggestions && activeSuggestion >= 0 && suggestions[activeSuggestion]) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[activeSuggestion]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        inputRef.current?.blur();
        break;
        
      case 'Tab':
        if (showSuggestions) {
          setShowSuggestions(false);
          setActiveSuggestion(-1);
        }
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    console.log('🎯 Input focused');
    if (value && suggestions.length > 0) {
      setShowSuggestions(true);
      setActiveSuggestion(-1);
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    // Use a longer delay to ensure clicks on suggestions work
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    }, 200);
  };

  // Scroll active suggestion into view
  useEffect(() => {
    if (activeSuggestion >= 0 && suggestionsRef.current) {
      const activeElement = suggestionsRef.current.querySelector(`#suggestion-${activeSuggestion}`);
      if (activeElement) {
        activeElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [activeSuggestion]);

  // Handle manual address confirmation when user types without selecting
  const checkForManualAddress = () => {
    if (value && !selectedFromAutocomplete && value.trim().length > 10) {
      setManualAddress(value);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmAddress = () => {
    setSelectedFromAutocomplete(true);
    setShowConfirmDialog(false);
    onChange(manualAddress);
  };

  const handleCancelAddress = () => {
    setShowConfirmDialog(false);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
      
      <div className="relative">
        {/* Main input container */}
        <div className="relative group">
          {IconComponent && (
            <IconComponent className="input-icon group-focus-within:text-primary" />
          )}
          
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            autoComplete="off"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-activedescendant={activeSuggestion >= 0 ? `suggestion-${activeSuggestion}` : undefined}
            className={`
              w-full pl-12 pr-12 py-3 border rounded-xl text-sm
              transition-all duration-200 placeholder:text-muted-foreground/60
              border-border hover:border-border/80 focus:border-primary 
              focus:ring-4 focus:ring-primary/10 focus:outline-none 
              bg-background/50 hover:bg-background
            `}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <Loader2 className="input-icon-right animate-spin" />
          )}
          
          {/* Success checkmark */}
          {selectedFromAutocomplete && value && !isLoading && (
            <Check className="input-icon-right text-success" />
          )}
        </div>
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="
              absolute top-full left-0 right-0 mt-1 bg-background border border-border 
              rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto
              animate-in fade-in-0 slide-in-from-top-2 duration-200
            "
            role="listbox"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
          >
{suggestions.map((suggestion, index) => {
                // Extract address from Mapbox Search Box API response format
                const address = suggestion.full_address ||
                               suggestion.place_formatted ||
                               suggestion.address ||
                               suggestion.name ||
                               suggestion.place_name ||
                               suggestion.properties?.full_address ||
                               suggestion.text ||
                               'Unknown address';
                
                const suggestionId = suggestion.mapbox_id || 
                                   suggestion.id || 
                                   suggestion.properties?.mapbox_id ||
                                   index;
                
                const isActive = index === activeSuggestion;
                
                return (
                  <button
                    key={suggestionId}
                    id={`suggestion-${index}`}
                    role="option"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors
                      border-b border-border/30 last:border-b-0 text-sm
                      ${isActive ? 'bg-muted/50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground">{address}</span>
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {/* Address Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 shadow-2xl max-w-md mx-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Address is different from what we found
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  We couldn't find this exact address in our suggestions. Is this address correct?
                </p>
                <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">
                      {manualAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancelAddress}
                className="flex-1 py-2.5 px-4 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                Let me fix it
              </button>
              <button
                onClick={handleConfirmAddress}
                className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Confirm address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}