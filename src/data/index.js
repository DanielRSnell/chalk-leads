// Step data imports
import welcomeData from './steps/welcome.json';
import laborTypeData from './steps/labor-type.json';
import moveTypeData from './steps/move-type.json';
import moveSizeData from './steps/move-size.json';
import dateSelectionData from './steps/date-selection.json';
import timeSelectionData from './steps/time-selection.json';
import pickupLocationData from './steps/pickup-location.json';
import pickupChallengesData from './steps/pickup-challenges.json';
import destinationLocationData from './steps/destination-location.json';
import destinationChallengesData from './steps/destination-challenges.json';
import routeDistanceData from './steps/route-distance.json';
import additionalServicesData from './steps/additional-services.json';
import movingSuppliesQuestionData from './steps/moving-supplies-question.json';

// Common data imports
import iconsData from './common/icons.json';

// Pricing system imports
import { calculateMovingEstimate, formatPricingBreakdown, getPriceRange } from './pricing/calculator.js';

// Step configuration
export const STEPS_DATA = {
  'welcome': welcomeData,
  'labor-type': laborTypeData,
  'move-type': moveTypeData,
  'move-size': moveSizeData,
  'date-selection': dateSelectionData,
  'time-selection': timeSelectionData,
  'pickup-location': pickupLocationData,
  'pickup-challenges': pickupChallengesData,
  'destination-location': destinationLocationData,
  'destination-challenges': destinationChallengesData,
  'route-distance': routeDistanceData,
  'additional-services': additionalServicesData,
  'moving-supplies-question': movingSuppliesQuestionData
};

// Step order configuration
export const STEP_ORDER = [
  'welcome',
  'labor-type',
  'move-type', 
  'move-size',
  'date-selection',
  'time-selection',
  'pickup-location',
  'pickup-challenges',
  'destination-location',
  'destination-challenges',
  'route-distance',
  'additional-services',
  'moving-supplies-question',
  'moving-supplies-selection',
  'contact',
  'review-details',
  'voiceflow-screen'
];

// Common data exports
export const ICONS = iconsData;

// Helper functions
export function getStepData(stepId) {
  return STEPS_DATA[stepId] || null;
}

export function getStepByIndex(index) {
  const stepId = STEP_ORDER[index];
  return stepId ? getStepData(stepId) : null;
}

export function getStepIndex(stepId) {
  return STEP_ORDER.indexOf(stepId);
}

export function getTotalSteps() {
  return STEP_ORDER.length;
}

export function getNextStepId(currentStepId) {
  const currentIndex = getStepIndex(currentStepId);
  return currentIndex >= 0 && currentIndex < STEP_ORDER.length - 1 
    ? STEP_ORDER[currentIndex + 1] 
    : null;
}

export function getPreviousStepId(currentStepId) {
  const currentIndex = getStepIndex(currentStepId);
  return currentIndex > 0 
    ? STEP_ORDER[currentIndex - 1] 
    : null;
}

// Validation helper
export function validateStepData(stepId, formData) {
  const stepData = getStepData(stepId);
  if (!stepData || !stepData.validation) return { isValid: true };
  
  const { required, field } = stepData.validation;
  if (!required) return { isValid: true };
  
  // Navigate nested field path (e.g., "addresses.pickup.address")
  const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], formData);
  
  return {
    isValid: Boolean(fieldValue),
    field: field,
    message: stepData.validation.errorMessage || `${field} is required`
  };
}

// Icon helper
export function getIconComponent(iconName) {
  return ICONS.iconMapping[iconName] || iconName;
}

// Export pricing functions
export { calculateMovingEstimate, formatPricingBreakdown, getPriceRange };

export default {
  STEPS_DATA,
  STEP_ORDER,
  ICONS,
  getStepData,
  getStepByIndex,
  getStepIndex,
  getTotalSteps,
  getNextStepId,
  getPreviousStepId,
  validateStepData,
  getIconComponent,
  calculateMovingEstimate,
  formatPricingBreakdown,
  getPriceRange
};