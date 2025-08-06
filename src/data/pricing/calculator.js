import baseRates from './base-rates.json';
import challengeModifiers from './challenge-modifiers.json';

/**
 * Calculate estimated moving cost based on form data
 * @param {Object} formData - Form data from lead capture widget
 * @returns {Object} Pricing breakdown with total estimate
 */
export function calculateMovingEstimate(formData) {
  let basePrice = 0;
  let totalHours = 0;
  let breakdown = {
    basePrice: 0,
    serviceType: '',
    timeWindow: '',
    distance: 0,
    distanceCost: 0,
    challenges: [],
    additionalServices: [],
    movingSupplies: [],
    modifiers: [],
    subtotal: 0,
    tax: 0,
    total: 0
  };

  // 1. Get base price from move size
  const moveSize = formData.moveSize;
  if (moveSize && baseRates.moveSize[moveSize]) {
    const moveSizeData = baseRates.moveSize[moveSize];
    basePrice = moveSizeData.basePrice;
    totalHours = moveSizeData.hours;
    breakdown.basePrice = basePrice;
    breakdown.moveSize = moveSize;
  }

  // 2. Apply service type multiplier
  const serviceType = formData.serviceType;
  if (serviceType && baseRates.serviceType[serviceType]) {
    const serviceMultiplier = baseRates.serviceType[serviceType].multiplier;
    basePrice *= serviceMultiplier;
    breakdown.serviceType = serviceType;
    breakdown.modifiers.push({
      name: `Service Type (${serviceType})`,
      type: 'multiplier',
      value: serviceMultiplier,
      description: baseRates.serviceType[serviceType].description
    });
  }

  // 3. Apply labor type multiplier (if labor-only service)
  if (serviceType === 'labor-only' && formData.laborType) {
    const laborType = formData.laborType;
    if (baseRates.laborType[laborType]) {
      const laborMultiplier = baseRates.laborType[laborType].multiplier;
      basePrice *= laborMultiplier;
      breakdown.modifiers.push({
        name: `Labor Type (${laborType})`,
        type: 'multiplier',
        value: laborMultiplier,
        description: baseRates.laborType[laborType].description
      });
    }
  }

  // 4. Apply time window multiplier
  const timeWindow = formData.timeWindow;
  if (timeWindow && baseRates.timeWindow[timeWindow]) {
    const timeMultiplier = baseRates.timeWindow[timeWindow].multiplier;
    basePrice *= timeMultiplier;
    breakdown.timeWindow = timeWindow;
    if (timeMultiplier !== 1.0) {
      breakdown.modifiers.push({
        name: `Time Window (${timeWindow})`,
        type: 'multiplier', 
        value: timeMultiplier,
        description: baseRates.timeWindow[timeWindow].description
      });
    }
  }

  // 5. Calculate distance-based cost
  const distance = formData.routeDistance || 0; // Distance in miles from Mapbox Directions API
  if (distance > baseRates.distance.minimumDistance) {
    const distanceCost = distance * baseRates.distance.costPerMile;
    breakdown.distance = distance;
    breakdown.distanceCost = distanceCost;
    basePrice += distanceCost;
  }

  let runningTotal = basePrice;

  // 6. Apply pickup location challenges
  const pickupChallenges = formData.addresses?.pickup?.challenges || [];
  pickupChallenges.forEach(challenge => {
    const modifier = applyChallenge(challenge, runningTotal);
    if (modifier.amount !== 0) {
      breakdown.challenges.push({
        location: 'pickup',
        ...modifier
      });
      runningTotal += modifier.amount;
    }
  });

  // 7. Apply destination location challenges
  const destinationChallenges = formData.addresses?.destination?.challenges || [];
  destinationChallenges.forEach(challenge => {
    const modifier = applyChallenge(challenge, runningTotal);
    if (modifier.amount !== 0) {
      breakdown.challenges.push({
        location: 'destination',
        ...modifier
      });
      runningTotal += modifier.amount;
    }
  });

  // 8. Apply additional services
  const additionalServices = formData.additionalServices || [];
  additionalServices.forEach(service => {
    const serviceId = service.id;
    if (challengeModifiers.additionalServices[serviceId]) {
      const serviceData = challengeModifiers.additionalServices[serviceId];
      let serviceAmount = 0;
      
      if (serviceData.type === 'percentage') {
        serviceAmount = runningTotal * serviceData.modifier;
      } else if (serviceData.type === 'fixed') {
        serviceAmount = serviceData.modifier;
      }
      
      breakdown.additionalServices.push({
        name: service.name,
        type: serviceData.type,
        modifier: serviceData.modifier,
        amount: serviceAmount,
        description: serviceData.description
      });
      
      runningTotal += serviceAmount;
    }
  });

  // 9. Apply moving supplies cost
  breakdown.movingSupplies = [];
  const movingSupplies = formData.movingSupplies || {};
  let suppliesTotal = 0;
  
  Object.values(movingSupplies).forEach(supply => {
    if (supply.quantity > 0) {
      const itemTotal = supply.price * supply.quantity;
      breakdown.movingSupplies.push({
        name: supply.name,
        price: supply.price,
        quantity: supply.quantity,
        amount: itemTotal,
        description: supply.description
      });
      suppliesTotal += itemTotal;
    }
  });
  
  runningTotal += suppliesTotal;

  // 10. Calculate final totals
  breakdown.subtotal = runningTotal;
  breakdown.tax = runningTotal * 0.08; // 8% tax
  breakdown.total = breakdown.subtotal + breakdown.tax;
  breakdown.estimatedHours = totalHours;

  return breakdown;
}

