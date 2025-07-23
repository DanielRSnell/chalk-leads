# MoovinLeads Recreation Plan

## Overview
This document outlines the comprehensive plan to recreate the Move Booker lead capture widget using React, based on the analysis of the existing HTML implementation. The widget is a sophisticated multi-step lead capture system for moving companies.

## Technology Stack
- **Framework**: React 18 with hooks
- **UI Library**: Tailwind CSS 4 with ShadCN design system
- **State Management**: Zustand for state management
- **Architecture**: Shadow DOM web component (`<moovinleads-widget>`)
- **Navigation**: React Router or custom step navigation
- **Icons**: Lucide React icons (similar to Ionic icons)

## Application Architecture

### Core Components Structure
```
src/
├── components/
│   ├── LeadCaptureWidget/
│   │   ├── index.jsx                 # Main widget wrapper
│   │   ├── ProgressBar.jsx           # Progress tracking
│   │   ├── Navigation.jsx            # Back/close buttons
│   │   ├── steps/
│   │   │   ├── WelcomeScreen.jsx     # Service selection
│   │   │   ├── LaborTypeSelection.jsx # Labor requirements
│   │   │   ├── MoveTypeSelection.jsx  # Location type
│   │   │   ├── MoveSizeSelection.jsx  # Home size
│   │   │   ├── DateSelection.jsx      # Calendar
│   │   │   ├── TimeSelection.jsx      # Time window
│   │   │   ├── AddressCollection.jsx  # Location details
│   │   │   ├── ContactInfo.jsx        # Personal details
│   │   │   └── Confirmation.jsx       # Final summary
│   │   └── ui/
│   │       ├── CalendarControl.jsx    # Custom calendar
│   │       ├── AvatarPrompt.jsx       # Conversational UI
│   │       ├── ServiceOption.jsx      # Selection cards
│   │       └── AddressAutocomplete.jsx # Address input
│   └── shared/
│       ├── Button.jsx                 # ShadCN buttons
│       ├── Input.jsx                  # Form inputs
│       └── Card.jsx                   # Content cards
```

## User Flow & Step Progression

### Step 1: Welcome Screen (app-services)
**Progress**: 0%
**Purpose**: Service type selection
**Components**: 
- Company branding header
- Avatar prompt with greeting
- Service selection cards
- Secondary action for existing bookings

**Data Collected**:
- `serviceType`: "full-service" | "labor-only"

**UI Elements**:
- Close button (top-right)
- Company name display
- Two large selection cards with icons and descriptions
- "I have an existing booking" link

### Step 2: Labor Type Selection (app-choose-labor)
**Progress**: 11%
**Purpose**: Specify labor requirements (only if labor-only selected)
**Components**:
- Progress bar with back button
- Question prompt
- Three selection options

**Data Collected**:
- `laborType`: "loading-unloading" | "loading-only" | "unloading-only"

**UI Elements**:
- Back navigation arrow
- Progress indicator
- Three option cards with descriptions

### Step 3: Move Type Selection (app-move-type)
**Progress**: 17%
**Purpose**: Determine location type
**Components**:
- Progress bar
- Three location type cards with icons

**Data Collected**:
- `locationType`: "home" | "storage" | "office"

**UI Elements**:
- Visual icons for each option
- Clean card layout
- Hover/selection states

### Step 4: Move Size Selection (app-move-size)
**Progress**: 22%
**Purpose**: Determine move size
**Components**:
- Progress bar
- Size selection grid

**Data Collected**:
- `moveSize`: "studio" | "1-bedroom" | "2-bedroom" | "3-bedroom" | "4-bedroom" | "5-bedroom+"

**UI Elements**:
- Grid layout for size options
- Clear typography hierarchy
- Selection feedback

### Step 5: Date Selection (app-move-date)
**Progress**: 28%
**Purpose**: Choose moving date
**Components**:
- Custom calendar component
- Month navigation
- Date validation

**Data Collected**:
- `moveDate`: Date object
- `isWeekend`: boolean

**UI Elements**:
- Full calendar widget
- Month/year navigation arrows
- Disabled past dates
- Weekend highlighting
- Selected date indicator

### Step 6: Time Window Selection (app-moving-window)
**Progress**: 33%
**Purpose**: Choose preferred time
**Components**:
- Time slot cards
- Morning/afternoon options

**Data Collected**:
- `timeWindow`: "morning" | "afternoon"
- `timeSlot`: "8AM-12PM" | "12PM-4PM"

