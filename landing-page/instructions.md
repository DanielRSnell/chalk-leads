# Atlanta's Furniture Taxi Landing Page

A standalone WordPress landing page built with SCSS and component-based architecture, featuring Atlanta's Furniture Taxi branding.

## Build System

### SCSS Compilation
```bash
# Watch and build SCSS in development
npm run build:landing

# Build SCSS once for production
npm run build:landing-once
```

### File Structure
```
landing-page/
├── index.php              # Main landing page (no wp_head/wp_footer)
├── styles/
│   └── main.scss          # Global styles with Atlanta branding
├── home/
│   ├── page.scss          # Imports all component SCSS files
│   ├── hero/
│   │   ├── index.html     # Hero component HTML
│   │   └── index.scss     # Hero component styles
│   ├── navigation/
│   │   └── index.scss     # Navigation styles
│   ├── services/
│   │   └── index.scss     # Services styles
│   └── [other components]/
└── dist/
    └── main.css           # Compiled CSS output (imports page.scss)
```

## Component Architecture

Components use `[data-component="component-name"]` for CSS scoping instead of ID selectors.

### Available Components
- `[data-component="hero"]` - Main hero section with CTA
- `[data-component="hero-services"]` - Service cards below hero
- `[data-component="contact"]` - Contact form with MoovinLeads widget
- `[data-component="contact-info"]` - Contact information footer

## Atlanta Branding

### Colors
- Primary: `#EDB72A` (Atlanta brand yellow)
- Secondary: `#000000` (Atlanta brand black)
- Accent: `#F4C443` (Lighter yellow from existing MoovinLeads brand)

### Typography
- Font Family: 'Manrope' (preloaded from Google Fonts)

## Content Focus

- **Hero Message**: "Trusted Atlanta Moving & Storage with Southern Hospitality"
- **Services**: Local Moving, Long Distance, Storage & Packing
- **Service Areas**: Atlanta Metro, Chamblee, Roswell, Alpharetta, Dunwoody, Marietta, Buckhead
- **Contact**: 404-228-7404

## Integration

The landing page integrates with the main MoovinLeads plugin through:
- Widget rendering in the contact section
- Shared branding colors and design system
- Schema.org structured data for SEO

## WordPress Integration

### Home Page Replacement
- The plugin automatically replaces the WordPress home page when enabled
- Controlled via Admin → Tools → MoovinLeads settings
- Uses `template_redirect` hook to intercept home page requests
- Bypasses theme templates entirely for clean standalone page

### render_partial System
```php
// Helper functions in helpers.php
render_partial('home/hero/index.html'); // Renders hero section
render_partial('partials/contact-section.php'); // Renders contact form
render_partial('partials/contact-info.php'); // Renders contact info

// Automatic asset management
enqueue_landing_styles(); // Handles CSS with cache busting
get_moovinleads_widget(); // Integrates main plugin widget
get_structured_data(); // Generates SEO schema
```

### File Structure
```
landing-page/
├── index.php              # Main template (loaded on home page)
├── helpers.php             # Helper functions for rendering
├── partials/               # Reusable partial templates
│   ├── contact-section.php # Contact form section
│   └── contact-info.php    # Contact information footer
├── home/hero/              # Hero component
├── styles/main.scss        # SCSS source
└── dist/main.css          # Compiled CSS
```

## Adding New Partials

Follow these steps when adding new components/partials to the landing page:

### Step 1: Create the Partial File
```bash
# Create new partial in partials/ directory
touch landing-page/partials/new-section.php
```

### Step 2: Add HTML Structure
```php
<!-- landing-page/partials/new-section.php -->
<section data-component="new-section">
    <div class="cs-container">
        <h2 class="cs-title">Section Title</h2>
        <p class="cs-text">Section content goes here.</p>
    </div>
</section>
```

