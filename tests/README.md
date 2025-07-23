# Test Suite

Comprehensive test suite for the Shadow Plugin Boilerplate to ensure build quality and component integrity.

## Test Files

### 🏗️ `build-validation.js`
Validates that all build artifacts are correctly generated:
- ✅ File existence and sizes
- ✅ JavaScript bundle integrity (IIFE format, React, Zustand)
- ✅ Tailwind CSS compilation
- ✅ WordPress integration files
- ✅ Directory structure
- ✅ Package.json dependencies

### 🧪 `component-tests.js`
Tests React component architecture:
- ✅ Component imports and exports
- ✅ Zustand store integration
- ✅ Tailwind CSS usage
- ✅ Accessibility features
- ✅ Proper React patterns

### 🔗 `integration-tests.js`
Tests WordPress and system integration:
- ✅ WordPress plugin structure
- ✅ REST API endpoints
- ✅ Asset enqueuing
- ✅ Server data passing
- ✅ Web component registration
- ✅ Build process configuration

### 🎯 `run-all-tests.js`
Master test runner that executes all test suites and provides comprehensive reporting.

## Running Tests

```bash
# Run all tests (automatically runs after build)
npm run test

# Run individual test suites
npm run test:build        # Build validation only
npm run test:components   # Component tests only  
npm run test:integration  # Integration tests only

# Build with automatic testing
npm run build
```

## Test Features

### ✅ **Comprehensive Coverage**
- Build artifacts validation
- Component architecture verification
- WordPress integration testing
- API endpoint validation
- State management testing

### 📊 **Detailed Reporting**
- Pass/fail counts for each test suite
- Color-coded output for easy reading
- Error details and debugging information
- Performance timing

### 🚀 **Automated Validation**
- Runs automatically after each build
- Prevents broken builds from going unnoticed
- Validates all critical functionality

### 🔍 **Deep Integration Testing**
- WordPress plugin headers and structure
- REST API endpoint configuration
- Server-to-React data flow
- Web component registration
- Tailwind CSS compilation and injection
- Zustand store persistence

## What Gets Tested

### Build Process
- JavaScript bundle size and content
- CSS compilation with Tailwind utilities
- File structure and organization
- Package dependencies

### React Components
- Import/export structure
- Store integration
- Tailwind class usage
- Accessibility attributes
- JSX syntax validation

### WordPress Integration
- Plugin headers and security
- REST API routes
- Asset enqueuing
- Server data passing
- Web component setup

### State Management
- Zustand store configuration
- localStorage persistence
- Cross-component data flow
- API integration

## Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

This ensures reliable CI/CD integration and prevents broken builds.