# Tailwind CSS 4 Theming & Source Detection Memory

## Overview
This memory captures the complete understanding of Tailwind CSS 4's theming system using the `@theme` directive and source file detection mechanisms, as implemented in our WordPress React Shadow DOM boilerplate.

## @theme Directive Fundamentals

### Core Concept
The `@theme` directive in Tailwind CSS 4 allows defining custom CSS variables that automatically generate corresponding utility classes. This is a revolutionary approach that makes theming more intuitive and powerful.

### Syntax Structure
```css
@theme {
  --color-primary: oklch(47.31% 0.099 264.05);
  --color-background: oklch(100% 0 0);
  --radius: 0.5rem;
  --spacing: 0.25rem;
}
```

### Our Implementation (src/styles/main.css)
```css
@import "tailwindcss";
@source "../**/*.jsx";
@source "../**/*.js";

@theme inline {
  /* ShadCN Color System with OKLCH */
  --color-background: oklch(100% 0 0);              /* Pure white */
  --color-foreground: oklch(15% 0.007 285.82);      /* Dark text */
  --color-card: oklch(100% 0 0);                    /* Card background */
  --color-card-foreground: oklch(15% 0.007 285.82); /* Card text */
  --color-popover: oklch(100% 0 0);                 /* Popover background */
  --color-popover-foreground: oklch(15% 0.007 285.82); /* Popover text */
  --color-primary: oklch(47.31% 0.099 264.05);      /* Blue primary */
  --color-primary-foreground: oklch(98% 0.004 285.82); /* Primary text */
  --color-secondary: oklch(96% 0.006 285.82);       /* Light gray */
  --color-secondary-foreground: oklch(15% 0.007 285.82); /* Secondary text */
  --color-muted: oklch(96% 0.006 285.82);           /* Muted background */
  --color-muted-foreground: oklch(52% 0.015 285.82); /* Muted text */
  --color-accent: oklch(96% 0.006 285.82);          /* Accent background */
  --color-accent-foreground: oklch(15% 0.007 285.82); /* Accent text */
  --color-destructive: oklch(62.8% 0.257 29.23);    /* Red destructive */
  --color-destructive-foreground: oklch(98% 0.004 285.82); /* Destructive text */
  --color-border: oklch(90% 0.006 285.82);          /* Border color */
  --color-input: oklch(90% 0.006 285.82);           /* Input border */
  --color-ring: oklch(47.31% 0.099 264.05);         /* Focus ring */
  
  --radius: 0.5rem;                                 /* Global border radius */
}
```

## Source File Detection

### @source Directive
Explicitly tells Tailwind which files to scan for class names:
```css
@source "../**/*.jsx";    /* Scan all JSX files */
@source "../**/*.js";     /* Scan all JS files */
```

### Detection Mechanism
1. **Plain Text Scanning**: Treats files as raw text, not structured code
2. **Token Identification**: Looks for patterns that match utility class names
3. **Static Analysis**: Cannot understand dynamic class construction
4. **Class Generation**: Generates CSS only for detected classes

### Limitations & Best Practices

#### ❌ Avoid Dynamic Construction
```jsx
// BAD - Tailwind can't detect these
const colorClass = `bg-${color}-500`;
const sizeClass = `w-${width}`;
```

#### ✅ Use Static Mapping
```jsx
// GOOD - Tailwind can detect these complete class names
const colorVariants = {
  blue: "bg-blue-500 hover:bg-blue-600 text-white",
  red: "bg-red-500 hover:bg-red-600 text-white",
  green: "bg-green-500 hover:bg-green-600 text-white"
};

function Button({ variant }) {
  return (
    <button className={colorVariants[variant]}>
      Click me
    </button>
  );
}
```

## Color System: OKLCH vs Traditional

### Why OKLCH?
- **Perceptually Uniform**: Equal distance changes produce equal visual differences
- **Future-Proof**: Wide gamut color space support
- **Precise Control**: Lightness, chroma, and hue as separate values
- **Better Interpolation**: Smooth color transitions

### OKLCH Syntax
```css
oklch(lightness chroma hue)
/* lightness: 0-100% */
/* chroma: 0-0.4 (typically) */
/* hue: 0-360 degrees */
```

### Our ShadCN Color Mapping
```css
/* Traditional hex would be: #3f5a93 */
--color-primary: oklch(47.31% 0.099 264.05);

/* Traditional hex would be: #f8f8fb */
--color-primary-foreground: oklch(98% 0.004 285.82);
```

