#!/usr/bin/env node

/**
 * Build Validation Test Suite
 * 
 * Validates that all build artifacts are correctly generated and contain expected content
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Test configuration
const TESTS = {
  files: [
    {
      path: 'dist/js/shadow-plugin.js',
      type: 'javascript',
      minSize: 500000, // 500KB minimum
      contains: [
        'ShadowPlugin',
        'React',
        'zustand',
        'customElements.define',
        'shadow-plugin-panel'
      ]
    },
    {
      path: 'dist/css/main.css',
      type: 'css',
      minSize: 10000, // 10KB minimum
      contains: [
        '.flex',
        '.bg-blue-',
        '.text-',
        '.p-',
        '.rounded',
        'Tailwind CSS'
      ]
    },
    {
      path: 'src/storage/store.js',
      type: 'javascript',
      contains: [
        'zustand',
        'localStorage',
        'isPanelOpen',
        'useStore'
      ]
    },
    {
      path: 'includes/api/class-tailwind-controller.php',
      type: 'php',
      contains: [
        'ShadowPlugin_Tailwind_Controller',
        'register_routes',
        'get_tailwind_styles',
        'process_css_for_shadow_dom'
      ]
    },
    {
      path: 'src/components/Panel.jsx',
      type: 'jsx',
      contains: [
        'useStore',
        'CommandPalette',
        'SettingsDialog',
        'TailwindDemo'
      ]
    }
  ],
  structure: [
    'src/components',
    'src/storage',
    'src/utils',
    'src/styles',
    'includes/api',
    'dist/js',
    'dist/css'
  ]
};

class BuildValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  test(description, testFn) {
    try {
      const result = testFn();
      if (result !== false) {
        this.results.passed++;
        this.log(`✅ ${description}`, 'success');
        return true;
      } else {
        this.results.failed++;
        this.log(`❌ ${description}`, 'error');
        return false;
      }
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({ description, error: error.message });
      this.log(`❌ ${description} - ${error.message}`, 'error');
      return false;
    }
  }

  validateFileExists(filePath) {
    const fullPath = join(projectRoot, filePath);
    return existsSync(fullPath);
  }

  validateFileSize(filePath, minSize) {
    const fullPath = join(projectRoot, filePath);
    if (!existsSync(fullPath)) return false;
    
    const stats = statSync(fullPath);
    return stats.size >= minSize;
  }

  validateFileContent(filePath, expectedContent) {
    const fullPath = join(projectRoot, filePath);
    if (!existsSync(fullPath)) return false;
    
    const content = readFileSync(fullPath, 'utf8');
    return expectedContent.every(expected => content.includes(expected));
  }

  validateDirectoryStructure() {
    return TESTS.structure.every(dir => {
      const fullPath = join(projectRoot, dir);
      return existsSync(fullPath);
    });
  }

  validatePackageJson() {
    const packagePath = join(projectRoot, 'package.json');
    if (!existsSync(packagePath)) return false;
    
    const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
    const requiredDeps = ['react', 'zustand', '@radix-ui/react-dialog', 'framer-motion'];
    const requiredScripts = ['build', 'build:css', 'dev'];
    
    const hasAllDeps = requiredDeps.every(dep => 
      pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]
    );
    
    const hasAllScripts = requiredScripts.every(script => 
      pkg.scripts?.[script]
    );
    
    return hasAllDeps && hasAllScripts;
  }

  validateWebpackBundle() {
    const bundlePath = join(projectRoot, 'dist/js/shadow-plugin.js');
    if (!existsSync(bundlePath)) return false;
    
    const content = readFileSync(bundlePath, 'utf8');
    
    // Check for IIFE wrapper
    const hasIIFE = content.startsWith('!function()') || content.startsWith('(function()');
    
    // Check for essential components
    const hasReact = content.includes('React') || content.includes('react');
    const hasCustomElement = content.includes('customElements.define');
    const hasZustand = content.includes('zustand') || content.includes('create');
    
    return hasIIFE && hasReact && hasCustomElement && hasZustand;
  }

  validateTailwindCSS() {
    const cssPath = join(projectRoot, 'dist/css/main.css');
    if (!existsSync(cssPath)) return false;
    
    const content = readFileSync(cssPath, 'utf8');
    
    // Check for Tailwind base styles
    const hasBase = content.includes('--tw-border-spacing-x') && content.includes('--tw-translate-x');
    
    // Check for utility classes
    const hasUtilities = content.includes('.flex') && content.includes('.bg-') && content.includes('.text-');
    
    // Check for responsive modifiers
    const hasResponsive = content.includes('@media') || content.includes('sm:') || content.includes('lg:');
    
    return hasBase && hasUtilities;
  }

  validateWordPressIntegration() {
    const phpPath = join(projectRoot, 'shadow-plugin.php');
    if (!existsSync(phpPath)) return false;
    
    const content = readFileSync(phpPath, 'utf8');
    
    // Check for WordPress plugin headers
    const hasHeaders = content.includes('Plugin Name:') && content.includes('Version:');
    
    // Check for essential WordPress functions
    const hasHooks = content.includes('add_action') && content.includes('wp_enqueue_script');
    
    // Check for REST API
    const hasRestAPI = content.includes('register_rest_route') && content.includes('rest_url');
    
    return hasHeaders && hasHooks && hasRestAPI;
  }

  validateComponentArchitecture() {
    const componentsDir = join(projectRoot, 'src/components');
    if (!existsSync(componentsDir)) return false;
    
    const requiredComponents = [
      'Panel.jsx',
      'CommandPalette.jsx',
      'SettingsDialog.jsx',
      'PanelHeader.jsx',
      'TailwindDemo.jsx'
    ];
    
    return requiredComponents.every(component => {
      const componentPath = join(componentsDir, component);
      return existsSync(componentPath);
    });
  }

  run() {
    this.log('🚀 Starting Build Validation Tests...', 'info');
    this.log('='.repeat(50), 'info');

    // Test directory structure
    this.test('Directory structure exists', () => this.validateDirectoryStructure());

    // Test package.json
    this.test('Package.json is valid with required dependencies', () => this.validatePackageJson());

    // Test individual files
    TESTS.files.forEach(fileTest => {
      this.test(`${fileTest.path} exists`, () => this.validateFileExists(fileTest.path));
      
      if (fileTest.minSize) {
        this.test(`${fileTest.path} meets minimum size (${fileTest.minSize} bytes)`, () => 
          this.validateFileSize(fileTest.path, fileTest.minSize)
        );
      }
      
      if (fileTest.contains) {
        this.test(`${fileTest.path} contains expected content`, () => 
          this.validateFileContent(fileTest.path, fileTest.contains)
        );
      }
    });

    // Test specialized validations
    this.test('JavaScript bundle is properly built', () => this.validateWebpackBundle());
    this.test('Tailwind CSS is properly compiled', () => this.validateTailwindCSS());
    this.test('WordPress integration is complete', () => this.validateWordPressIntegration());
    this.test('Component architecture is modular', () => this.validateComponentArchitecture());

    // Test build artifacts integrity
    this.test('Build artifacts are recent', () => {
      const jsPath = join(projectRoot, 'dist/js/shadow-plugin.js');
      const cssPath = join(projectRoot, 'dist/css/main.css');
      
      if (!existsSync(jsPath) || !existsSync(cssPath)) return false;
      
      const jsStats = statSync(jsPath);
      const cssStats = statSync(cssPath);
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);
      
      return jsStats.mtimeMs > fiveMinutesAgo && cssStats.mtimeMs > fiveMinutesAgo;
    });

    // Final results
    this.log('='.repeat(50), 'info');
    this.log(`📊 Test Results: ${this.results.passed} passed, ${this.results.failed} failed`, 
      this.results.failed === 0 ? 'success' : 'error'
    );

    if (this.results.errors.length > 0) {
      this.log('\n🔍 Error Details:', 'warning');
      this.results.errors.forEach(({ description, error }) => {
        this.log(`   • ${description}: ${error}`, 'error');
      });
    }

    if (this.results.failed === 0) {
      this.log('\n🎉 All tests passed! Build is ready for production.', 'success');
      process.exit(0);
    } else {
      this.log('\n💥 Some tests failed. Please check the build process.', 'error');
      process.exit(1);
    }
  }
}

// Run the validator
const validator = new BuildValidator();
validator.run();