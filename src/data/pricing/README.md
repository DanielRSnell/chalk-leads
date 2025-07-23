# Moving Estimate Pricing System

This directory contains the comprehensive pricing calculation system for the lead capture widget. The system automatically calculates estimates based on user selections and displays real-time pricing updates.

## Files Overview

### `base-rates.json`
Contains base pricing for different move sizes, service types, labor types, and time windows.

**Move Sizes:**
- Studio: $350 base (3 hours)
- 1 Bedroom: $475 base (4 hours) 
- 2 Bedroom: $650 base (5 hours)
- 3 Bedroom: $825 base (6.5 hours)
- 4 Bedroom: $1,050 base (8 hours)
- 5+ Bedroom: $1,300 base (10 hours)

**Service Types:**
- Full Service: 1.0x multiplier
- Labor Only: 0.65x multiplier

**Time Windows:**
- Morning/Afternoon: 1.0x multiplier
- Evening: 1.15x multiplier (15% premium)

### `challenge-modifiers.json`
Contains pricing modifiers for location challenges and additional services.

**Challenge Types:**
- `per_flight`: Cost per flight of stairs ($45 each, max 10 flights)
- `percentage`: Percentage increase/decrease from current total
- `fixed`: Fixed dollar amount added
- `discount`: Negative percentage (like elevator discount -5%)

**Additional Services:**
- Packing: +25% of base price
- Insurance: +8% of base price  
- Disassembly: +$200 fixed fee
- Storage: +$150 fixed fee
- Cleaning: +$175 fixed fee

### `calculator.js`
Main calculation engine with these functions:

#### `calculateMovingEstimate(formData)`
Calculates full pricing breakdown based on form data.

**Returns:**
```javascript
{
  basePrice: 650,
  serviceType: 'full-service',
  timeWindow: 'morning',
  challenges: [...],
  additionalServices: [...],
  modifiers: [...],
  subtotal: 890,
  tax: 71.20,
  total: 961.20,
  estimatedHours: 5
}
```

#### `formatPricingBreakdown(breakdown)`
Formats pricing for UI display with currency formatting.

#### `getPriceRange(moveSize)`
Gets price range for a move size before full calculation.

## Usage Examples

### Basic Calculation
```javascript
import { calculateMovingEstimate } from './calculator.js';

const formData = {
  moveSize: '2-bedroom',
  serviceType: 'full-service',
  timeWindow: 'evening',
  addresses: {
    pickup: {
      challenges: [
        { id: 'stairs', label: 'Stairs', value: '2' }
      ]
    }
  },
  additionalServices: [
    { id: 'packing', name: 'Packing Service' }
  ]
};

const estimate = calculateMovingEstimate(formData);
// Result: ~$1,190 total (2BR base $650 + evening 15% + stairs $90 + packing 25% + tax)
```

### Using in React Components
```javascript
import { useLeadStore } from '../../storage/leadStore';

function PricingDisplay() {
  const { formattedEstimateTotal, calculateEstimate } = useLeadStore();
  
  useEffect(() => {
    calculateEstimate();
  }, []);
  
  return <div>Estimated Total: {formattedEstimateTotal}</div>;
}
```

### Zustand Store Integration
The pricing system is integrated into the Zustand store:

```javascript
// Auto-calculate when form data changes
updateFormDataWithPricing('moveSize', '3-bedroom');

// Access current estimate
const { currentEstimate, formattedPricing } = useLeadStore();
console.log(currentEstimate.total); // Raw number
console.log(formattedPricing.total); // Formatted "$1,234"
```

## Calculation Flow

1. **Base Price**: Start with move size base price
2. **Service Type**: Apply service multiplier (full-service 1.0x, labor-only 0.65x)
3. **Labor Type**: If labor-only, apply labor type multiplier
4. **Time Window**: Apply time premium (evening +15%)
5. **Location Challenges**: Add pickup and destination challenge costs
6. **Additional Services**: Add selected additional services
7. **Tax**: Calculate 8% tax on subtotal
8. **Total**: Final estimate with tax

## Pricing Display Integration

The move size selection now shows starting prices:
- Studio: "Starting at $350"
- 1 Bedroom: "Starting at $475"
- etc.

Real-time estimate updates are available through the store's `formattedEstimateTotal` getter.

## Customization

To modify pricing:

1. **Base Rates**: Edit `base-rates.json` move size prices and multipliers
2. **Challenge Costs**: Edit `challenge-modifiers.json` challenge pricing
3. **Tax Rate**: Modify tax calculation in `calculator.js` (currently 8%)
4. **New Services**: Add to `challenge-modifiers.json` additionalServices section

The system is designed to be easily maintainable by non-technical users through JSON configuration files.