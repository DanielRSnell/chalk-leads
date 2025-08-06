import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateMovingEstimate, formatPricingBreakdown } from '../data/pricing/calculator.js';

const initialFormData = {
  serviceType: null,
  laborType: null,
  locationType: null,
  moveSize: null,
  moveDate: null,
  timeWindow: null,
  addresses: {
    pickup: {
      address: '',
      googleMapsUrl: '',
      challenges: []
    },
    destination: {
      address: '',
      googleMapsUrl: '', 
      challenges: []
    }
  },
  contact: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredContact: 'phone'
  },
  additionalServices: [],
  needsSupplies: null,
  movingSupplies: {},
  specialRequirements: '',
  termsAccepted: false,
  newsletterOptIn: false
};

const useLeadStore = create(
  persist(
    (set, get) => ({
      // Navigation state
      currentStep: 0,
      totalSteps: 17,
      isWidgetOpen: false,
      
      // Form data
      formData: initialFormData,
      
      // Pricing data
      currentEstimate: null,
      formattedPricing: null,
      
      // UI state
      isSubmitting: false,
      errors: {},
      
      // Company branding (can be overridden by WordPress settings)
      companyName: 'Atlanta\'s Furniture Taxi',
      companyLogo: null,
      
      // Computed properties
      get canGoBack() {
        return get().currentStep > 0;
      },
      
      get isLastStep() {
        return get().currentStep === get().totalSteps - 1;
      },
      
      get progressPercentage() {
        const { currentStep, totalSteps } = get();
        return Math.round(((currentStep + 1) / totalSteps) * 100);
      },
      
      // Navigation actions
      nextStep: () => set((state) => {
        let nextStep = Math.min(state.currentStep + 1, state.totalSteps - 1);
        
        // Skip moving supplies selection if user doesn't need supplies
        if (state.currentStep === 12 && state.formData.needsSupplies === 'no') { // moving-supplies-question step (index 12)
          nextStep = Math.min(nextStep + 1, state.totalSteps - 1); // Skip to contact step
        }
        
        return {
          currentStep: nextStep,
          errors: {} // Clear errors when moving to next step
        };
      }),
      
      prevStep: () => set((state) => {
        const prevStep = Math.max(state.currentStep - 1, 0);
        return {
          currentStep: prevStep,
          errors: {} // Clear errors when going back
        };
      }),
      
      goToStep: (stepIndex) => set((state) => {
        const step = Math.max(0, Math.min(stepIndex, state.totalSteps - 1));
        return {
          currentStep: step,
          errors: {}
        };
      }),
      
      // Form data actions
      updateFormData: (field, value) => set((state) => {
        // Handle nested object updates (e.g., contact.firstName)
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          return {
            formData: {
              ...state.formData,
              [parent]: {
                ...state.formData[parent],
                [child]: value
              }
            }
          };
        }
        
        return {
          formData: {
            ...state.formData,
            [field]: value
          }
        };
      }),
      
      updateContactInfo: (contactData) => set((state) => ({
        formData: {
          ...state.formData,
          contact: {
            ...state.formData.contact,
            ...contactData
          }
        }
      })),
      
      addAdditionalService: (service) => set((state) => ({
        formData: {
          ...state.formData,
          additionalServices: [...state.formData.additionalServices, service]
        }
      })),
      
      removeAdditionalService: (serviceId) => set((state) => ({
        formData: {
          ...state.formData,
          additionalServices: state.formData.additionalServices.filter(s => s.id !== serviceId)
        }
      })),
      
      // Pricing methods
      calculateEstimate: () => {
        const state = get();
        try {
          const estimate = calculateMovingEstimate(state.formData);
          const formatted = formatPricingBreakdown(estimate);
          
          set({
            currentEstimate: estimate,
            formattedPricing: formatted
          });
          
          return estimate;
        } catch (error) {
          console.error('Error calculating estimate:', error);
          return null;
        }
      },
      
      updateFormDataWithPricing: (field, value) => {
        // Update form data
        get().updateFormData(field, value);
        // Recalculate pricing
        setTimeout(() => get().calculateEstimate(), 0);
      },
      
      // Get current estimate total
      get estimateTotal() {
        const estimate = get().currentEstimate;
        return estimate ? Math.round(estimate.total) : 0;
      },
      
      // Get formatted estimate total
      get formattedEstimateTotal() {
        const total = get().estimateTotal;
        return total > 0 ? `$${total.toLocaleString()}` : '$0';
      },
      
      // Validation
      setErrors: (errors) => set({ errors }),
      
      clearErrors: () => set({ errors: {} }),
      
      validateCurrentStep: () => {
        const state = get();
        const { currentStep, formData } = state;
        const errors = {};
        
        switch (currentStep) {
          case 0: // Welcome Screen
            if (!formData.serviceType) {
              errors.serviceType = 'Please select a service type';
            }
            break;
            
          case 1: // Labor Type (only if labor-only selected)
            if (formData.serviceType === 'labor-only' && !formData.laborType) {
              errors.laborType = 'Please select a labor type';
            }
            break;
            
          case 2: // Move Type
            if (!formData.locationType) {
              errors.locationType = 'Please select a location type';
            }
            break;
            
          case 3: // Move Size
            if (!formData.moveSize) {
              errors.moveSize = 'Please select a move size';
            }
            break;
            
          case 4: // Date
            if (!formData.moveDate) {
              errors.moveDate = 'Please select a move date';
            }
            break;
            
          case 5: // Time
            if (!formData.timeWindow) {
              errors.timeWindow = 'Please select a time window';
            }
            break;
            
          case 6: // From Location
            if (!formData.addresses.pickup.address) {
              errors.pickupAddress = 'Please provide a pickup address';
            }
            break;
            
          case 7: // From Location Challenges
            // No validation required - challenges are optional
            break;
            
          case 8: // To Location
            if (!formData.addresses.destination.address) {
              errors.destinationAddress = 'Please provide a destination address';
            }
            break;
            
          case 9: // To Location Challenges
            // No validation required - challenges are optional
            break;
            
          case 10: // Additional Services
            // No validation required - services are optional
            break;
            
          case 11: // Moving Supplies Question
            // No validation required - question is optional
            break;
            
          case 12: // Moving Supplies Selection
            // No validation required - supplies are optional
            break;
            
          case 13: // Contact Info
            if (!formData.contact.firstName) {
              errors.firstName = 'First name is required';
            }
            if (!formData.contact.lastName) {
              errors.lastName = 'Last name is required';
            }
            if (!formData.contact.email) {
              errors.email = 'Email is required';
            } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.contact.email)) {
              errors.email = 'Please enter a valid email';
            }
            if (!formData.contact.phone) {
              errors.phone = 'Phone number is required';
            }
            break;
            
          case 14: // Review Details
            // No validation required - just review
            break;
            
          case 15: // Voiceflow Screen
            // No validation required
            break;
        }
        
        set({ errors });
        return Object.keys(errors).length === 0;
      },
      
      // Widget state
      openWidget: () => set({ isWidgetOpen: true }),
      
      closeWidget: () => set({ isWidgetOpen: false }),
      
      // Form submission
      submitLead: async () => {
        set({ isSubmitting: true });
        
        try {
          const { formData } = get();
          
          // Get WordPress data from global
          const wpData = window.moovinleadsData || {};
          
          const response = await fetch(wpData.apiUrl + 'leads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': wpData.nonce
            },
            body: JSON.stringify({
              ...formData,
              timestamp: new Date().toISOString(),
              source: 'moovinleads-widget'
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to submit lead');
          }
          
          const result = await response.json();
          
          // Reset form after successful submission
          set({
            formData: initialFormData,
            currentStep: 0,
            isSubmitting: false,
            errors: {}
          });
          
          return result;
        } catch (error) {
          set({ 
            isSubmitting: false,
            errors: { submit: error.message }
          });
          throw error;
        }
      },
      
      // Reset form
      resetForm: () => set({
        formData: initialFormData,
        currentStep: 0,
        isSubmitting: false,
        errors: {},
        isWidgetOpen: false
      }),
      
      // Company branding
      updateCompanyBranding: (branding) => set((state) => ({
        companyName: branding.name || state.companyName,
        companyLogo: branding.logo || state.companyLogo
      }))
    }),
    {
      name: 'moovinleads-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        companyName: state.companyName,
        companyLogo: state.companyLogo
      })
    }
  )
);

export { useLeadStore };