## Generated Output Analysis

Our 30KB+ compiled CSS includes:

### 1. Utility Class Generation
```css
.bg-primary { background-color: #3f5a93; }
.text-primary { color: #3f5a93; }
.border-primary { border-color: #3f5a93; }
```

### 2. Semantic Token Classes
```css
.bg-background { background-color: #fff; }
.text-foreground { color: #0b0b0e; }
.bg-muted { background-color: #f1f1f6; }
.text-muted-foreground { color: #686871; }
```

### 3. Hover/Focus Variants
```css
.hover\\:bg-primary\\/90:hover { background-color: #3f5a93e6; }
.focus\\:ring-ring:focus { --tw-ring-color: oklch(47.31% .099 264.05); }
```

## Integration with Shadow DOM

### CSS Transport Method
1. **Build Process**: Vite compiles CSS using @tailwindcss/vite plugin
2. **Server-Side**: PHP reads compiled CSS and base64 encodes it
3. **Transport**: CSS passed as HTML attribute to web component
4. **Injection**: React component injects CSS into Shadow DOM

### Shadow DOM Compatibility
```css
:root, :host {
  /* Theme variables work in both document and shadow contexts */
  --color-primary: oklch(47.31% 0.099 264.05);
}
```

## WordPress Integration Pattern

### 1. Build Configuration (vite.config.js)
```js
import tailwindcss from '@tailwindcss/vite';

export const cssConfig = defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist/css',
    lib: {
      entry: 'src/styles/main.css',
      formats: ['es']
    }
  }
});
```

### 2. Server-Side Processing (shadow-plugin.php)
```php
private function getTailwindCSS() {
    $css_file = PLUGIN_BOILERPLATE_DIR . 'dist/css/main.css';
    $css_content = file_get_contents($css_file);
    
    // CSS is already Shadow DOM compatible with :host rules
    return $css_content;
}
```

### 3. CSS Injection (ShadowApp.jsx)
```jsx
useEffect(() => {
  if (tailwindCss && shadowRoot) {
    const existingStyle = shadowRoot.querySelector('style[data-source="tailwind"]');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.setAttribute('data-source', 'tailwind');
      style.textContent = atob(tailwindCss); // Decode base64
      shadowRoot.insertBefore(style, shadowRoot.firstChild);
    }
  }
}, [tailwindCss, shadowRoot]);
```

## Performance Considerations

### File Size Optimization
- **Current Output**: ~30KB compressed CSS
- **Tree Shaking**: Only classes detected in source files are included
- **Caching**: CSS is cached server-side and client-side
- **Base64 Transport**: Efficient for shadow DOM injection

### Detection Optimization
- **Explicit @source**: Limits scanning to relevant files
- **Static Class Names**: Ensures reliable detection
- **Component Mapping**: Centralizes variant management

## Development Workflow

### 1. Theme Customization
```css
/* Add new semantic tokens */
@theme inline {
  --color-brand: oklch(65% 0.15 220);
  --color-brand-foreground: oklch(98% 0.001 220);
}
```

### 2. Component Usage
```jsx
<button className="bg-brand text-brand-foreground hover:bg-brand/90">
  Brand Button
</button>
```

### 3. Build Process
```bash
npm run build:css  # Compiles Tailwind with new tokens
npm run build      # Builds React and runs tests
```

## Troubleshooting Common Issues

### Classes Not Appearing
1. **Check @source paths**: Ensure files are being scanned
2. **Verify static class names**: No dynamic construction
3. **Rebuild CSS**: Run `npm run build:css`
4. **Check browser cache**: Hard refresh after changes

### Color Issues
1. **OKLCH syntax**: Verify proper format
2. **Token naming**: Must use `--color-*` prefix
3. **Semantic mapping**: Check if token generates expected utility

### Shadow DOM Problems
1. **CSS injection**: Verify style tag creation
2. **Base64 encoding**: Check server-side encoding
3. **:host compatibility**: Ensure CSS uses :host selector

## Best Practices Summary

### ✅ Do
- Use static, complete class names
- Define semantic color tokens with OKLCH
- Use @source to limit scanning scope
- Test in shadow DOM environment
- Cache compiled CSS on server

### ❌ Don't
- Dynamically construct class names
- Use hex colors for new tokens
- Scan unnecessary file types
- Forget to rebuild after theme changes
- Skip CSS escaping in WordPress

This memory serves as the definitive guide for theming and class detection in our Tailwind CSS 4 + WordPress React Shadow DOM architecture.