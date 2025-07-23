# MoovinLeads - AI-Powered Lead Capture for Moving Companies

A comprehensive WordPress plugin that captures high-quality moving leads through an intelligent 10-step qualification process. Built with modern React architecture and Atlanta's Furniture Taxi branding.

## ✨ Features

- 🎯 **10-Step Lead Qualification** - Progressive form that captures detailed moving requirements
- 🔒 **Shadow DOM Architecture** - Complete style isolation prevents WordPress theme conflicts
- 🎨 **Atlanta's Furniture Taxi Branding** - Custom golden yellow (#F4C443) theme with professional design
- ⚡ **Floating Action Button** - Unobtrusive widget that opens on-demand
- 📱 **Mobile-Optimized** - Full-width layouts optimized for all screen sizes
- 💾 **Persistent State** - Form progress saved across browser sessions
- 🚀 **Modern Tech Stack** - React 18, Vite, Tailwind CSS 4, and Zustand

## 🏗️ Lead Capture Flow

### 1. Welcome Screen
- **Full Service Moving** - Complete moving service with crew and trucks
- **Labor Only Services** - Professional help for loading/unloading customer's truck

### 2. Labor Type Selection (Conditional)
- Loading & Unloading
- Loading Only  
- Unloading Only

### 3. Move Type Selection
- Residential move (home)
- Storage facility
- Commercial space (office)

### 4. Move Size Selection
- Studio to 5+ bedroom options
- Grid layout for quick selection

### 5. Date Selection
- Interactive calendar component
- Available date validation

### 6. Time Window Selection
- Morning (8AM-12PM)
- Afternoon (12PM-4PM)

### 7. Address Collection
- **Pickup Address** - Where items are collected
- **Destination Address** - Where items are delivered
- Dual address validation

### 8. Contact Information
- Name, email, phone number
- Preferred contact method
- Real-time validation

### 9. Additional Services
- Packing services
- Moving insurance
- Furniture disassembly
- Optional multi-select

### 10. Confirmation & Submission
- Complete quote summary
- Terms and conditions
- Newsletter opt-in
- Lead submission to WordPress

## 🚀 Installation

1. **Upload Plugin**
   ```bash
   # Upload to WordPress plugins directory
   wp-content/plugins/moovinleads/
   ```

2. **Activate Plugin**
   - Go to WordPress Admin → Plugins
   - Activate "MoovinLeads"

3. **Widget Deployment**
   - Widget automatically appears on all frontend pages
   - Golden floating action button in bottom-right corner
   - Click to open lead capture flow

## 🎨 Branding & Design