**UI Elements**:
- Two time slot cards
- Time range display
- Visual time indicators

### Step 7: Address Collection (app-moving-address)
**Progress**: 44%
**Purpose**: Collect location details
**Components**:
- Address autocomplete
- Location validation

**Data Collected**:
- `address`: Complete address object
- `coordinates`: lat/lng if available

**UI Elements**:
- Address input with autocomplete
- Google Places integration
- Address validation feedback

### Step 8: Contact Information (implied)
**Progress**: 66%
**Purpose**: Collect personal details
**Components**:
- Form inputs for contact details
- Phone number formatting
- Email validation

**Data Collected**:
- `firstName`: string
- `lastName`: string
- `email`: string
- `phone`: string
- `preferredContact`: "phone" | "email"

### Step 9: Additional Services (implied)
**Progress**: 77%
**Purpose**: Upsell additional services
**Components**:
- Service add-ons checklist
- Price estimates

**Data Collected**:
- `additionalServices`: array of selected services
- `specialRequirements`: string

### Step 10: Confirmation (implied)
**Progress**: 100%
**Purpose**: Final summary and submission
**Components**:
- Summary review
- Terms acceptance
- Submit button

**Data Collected**:
- `termsAccepted`: boolean
- `newsletterOptIn`: boolean
- Final submission timestamp

## State Management Structure

### Zustand Store Schema
```javascript
{
  // Navigation state
  currentStep: 0,
  totalSteps: 10,
  canGoBack: false,
  
  // Form data
  formData: {
    serviceType: null,
    laborType: null,
    locationType: null,
    moveSize: null,
    moveDate: null,
    timeWindow: null,
    address: null,
    contact: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    additionalServices: [],
    specialRequirements: ''
  },
  
  // UI state
  isSubmitting: false,
  errors: {},
  
  // Company branding
  companyName: 'Demo Moving Co',
  companyLogo: null,
  
  // Actions
  nextStep: () => {},
  prevStep: () => {},
  updateFormData: (field, value) => {},
  submitLead: () => {},
  resetForm: () => {}
}
```

## Key Features to Implement

### 1. Progressive Disclosure
- One question per screen
- Clear progress indication
- Smooth transitions between steps

### 2. Responsive Design
- Mobile-first approach
- Touch-friendly interactions
- Proper viewport handling

### 3. Validation & Error Handling
- Real-time validation
- Error state management
- Recovery flows

### 4. Accessibility
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast support

### 5. Performance
- Lazy loading of components
- Optimized re-renders
- Minimal bundle size

### 6. Integration Features
- WordPress REST API integration
- Lead data submission
- Email notifications
- CRM integration hooks

## WordPress Integration Points

### 1. Admin Configuration
- Company branding settings
- Service type configuration
- Form field customization
- Notification settings

### 2. Lead Management
- Lead storage in WordPress database
- Admin dashboard for lead review
- Export functionality
- Lead status tracking

### 3. Customization
- Theme integration
- Custom CSS overrides
- Field visibility controls
- Conditional logic settings

## Implementation Phases

### Phase 1: Core Infrastructure
- Set up React component structure
- Implement Zustand store
- Create base UI components
- Set up step navigation

### Phase 2: Form Steps Implementation
- Build all form step components
- Implement validation logic
- Add progress tracking
- Create smooth transitions

### Phase 3: Advanced Features
- Calendar component
- Address autocomplete
- Error handling
- Loading states

### Phase 4: WordPress Integration
- REST API endpoints
- Admin interface
- Database schema
- Email notifications

### Phase 5: Polish & Testing
- Responsive design refinement
- Accessibility improvements
- Performance optimization
- Cross-browser testing

## Technical Considerations

### 1. Shadow DOM Compatibility
- Ensure all components work within shadow DOM
- Proper CSS scoping
- Event handling across shadow boundary

### 2. WordPress Integration
- Nonce handling for security
- Proper sanitization
- REST API authentication

### 3. Performance
- Code splitting by step
- Lazy loading of heavy components
- Optimized bundle size

### 4. SEO Considerations
- Progressive enhancement
- Proper meta tags
- Structured data for moving services

## Success Metrics
- Lead conversion rate
- Form abandonment rate
- Time to complete
- User satisfaction scores
- Mobile vs desktop usage

This comprehensive plan provides the foundation for recreating the Move Booker widget as a modern React application integrated with WordPress.