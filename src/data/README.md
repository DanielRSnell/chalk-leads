# Data-Driven Widget System

This directory contains the static content configuration for the MoovinLeads widget, allowing easy content management without touching code.

## Directory Structure

```
src/data/
├── steps/                    # Individual step configurations
│   ├── welcome.json
│   ├── labor-type.json
│   ├── move-size.json
│   ├── pickup-location.json
│   ├── pickup-challenges.json
│   ├── destination-location.json
│   ├── destination-challenges.json
│   └── additional-services.json
├── common/                   # Shared configurations
│   └── icons.json
├── index.js                  # Data export and helper functions
└── README.md                 # This file
```

## Step Configuration Format

Each step JSON file follows this general structure:

```json
{
  "id": "step-id",
  "title": "Step Title",
  "subtitle": "Optional subtitle",
  "conditional": {              // Optional conditional logic
    "field": "formField",
    "value": "expectedValue",
    "skipIfNot": true
  },
  "headerIcon": {              // Optional header icon
    "name": "IconName",
    "color": "primary",
    "background": "primary/10"
  },
  "prompt": {                  // Optional avatar prompt
    "message": "Prompt text",
    "type": "avatar"
  },
  "options": [...],            // Step options/choices
  "fields": [...],             // Form fields (if applicable)
  "sections": [...],           // Complex sections (challenges, etc.)
  "buttons": {                 // Button configuration
    "primary": {
      "text": "Continue",
      "action": "auto|submit|skip",
      "color": "primary|success"
    },
    "secondary": {
      "text": "Skip",
      "action": "skip"
    }
  },
  "layout": {                  // Layout configuration
    "type": "grid|form|list",
    "columns": 1,
    "centered": false,
    "selectable": "single|multiple"
  },
  "validation": {              // Validation rules
    "required": true,
    "field": "formField",
    "errorMessage": "Error text"
  },
  "footer": {                  // Optional footer
    "note": "Footer note text"
  }
}
```

## Option Types

### Service Options
Used for service selection with icons, titles, and descriptions:

```json
{
  "id": "option-id",
  "value": "form-value",
  "title": "Option Title",
  "description": "Option description",
  "icon": "IconName",
  "type": "service"
}
```

### Button Options
Simple button choices:

```json
{
  "id": "option-id",
  "value": "form-value",
  "label": "Button Label",
  "type": "button"
}
```

### Service Toggle Options
Multi-selectable services:

```json
{
  "id": "option-id",
  "value": "form-value",
  "title": "Service Title",
  "description": "Service description",
  "icon": "IconName",
  "type": "service-toggle"
}
```

## Challenge Configuration

Complex challenge steps support multiple input types:

```json
{
  "sections": [
    {
      "id": "common-challenges",
      "title": "Common challenges",
      "type": "checkbox-list",
      "options": [
        {
          "id": "stairs",
          "label": "Stairs (flights)",
          "icon": "ArrowUp",
          "hasInput": true,
          "inputType": "number|text",
          "inputPlaceholder": "Number of flights"
        }
      ]
    },
    {
      "id": "custom-challenge",
      "title": "Add custom challenge",
      "type": "custom-input",
      "placeholder": "Describe challenges...",
      "buttonIcon": "Plus"
    }
  ]
}
```

## Form Fields

Address and other form inputs:

```json
{
  "fields": [
    {
      "id": "field-id",
      "type": "address|text|email|phone",
      "label": "Field Label",
      "placeholder": "Placeholder text",
      "icon": "IconName",
      "required": true,
      "validation": {
        "field": "formPath.field",
        "errorMessage": "Error message"
      },
      "features": {
        "googleMapsPreview": true,
        "autoComplete": true
      }
    }
  ]
}
```

## Layout Types

### Grid Layout
```json
{
  "layout": {
    "type": "grid",
    "columns": 1|2,
    "centered": true|false
  }
}
```

### Form Layout
```json
{
  "layout": {
    "type": "form",
    "sections": true|false
  }
}
```

### List Layout
```json
{
  "layout": {
    "type": "list",
    "selectable": "single|multiple"
  }
}
```

## Available Icons

All Lucide React icons are supported. Common ones include:
- `Truck`, `Users`, `Package`, `Shield`, `Wrench`
- `MapPin`, `Navigation`, `Building`, `AlertTriangle`
- `ArrowUp`, `ArrowDown`, `ArrowUpDown`
- `Calendar`, `Clock`, `User`, `Mail`, `Phone`
- `Check`, `X`, `Plus`, `MessageCircle`

## Helper Functions

The `index.js` file exports several helper functions:

```javascript
import { getStepData, validateStepData, getIconComponent } from '../data';

// Get step configuration
const stepData = getStepData('welcome');

// Validate step data against form data
const validation = validateStepData('welcome', formData);

// Get icon component name
const iconName = getIconComponent('Truck');
```

## Adding New Steps

1. Create a new JSON file in `src/data/steps/`
2. Add the step ID to `STEP_ORDER` in `index.js`
3. Import the JSON file in `index.js`
4. Add to `STEPS_DATA` object

## Migration from Component-Based

Legacy components can coexist with data-driven steps. The system automatically:
- Uses data-driven rendering for configured steps
- Falls back to legacy components for unconfigured steps
- Maintains backward compatibility

## Benefits

- **Easy Content Management**: Update text, options, and layout without code changes
- **Consistent UI**: Standardized components ensure consistent look and feel
- **Internationalization Ready**: JSON structure supports easy translation
- **Version Control**: Content changes are tracked like code changes
- **Non-Technical Updates**: Content managers can update without developer involvement
- **A/B Testing**: Easy to swap different configurations for testing