/**
 * Apply individual challenge modifier
 * @param {Object} challenge - Challenge object with id, value, etc.
 * @param {number} currentTotal - Current running total
 * @returns {Object} Modifier details with amount
 */
function applyChallenge(challenge, currentTotal) {
  const challengeId = challenge.id;
  const challengeData = challengeModifiers.challenges[challengeId];
  
  if (!challengeData) {
    return { name: challenge.label, amount: 0, description: 'Unknown challenge' };
  }

  let amount = 0;
  
  switch (challengeData.type) {
    case 'per_flight':
      // For stairs, multiply by number of flights
      const flights = parseInt(challenge.value) || 1;
      amount = challengeData.baseModifier * Math.min(flights, challengeData.maxFlights);
      break;
      
    case 'percentage':
      amount = currentTotal * challengeData.modifier;
      break;
      
    case 'fixed':
      amount = challengeData.modifier;
      break;
      
    case 'discount':
      amount = currentTotal * challengeData.modifier; // Negative amount
      break;
      
    default:
      amount = 0;
  }

  return {
    name: challenge.label,
    type: challengeData.type,
    modifier: challengeData.modifier || challengeData.baseModifier,
    amount: Math.round(amount),
    description: challengeData.description,
    value: challenge.value || null
  };
}

/**
 * Format pricing breakdown for display
 * @param {Object} breakdown - Pricing breakdown from calculateMovingEstimate
 * @returns {Object} Formatted pricing for UI display
 */
export function formatPricingBreakdown(breakdown) {
  return {
    basePrice: `$${breakdown.basePrice.toLocaleString()}`,
    subtotal: `$${Math.round(breakdown.subtotal).toLocaleString()}`,
    tax: `$${Math.round(breakdown.tax).toLocaleString()}`,
    total: `$${Math.round(breakdown.total).toLocaleString()}`,
    estimatedHours: `${breakdown.estimatedHours} hours`,
    breakdown: breakdown
  };
}

/**
 * Get price range for a move size (for display before full calculation)
 * @param {string} moveSize - Move size key
 * @returns {Object} Price range information
 */
export function getPriceRange(moveSize) {
  if (!baseRates.moveSize[moveSize]) {
    return { min: 0, max: 0, hours: 0 };
  }

  const base = baseRates.moveSize[moveSize].basePrice;
  return {
    min: Math.round(base * 0.85), // 15% below base for best case
    max: Math.round(base * 1.45), // 45% above base for complex moves
    hours: baseRates.moveSize[moveSize].hours,
    description: baseRates.moveSize[moveSize].description
  };
}