### Step 3: Add Component Styles
```scss
// Create new component SCSS file: landing-page/home/new-section/index.scss
[data-component="new-section"] {
    padding: var(--sectionPadding);
    background: #fff;
    
    .cs-container {
        max-width: calc(1080 / 16 * 1rem);
        margin: 0 auto;
        text-align: center;
    }
    
    // Add responsive styles as needed
    @media (min-width: 768px) {
        padding: calc(80 / 16 * 1rem) calc(16 / 16 * 1rem);
    }
}
```

```scss
// Then add import to landing-page/home/page.scss
@import "new-section/index.scss";
```

### Step 4: Include in Main Template
```php
// Add to landing-page/index.php in desired order
<?php render_partial('partials/new-section.php'); ?>
```

### Step 5: Build and Test
```bash
# Compile SCSS to CSS
npm run build:landing-once

# Or watch for changes during development
npm run build:landing
```

### Step 6: Optional - Pass Data to Partial
```php
// Pass data to partial
<?php render_partial('partials/new-section.php', [
    'title' => 'Custom Title',
    'items' => $some_data_array
]); ?>
```

```php
<!-- In the partial file, data is available as variables -->
<section data-component="new-section">
    <div class="cs-container">
        <h2 class="cs-title"><?php echo esc_html($title ?? 'Default Title'); ?></h2>
        <?php if (!empty($items)): ?>
            <ul>
                <?php foreach ($items as $item): ?>
                    <li><?php echo esc_html($item); ?></li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>
    </div>
</section>
```

## Component Development Guidelines

### Naming Conventions
- **Partial files**: `kebab-case.php` (e.g., `contact-form.php`, `service-grid.php`)
- **Data attributes**: `[data-component="kebab-case"]` (e.g., `data-component="contact-form"`)
- **CSS classes**: Use existing `.cs-*` classes or create new ones following the pattern

### CSS Structure
```scss
// Component-specific styles
[data-component="component-name"] {
    // Base styles
    
    // Child elements
    .cs-container {
        // Container styles
    }
    
    .cs-title {
        // Title overrides if needed
    }
    
    // Responsive design
    @media (min-width: 768px) {
        // Tablet styles
    }
    
    @media (min-width: 1024px) {
        // Desktop styles
    }
}
```

### Data Passing Best Practices
- Always use `esc_html()`, `esc_attr()`, or `esc_url()` for output
- Provide default values with null coalescing: `$title ?? 'Default'`
- Check for data existence before loops: `if (!empty($items))`
- Use descriptive variable names in the data array

### File Organization
```
landing-page/
├── partials/                   # PHP template partials
│   ├── navigation.php          # Header navigation
│   ├── services.php            # Service listings  
│   ├── testimonials.php        # Customer reviews
│   └── footer.php              # Footer content
├── home/                       # Component SCSS organization
│   ├── page.scss               # Master component importer
│   ├── navigation/
│   │   └── index.scss          # Navigation styles
│   ├── hero/
│   │   ├── index.html          # Hero HTML template
│   │   └── index.scss          # Hero styles
│   └── [other-components]/
└── styles/
    └── main.scss               # Global styles + imports page.scss
```

## Testing New Partials

### Development Workflow
1. **Create partial** with basic HTML structure
2. **Add to index.php** temporarily at top for quick testing
3. **Build CSS** with `npm run build:landing-once`
4. **Test in browser** - visit home page with landing page enabled
5. **Refine styles** and rebuild as needed
6. **Move to final position** in index.php
7. **Test responsive design** on mobile/tablet/desktop

### Debugging Tips
- Use `WP_DEBUG` to see PHP errors in partial files
- Check browser console for CSS issues
- Use `<!-- Partial loaded: section-name -->` comments for debugging
- Verify data passed to partials with `var_dump()` during development

## Usage

1. **Enable the landing page** in WordPress Admin → Tools → MoovinLeads
2. **Build CSS** with `npm run build:landing-once` 
3. **Visit home page** to see the Atlanta's Furniture Taxi landing page
4. **Disable in admin** to return to normal WordPress theme