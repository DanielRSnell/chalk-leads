#!/usr/bin/env node

/**
 * Component Architecture Tests
 * 
 * Validates React component structure, imports, and dependencies
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class ComponentTester {
  constructor() {
    this.results = { passed: 0, failed: 0, errors: [] };
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

  validateComponent(componentPath, expectedImports = [], expectedExports = []) {
    const fullPath = join(projectRoot, componentPath);
    if (!existsSync(fullPath)) return false;
    
    const content = readFileSync(fullPath, 'utf8');
    
    // Check imports
    const hasRequiredImports = expectedImports.every(imp => 
      content.includes(`import`) && content.includes(imp)
    );
    
    // Check exports
    const hasRequiredExports = expectedExports.every(exp => 
      content.includes(`export`) && content.includes(exp)
    );
    
    // Check React patterns
    const hasReactImport = content.includes("import React") || content.includes("from 'react'");
    const hasJSX = content.includes('<') && content.includes('>');
    
    return hasRequiredImports && hasRequiredExports && hasReactImport && hasJSX;
  }

  validateStoreIntegration(componentPath) {
    const fullPath = join(projectRoot, componentPath);
    if (!existsSync(fullPath)) return false;
    
    const content = readFileSync(fullPath, 'utf8');
    
    // Check for store imports and usage
    const hasStoreImport = content.includes('useStore') || content.includes('useWordPressStore');
    const hasStoreUsage = content.includes('useStore()') || content.includes('useWordPressStore()');
    
    return hasStoreImport && hasStoreUsage;
  }

  validateTailwindUsage(componentPath) {
    const fullPath = join(projectRoot, componentPath);
    if (!existsSync(fullPath)) return false;
    
    const content = readFileSync(fullPath, 'utf8');
    
    // Check for Tailwind class usage
    const tailwindPatterns = [
      'className=',
      'flex',
      'bg-',
      'text-',
      'p-',
      'rounded',
      'hover:',
      'focus:'
    ];
    
    return tailwindPatterns.some(pattern => content.includes(pattern));
  }

  validateAccessibility(componentPath) {
    const fullPath = join(projectRoot, componentPath);
    if (!existsSync(fullPath)) return false;
    
    const content = readFileSync(fullPath, 'utf8');
    
    // Check for accessibility attributes
    const a11yPatterns = [
      'aria-',
      'role=',
      'tabIndex',
      'title=',
      'alt=',
      'label'
    ];
    
    return a11yPatterns.some(pattern => content.includes(pattern));
  }

  run() {
    this.log('🧪 Starting Component Architecture Tests...', 'info');
    this.log('='.repeat(50), 'info');

    // Test main components
    const components = [
      {
        path: 'src/components/Panel.jsx',
        imports: ['useStore', 'motion', 'CommandPalette'],
        exports: ['Panel']
      },
      {
        path: 'src/components/CommandPalette.jsx',
        imports: ['useStore', 'motion', 'DEMO_COMMANDS'],
        exports: ['CommandPalette']
      },
      {
        path: 'src/components/SettingsDialog.jsx',
        imports: ['Dialog', 'Tabs', 'Switch', 'useStore'],
        exports: ['SettingsDialog']
      },
      {
        path: 'src/components/PanelHeader.jsx',
        imports: ['motion', 'useStore'],
        exports: ['PanelHeader']
      },
      {
        path: 'src/components/TailwindDemo.jsx',
        imports: ['motion', 'reloadTailwindStyles'],
        exports: ['TailwindDemo']
      }
    ];

    components.forEach(({ path, imports, exports }) => {
      this.test(`${path} has correct structure`, () => 
        this.validateComponent(path, imports, exports)
      );
      
      this.test(`${path} uses Zustand store`, () => 
        this.validateStoreIntegration(path)
      );
      
      this.test(`${path} uses Tailwind classes`, () => 
        this.validateTailwindUsage(path)
      );
      
      this.test(`${path} has accessibility features`, () => 
        this.validateAccessibility(path)
      );
    });

    // Test store files
    this.test('Zustand store is properly configured', () => {
      const storePath = join(projectRoot, 'src/storage/store.js');
      if (!existsSync(storePath)) return false;
      
      const content = readFileSync(storePath, 'utf8');
      
      return content.includes('create') && 
             content.includes('persist') && 
             content.includes('localStorage') &&
             content.includes('useStore') &&
             content.includes('useWordPressStore');
    });

    // Test utility files
    this.test('Utility functions are properly exported', () => {
      const helpersPath = join(projectRoot, 'src/utils/helpers.js');
      if (!existsSync(helpersPath)) return false;
      
      const content = readFileSync(helpersPath, 'utf8');
      
      return content.includes('export') &&
             content.includes('debounce') &&
             content.includes('cn') &&
             content.includes('downloadAsJson');
    });

    this.test('Constants are properly defined', () => {
      const constantsPath = join(projectRoot, 'src/utils/constants.js');
      if (!existsSync(constantsPath)) return false;
      
      const content = readFileSync(constantsPath, 'utf8');
      
      return content.includes('DEMO_COMMANDS') &&
             content.includes('PANEL_POSITIONS') &&
             content.includes('KEYBOARD_SHORTCUTS');
    });

    // Test main app integration
    this.test('ShadowApp integrates all components', () => {
      const appPath = join(projectRoot, 'src/ShadowApp.jsx');
      if (!existsSync(appPath)) return false;
      
      const content = readFileSync(appPath, 'utf8');
      
      return content.includes('useStore') &&
             content.includes('TailwindLoader') &&
             content.includes('Panel') &&
             content.includes('ShadowStyles');
    });

    // Final results
    this.log('='.repeat(50), 'info');
    this.log(`📊 Component Test Results: ${this.results.passed} passed, ${this.results.failed} failed`, 
      this.results.failed === 0 ? 'success' : 'error'
    );

    if (this.results.errors.length > 0) {
      this.log('\n🔍 Error Details:', 'warning');
      this.results.errors.forEach(({ description, error }) => {
        this.log(`   • ${description}: ${error}`, 'error');
      });
    }

    return this.results.failed === 0;
  }
}

// Run tests if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tester = new ComponentTester();
  const success = tester.run();
  process.exit(success ? 0 : 1);
}

export { ComponentTester };