### Atlanta's Furniture Taxi Theme
- **Primary Color**: Golden Yellow (#F4C443)
- **Dark Accent**: Deep Black (#1A1A1A)
- **Typography**: Clean, professional fonts
- **Layout**: Spacious, mobile-first design

### UI Components
- Full-width option cards with icons
- Smooth transitions and hover effects
- Consistent spacing and typography
- Accessibility-focused design

## 🔧 Technical Architecture

### Frontend Stack
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build system with HMR
- **Tailwind CSS 4** - Utility-first styling with custom theme
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icon system
- **Shadow DOM** - Complete style isolation

### WordPress Integration
- **Custom Web Component** - `<moovinleads-widget>`
- **PHP Plugin Class** - Singleton pattern with proper hooks
- **REST API Endpoints** - Lead submission and data management
- **Database Integration** - WordPress options and custom tables
- **Security** - Nonce verification and data sanitization

### State Management
```javascript
// Persistent form state with Zustand
const useLeadStore = create(
  persist((set, get) => ({
    currentStep: 0,
    isWidgetOpen: false,
    formData: {
      serviceType: null,
      addresses: { pickup: '', destination: '' },
      contact: { firstName: '', lastName: '', email: '', phone: '' },
      // ... additional fields
    },
    // Actions for navigation and data updates
  }))
);
```

### Build Configuration
```bash
# Development commands
npm run dev         # Hot reload development
npm run build       # Production build with testing
npm run build:css   # Tailwind CSS compilation
npm run build:watch # Build and watch for changes

# Output files
dist/js/moovinleads.js    # React bundle (1.07MB)
dist/css/main.css         # Tailwind CSS (24KB)
```

## 📊 Lead Data Structure

### Captured Information
```javascript
{
  serviceType: 'full-service' | 'labor-only',
  laborType: 'loading-unloading' | 'loading-only' | 'unloading-only',
  locationType: 'home' | 'storage' | 'office',
  moveSize: 'studio' | '1-bedroom' | '2-bedroom' | '3-bedroom' | '4-bedroom' | '5-bedroom+',
  moveDate: '2024-MM-DD',
  timeWindow: 'morning' | 'afternoon',
  addresses: {
    pickup: 'Full address string',
    destination: 'Full address string'
  },
  contact: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    preferredContact: 'phone' | 'email'
  },
  additionalServices: [
    { id: 'packing', name: 'Packing Services' },
    { id: 'insurance', name: 'Moving Insurance' }
  ],
  termsAccepted: true,
  newsletterOptIn: false,
  timestamp: '2024-01-01T12:00:00Z',
  source: 'moovinleads-widget'
}
```

### WordPress Integration
- Leads stored in custom database table
- Integration with WordPress users and roles
- REST API endpoints for lead management
- Admin dashboard for lead review

## 🎯 Business Benefits

### Lead Quality
- **Pre-qualified Prospects** - 10-step process filters serious inquiries
- **Complete Information** - All details needed for accurate quotes
- **Contact Preferences** - Optimized follow-up communication
- **Service Matching** - Proper crew and equipment allocation

### User Experience
- **Progressive Disclosure** - Information requested when relevant
- **Mobile Optimized** - Works perfectly on all devices
- **Fast Loading** - Optimized build size and performance
- **Professional Design** - Builds trust and credibility

### Technical Advantages
- **WordPress Native** - Seamless integration with existing sites
- **Style Isolation** - Never conflicts with theme styling
- **SEO Friendly** - Does not impact page load or rankings
- **Developer Friendly** - Clean, maintainable codebase

## 🛠️ Customization

### Branding Updates
```css
/* Update theme colors in src/styles/main.css */
@theme inline {
  --color-primary: #YOUR_COLOR;
  --color-primary-foreground: #CONTRAST_COLOR;
  --color-brand-dark: #DARK_COLOR;
}
```

### Form Flow Modifications
- Add/remove steps in `src/components/LeadCaptureWidget/index.jsx`
- Update validation in `src/storage/leadStore.js`
- Modify step components in `src/components/LeadCaptureWidget/steps/`

### Lead Processing
- Custom API endpoints in `includes/api/`
- Integration with CRM systems
- Email notifications and autoresponders
- Lead scoring and qualification

## 📱 Mobile Experience

### Responsive Design
- Touch-friendly interface
- Optimized text sizes
- Full-width layouts prevent cramped content
- Swipe gestures for navigation

### Performance
- Lazy loading for optimal mobile performance
- Minimal bundle size
- Efficient state management
- Progressive enhancement

## 🔒 Security & Privacy

### Data Protection
- WordPress nonce verification
- Input sanitization and validation
- No sensitive data in localStorage
- GDPR-compliant data handling

### Security Features
- XSS protection through React
- SQL injection prevention
- Proper capability checks
- Secure API endpoints

## 📈 Analytics & Tracking

### Built-in Metrics
- Form completion rates by step
- Drop-off analysis
- Conversion tracking
- Lead quality scoring

### Integration Ready
- Google Analytics events
- Facebook Pixel tracking
- Custom analytics platforms
- A/B testing support

## 🤝 Support & Development

### File Structure
```
moovinleads/
├── src/                           # React source code
│   ├── components/LeadCaptureWidget/   # Main widget components
│   ├── storage/leadStore.js            # State management
│   └── styles/main.css                 # Tailwind CSS with branding
├── includes/                      # WordPress backend
│   └── api/                       # REST API controllers
├── dist/                          # Built assets
├── moovinleads.php               # Main plugin file
└── README.md                     # This file
```

### Development Workflow
1. **Setup** - `npm install` to install dependencies
2. **Development** - `npm run dev` for hot reload
3. **Build** - `npm run build` for production
4. **Test** - Activate plugin and test lead flow
5. **Deploy** - Upload to WordPress plugins directory

## 🎉 Getting Started

1. **Clone Repository**
   ```bash
   git clone git@github.com:DanielRSnell/moovinleads.git
   cd moovinleads
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build Plugin**
   ```bash
   npm run build
   ```

4. **Upload to WordPress**
   - Copy entire folder to `wp-content/plugins/`
   - Activate in WordPress admin
   - Widget appears automatically on frontend

## 📄 License

GPL v2 or later - WordPress compatible licensing

---

**🚀 Ready to capture high-quality moving leads?**

MoovinLeads transforms your website into a lead generation machine with a professional, mobile-optimized experience that qualifies prospects and maximizes conversion rates.