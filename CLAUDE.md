# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoovinLeads is an AI-powered lead capture WordPress plugin specifically designed for moving companies. It features a comprehensive 17-step lead qualification process that captures detailed moving requirements through an intelligent form system. The plugin uses modern React Shadow DOM architecture with custom branding for Atlanta's Furniture Taxi.

## Key Architecture

### React to Web Component System
- **Entry Point**: `src/main.jsx` - Custom HTMLElement class `MoovinLeadsElement` that creates shadow DOM and renders React
- **Main Component**: `src/ShadowApp.jsx` - Root React component that receives server-side props and injects CSS
- **Lead Widget**: `src/components/LeadCaptureWidget/index.jsx` - Main lead capture form with 17-step qualification process
- **Design System**: `src/styles/main.css` - Tailwind CSS 4 with custom golden yellow (#F4C443) branding for Atlanta's Furniture Taxi
- **Web Component**: Registered as `<moovinleads-widget>` custom element

### Server-Side Integration
- **WordPress Plugin**: `moovinleads.php` - Singleton plugin class with hooks, REST API, lead database, and CSS injection
- **Props System**: Server data passed via base64-encoded attributes (non-escaped to prevent CSS corruption)
- **CSS Injection**: Tailwind CSS served server-side and injected into shadow DOM via `<style>` tags
- **REST API**: WordPress REST endpoints at `/wp-json/moovinleads/v1/` including lead submissions and Mapbox integration
- **Database**: Custom table `wp_moovinleads_leads` for storing captured leads with email notifications

## Development Commands

### Main Plugin Development
```bash
# Development with hot reload
npm run dev

# Production build with automatic testing (outputs to dist/js/shadow-plugin.js and dist/css/main.css)
npm run build

# Build only Tailwind CSS (outputs to dist/css/main.css)
npm run build:css

# Build and watch for changes
npm run build:watch

# Preview production build
npm run preview

# Testing commands
npm run test              # Run all tests via run-all-tests.js
npm run test:chain        # Post-build test chain
npm run test:build        # Build validation only
npm run test:components   # Component tests only  
npm run test:integration  # Integration tests only
npm run test:quick        # Quick testing via quick-test.js
npm run test:debug        # Debug widget functionality
```

### Landing Page Development
```bash
# Build landing page CSS once (outputs to landing-page/dist/main.css)
npm run build:landing-once

# Build landing page CSS with watch mode
npm run build:landing
```

## Build Configuration

- **Vite**: Dual configuration - main build for JS (IIFE format) and CSS-only build via `vite.config.css.js`
- **CSS Build**: Tailwind CSS 4 with `@tailwindcss/vite` plugin, uses `@source` directives to scan JSX files
- **Output**: `dist/js/shadow-plugin.js` (1.4MB) and `dist/css/main.css` (30KB+ with ShadCN design system)
- **React**: Uses React 18, renders directly into `shadowRoot` for proper isolation
- **Bundling**: All dependencies bundled, no external dependencies required

## Key Libraries and Dependencies

### UI Framework
- **React 18**: Core framework with hooks and concurrent features
- **Radix UI**: Headless UI components (Dialog, Tabs, Switch, Label, Dropdown Menu)
- **Framer Motion**: Animation library for smooth transitions
- **Tailwind CSS 4**: Utility-first CSS with custom Atlanta's Furniture Taxi branding (#F4C443)
- **Zustand**: Lightweight state management with localStorage persistence for form data
- **Lucide React**: Icon system for UI elements
- **Mapbox Search React**: Address autocomplete and route calculation

### WordPress Integration
- **Custom Web Component**: Hand-coded HTMLElement class (no @r2wc dependency)
- **Shadow DOM**: Complete style isolation with server-side CSS injection
- **Base64 CSS Transport**: CSS encoded and passed via attributes to prevent escaping issues
- **Mapbox Integration**: Server-side API proxy for secure address validation and route calculations

## Code Patterns

### WordPress Data to React Props
```php
// In PHP - pass data via attributes (CSS uses json_encode, not esc_attr)
<moovinleads-widget 
    user-role="<?php echo esc_attr($user_role); ?>"
    site-url="<?php echo esc_attr(home_url()); ?>"
    settings='<?php echo esc_attr(json_encode($settings)); ?>'
    api-nonce="<?php echo esc_attr(wp_create_nonce('moovinleads_nonce')); ?>"
    tailwind-css="<?php echo base64_encode($tailwind_css); ?>"
></moovinleads-widget>
```

```jsx
// In React - props parsed from attributes in render() method
export function ShadowApp(props = {}) {
  const { userRole, siteUrl, settings, tailwindCSS } = props;
  const decodedCSS = tailwindCSS ? atob(tailwindCSS) : '';
  
  return (
    <>
      {decodedCSS && <style dangerouslySetInnerHTML={{ __html: decodedCSS }} />}
      <Panel />
    </>
  );
}
```

### Tailwind CSS 4 with Atlanta's Furniture Taxi Branding
```css
// src/styles/main.css - Tailwind 4 configuration with custom branding
@import "tailwindcss";
@source "../**/*.jsx";
@source "../**/*.js";

@theme inline {
  --color-primary: #F4C443; /* Atlanta's Furniture Taxi golden yellow */
  --color-primary-foreground: #1A1A1A; /* Dark text on golden background */
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(15% 0.007 285.82);
  --color-muted: oklch(96% 0.006 285.82);
  --color-border: oklch(90% 0.006 285.82);
  --radius: 0.5rem;
}
```

```jsx
// Components use branded design tokens
<button className="bg-primary text-primary-foreground border border-border hover:bg-primary/90">
  Get Your Quote
</button>
```

### Critical CSS Escaping Rules
```php
// CORRECT: Use json_encode for base64 CSS in JavaScript
panel.setAttribute('tailwind-css', <?php echo json_encode(base64_encode($tailwind_css)); ?>);

// CORRECT: Use raw base64 for HTML attributes  
tailwind-css="<?php echo base64_encode($tailwind_css); ?>"

// WRONG: esc_js() or esc_attr() will corrupt the base64 CSS
```

### Lead State Management with Zustand
```jsx
// Import lead store
import { useLeadStore } from './storage/leadStore';

// Use in lead capture components
function StepComponent() {
  const { 
    currentStep, 
    formData, 
    nextStep, 
    previousStep,
    updateFormData,
    isWidgetOpen,
    toggleWidget,
    companyName,
    currentEstimate
  } = useLeadStore();
  
  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Step {currentStep + 1} of 17
      </h2>
      <button 
        onClick={() => updateFormData({ serviceType: 'full-service' })}
        className="w-full p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
      >
        Full Service Moving
      </button>
    </div>
  );
}
```

### Lead Capture Component Architecture
```jsx
// Main lead capture widget with step management
import { LeadCaptureWidget } from './components/LeadCaptureWidget/index.jsx';
import { StepRenderer } from './components/LeadCaptureWidget/StepRenderer.jsx';
import { Navigation } from './components/LeadCaptureWidget/Navigation.jsx';
import { ProgressBar } from './components/LeadCaptureWidget/ProgressBar.jsx';

// Individual step components
import { ContactInfo } from './components/LeadCaptureWidget/steps/ContactInfo.jsx';
import { AddressCollection } from './components/LeadCaptureWidget/steps/AddressCollection.jsx';
import { ReviewDetails } from './components/LeadCaptureWidget/steps/ReviewDetails.jsx';
import { VoiceflowScreen } from './components/LeadCaptureWidget/steps/VoiceflowScreen.jsx';
```

## File Structure

### Main Plugin Structure
```
src/
├── main.jsx              # Custom HTMLElement web component with shadow DOM
├── ShadowApp.jsx         # Main app component with CSS injection
├── components/
│   └── LeadCaptureWidget/     # Main lead capture system
│       ├── index.jsx          # Main widget component with 17-step flow
│       ├── StepRenderer.jsx   # Data-driven step renderer
│       ├── Navigation.jsx     # Close/minimize controls
│       ├── ProgressBar.jsx    # Step progress indicator
│       ├── StepNavigation.jsx # Next/Previous buttons
│       ├── steps/             # Individual step components
│       │   ├── ContactInfo.jsx        # Contact information collection
│       │   ├── AddressCollection.jsx  # Pickup/destination addresses
│       │   ├── ReviewDetails.jsx      # Final review with pricing
│       │   ├── VoiceflowScreen.jsx   # AI chat integration
│       │   └── [12 more steps]       # Welcome, labor type, move size, etc.
│       └── ui/                # Reusable UI components
│           ├── MapboxAutofill.jsx     # Address autocomplete
│           └── RouteCalculation.jsx   # Distance/route display
├── storage/
│   └── leadStore.js      # Zustand lead state management with persistence
├── data/
│   ├── index.js          # Step configuration and validation
│   ├── steps/            # JSON step definitions (welcome, labor-type, etc.)  
│   └── pricing/          # Moving estimate calculations
│       ├── calculator.js # Core pricing logic
│       └── base-rates.json # Base rate structure
└── styles/
    └── main.css          # Tailwind 4 with Atlanta's Furniture Taxi branding

includes/
└── api/
    ├── class-tailwind-controller.php  # WordPress API controller for CSS
    └── class-mapbox-controller.php    # Secure Mapbox API proxy

tests/                    # Comprehensive test suite  
├── build-validation.js  # Build artifacts validation
├── component-tests.js   # React component architecture tests
├── integration-tests.js # WordPress integration tests
├── run-all-tests.js     # Master test runner
├── post-build-test-chain.js # Post-build testing
├── quick-test.js        # Quick validation
└── debug-widget.js      # Widget debugging

dist/
├── js/
│   └── shadow-plugin.js  # Compiled React bundle (1.07MB)
└── css/
    └── main.css          # Compiled Tailwind CSS (24KB)

moovinleads.php          # WordPress plugin file (singleton class)
vite.config.js           # Main Vite configuration (IIFE format)
build-css.js             # Tailwind CSS build script using Vite + @tailwindcss/vite
package.json             # Dependencies and scripts
```

### Landing Page Structure
```
landing-page/
├── index.php            # Main landing page template with WordPress integration
├── helpers.php          # Asset URL helpers and utility functions
├── seo.md              # SEO metadata and optimization guidelines
├── assets/             # Static assets organized by type
│   ├── awards/         # Business credentials and certifications
│   ├── backgrounds/    # Hero and section background images
│   ├── icons/          # Comprehensive Remix Icons library (SVG)
│   ├── logos/          # Atlanta's Furniture Taxi branding assets
│   ├── service-icons/  # Service-specific imagery
│   └── team-photos/    # Professional team and company photos
├── partials/           # Reusable PHP template components
│   ├── navigation.php  # Header navigation with logo and menu
│   ├── services.php    # Services overview section
│   ├── call-to-action.php # CTA section with trust indicators
│   ├── testimonials.php   # Customer reviews and ratings
│   ├── faq.php         # FAQ section with newsletter signup
│   └── footer.php      # Footer with links and contact info
├── home/              # Section-specific SCSS and templates
│   ├── hero/          # Hero section with background and services
│   ├── services/      # Services section with icons and descriptions
│   ├── testimonials/  # Testimonials carousel styling
│   ├── faq/          # FAQ section with background image overlay
│   └── navigation/   # Header navigation responsive styles
├── styles/
│   └── main.scss      # Main SCSS entry point importing all sections
└── dist/
    └── main.css       # Compiled CSS output for production
```

## Development Notes

### Lead Management State
- **Lead Store**: Main form state with localStorage persistence across steps
- **Form Data**: Complete lead information collected through 17-step process
- **Pricing State**: Real-time moving estimates and pricing breakdowns
- **Navigation State**: Current step tracking, progress, and validation

### Component Architecture  
- **Data-Driven Steps**: JSON-defined step configuration for easy modification
- **Mixed Architecture**: Blend of data-driven (StepRenderer) and legacy components
- **Step Management**: Automatic progression with validation and error handling
- **Floating Widget**: Fixed positioning with responsive mobile-first design
- **Branded Design**: Atlanta's Furniture Taxi golden yellow (#F4C443) theme

### Shadow DOM Isolation
- **Complete Isolation**: All styles scoped to Shadow DOM using `:host` selector  
- **Server-Side CSS**: CSS built server-side and injected via `<style>` tags
- **No WordPress Conflicts**: Zero interference with WordPress themes
- **Base64 Transport**: CSS safely encoded to prevent PHP escaping corruption

### Plugin Architecture
- Singleton pattern for main MoovinLeads plugin class
- Custom database table `wp_moovinleads_leads` for lead storage
- Secure REST API endpoints with nonce verification
- Email notifications for new lead submissions
- Mapbox integration for address validation and route calculations

### Integration Points
- Automatic frontend widget injection on all pages
- Admin settings page at Tools → MoovinLeads
- Floating action button trigger in bottom-right corner
- Voiceflow AI chat integration in final step
- Lead data persistence with form recovery

### Testing & Quality Assurance
- **Comprehensive Test Suite**: 53+ automated tests covering all aspects
- **Build Validation**: File existence, sizes, content validation
- **Component Testing**: React structure, store integration, accessibility
- **Integration Testing**: WordPress compatibility, API endpoints, data flow
- **Automatic Testing**: Runs after every build to ensure quality
- **CI/CD Ready**: Exit codes for integration with deployment pipelines

## Testing the Plugin

1. Build the assets: `npm run build`
2. Activate the WordPress plugin in admin
3. Visit any frontend page - floating action button appears in bottom-right
4. Click to open the 17-step lead capture flow showing:
   - **Service Type Selection**: Full service vs labor-only moving
   - **Move Details**: Size, type, date, and time preferences
   - **Address Collection**: Mapbox-powered address validation
   - **Route Calculation**: Automatic distance and travel time calculation
   - **Pricing Engine**: Real-time moving estimates based on selections
   - **Contact Information**: Name, email, phone with validation
   - **Final Review**: Complete quote summary with pricing breakdown
   - **Voiceflow Integration**: AI chat for additional questions

## Common Tasks

### Adding New Lead Capture Steps
1. Create JSON step definition in `src/data/steps/new-step.json`
2. Add step ID to `STEP_ORDER` array in `src/data/index.js`
3. For complex steps, create component in `src/components/LeadCaptureWidget/steps/`
4. Add validation rules in step JSON or create custom validation
5. Update form data structure in `leadStore.js` if needed
6. Test step progression and data persistence

### Modifying Pricing Calculations
1. Update base rates in `src/data/pricing/base-rates.json`
2. Modify calculation logic in `src/data/pricing/calculator.js`
3. Test pricing accuracy across different service types and sizes
4. Ensure pricing displays correctly in `ReviewDetails.jsx`

### Customizing Branding
1. Update colors in `src/styles/main.css` `@theme` section
2. Modify company name in `leadStore.js` (companyName property)
3. Replace truck icon and styling in header component
4. Adjust golden yellow (#F4C443) brand color as needed

### Extending REST API for Leads
1. Add new routes in `moovinleads.php` `initRestApi()` method
2. Implement callback functions with proper nonce verification
3. Add database fields to lead table creation in `createTables()`
4. Update lead submission in `apiSubmitLead()` method

### Mapbox Integration
1. Configure API keys in `includes/api/class-mapbox-controller.php`
2. Extend address validation in `get_address_suggestions()`
3. Modify route calculation in `get_route_directions()`
4. Update MapboxAutofill component for UI changes

### Landing Page Architecture
- **Dual Build System**: Main plugin uses Vite, landing page uses Sass for CSS compilation
- **Component-Based SCSS**: Each section has its own SCSS file with data-component attributes
- **Asset Organization**: Local SVG icons with `get_raw_svg()` helper, organized by category
- **WordPress Integration**: Uses plugin helpers while maintaining standalone functionality
- **Responsive Design**: Mobile-first approach with breakpoint-specific styling
- **MoovinLeads Integration**: Landing page can trigger main plugin widget via JavaScript

### Critical Development Rules
1. **Never use esc_attr() or esc_js() on base64 CSS** - it will corrupt the CSS
2. **Use json_encode() for JavaScript attributes** and raw base64 for HTML attributes  
3. **CSS uses `@source` directives** to scan JSX files for Tailwind classes
4. **Lead data must be persistent** - always use localStorage for form recovery
5. **Mapbox API keys are server-side only** - never expose in frontend code
6. **Step validation is required** - prevent progression with incomplete data
7. **Landing page CSS build**: Use `npm run build:landing-once` not `npm run build:css`
8. **SVG icons**: Use `get_raw_svg()` helper function for local icon rendering

## Lead Capture Flow (17 Steps)

The complete lead qualification process includes:

1. **Welcome** - Service type: Full service vs labor-only
2. **Labor Type** - Loading/unloading options (conditional)  
3. **Move Type** - Residential, storage, or commercial
4. **Move Size** - Studio to 5+ bedroom selection
5. **Date Selection** - Interactive calendar
6. **Time Selection** - Morning or afternoon window
7. **Pickup Location** - Address with Mapbox autocomplete
8. **Pickup Challenges** - Access difficulties (stairs, elevator, etc.)
9. **Destination Location** - Delivery address validation
10. **Destination Challenges** - Delivery access assessment
11. **Route Distance** - Automatic mileage calculation
12. **Additional Services** - Packing, insurance, supplies
13. **Moving Supplies Question** - Customer vs company provides
14. **Moving Supplies Selection** - Specific supply needs
15. **Contact Info** - Name, email, phone validation
16. **Review Details** - Complete quote with pricing
17. **Voiceflow Screen** - AI chat for questions

## Database Schema

```sql
CREATE TABLE wp_moovinleads_leads (
  id mediumint(9) NOT NULL AUTO_INCREMENT,
  lead_data longtext NOT NULL,
  email varchar(100) NOT NULL,
  phone varchar(20),
  service_type varchar(50),
  status varchar(20) DEFAULT 'new',
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY email (email),
  KEY service_type (service_type),
  KEY status (status)
);
```