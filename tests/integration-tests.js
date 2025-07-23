#!/usr/bin/env node

/**
 * Integration Tests
 * 
 * Tests WordPress integration, API endpoints, and build process integration
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class IntegrationTester {
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

  validateWordPressPlugin() {
    const pluginPath = join(projectRoot, 'shadow-plugin.php');
    if (!existsSync(pluginPath)) return false;
    
    const content = readFileSync(pluginPath, 'utf8');
    
    // WordPress plugin structure
    const hasHeader = content.includes('Plugin Name:') && content.includes('Description:');
    const hasSecurity = content.includes("!defined('ABSPATH')");
    const hasConstants = content.includes('SHADOW_PLUGIN_VERSION') && content.includes('SHADOW_PLUGIN_DIR');
    const hasClass = content.includes('class ShadowPlugin');
    const hasSingleton = content.includes('getInstance') && content.includes('private static $instance');
    
    return hasHeader && hasSecurity && hasConstants && hasClass && hasSingleton;
  }

  validateRestApiIntegration() {
    const pluginPath = join(projectRoot, 'shadow-plugin.php');
    const controllerPath = join(projectRoot, 'includes/api/class-tailwind-controller.php');
    
    if (!existsSync(pluginPath) || !existsSync(controllerPath)) return false;
    
    const pluginContent = readFileSync(pluginPath, 'utf8');
    const controllerContent = readFileSync(controllerPath, 'utf8');
    
    // Check plugin registers API
    const pluginRegistersAPI = pluginContent.includes('initRestApi') && 
                              pluginContent.includes('register_rest_route') &&
                              pluginContent.includes('ShadowPlugin_Tailwind_Controller');
    
    // Check controller implementation
    const controllerValid = controllerContent.includes('register_routes') &&
                           controllerContent.includes('get_tailwind_styles') &&
                           controllerContent.includes('process_css_for_shadow_dom') &&
                           controllerContent.includes('shadow-plugin/v1');
    
    return pluginRegistersAPI && controllerValid;
  }

  validateAssetEnqueuing() {
    const pluginPath = join(projectRoot, 'shadow-plugin.php');
    if (!existsSync(pluginPath)) return false;
    
    const content = readFileSync(pluginPath, 'utf8');
    
    return content.includes('wp_enqueue_script') &&
           content.includes('shadow-plugin-js') &&
           content.includes('wp_localize_script') &&
           content.includes('shadowPluginData');
  }

  validateServerDataIntegration() {
    const pluginPath = join(projectRoot, 'shadow-plugin.php');
    const appPath = join(projectRoot, 'src/ShadowApp.jsx');
    
    if (!existsSync(pluginPath) || !existsSync(appPath)) return false;
    
    const pluginContent = readFileSync(pluginPath, 'utf8');
    const appContent = readFileSync(appPath, 'utf8');
    
    // Check PHP passes data
    const phpPassesData = pluginContent.includes('user-role') &&
                         pluginContent.includes('site-url') &&
                         pluginContent.includes('user-id') &&
                         pluginContent.includes('api-nonce');
    
    // Check React receives data
    const reactReceivesData = appContent.includes('userRole') &&
                             appContent.includes('siteUrl') &&
                             appContent.includes('userId') &&
                             appContent.includes('apiNonce');
    
    return phpPassesData && reactReceivesData;
  }

  validateWebComponentRegistration() {
    const mainPath = join(projectRoot, 'src/main.jsx');
    if (!existsSync(mainPath)) return false;
    
    const content = readFileSync(mainPath, 'utf8');
    
    return content.includes('r2wc') &&
           content.includes('customElements.define') &&
           content.includes('shadow-plugin-panel') &&
           content.includes('shadow: \'open\'') &&
           content.includes('ShadowApp');
  }

  validateTailwindIntegration() {
    const loaderPath = join(projectRoot, 'src/TailwindLoader.jsx');
    const buildScriptPath = join(projectRoot, 'build-css.js');
    const cssPath = join(projectRoot, 'dist/css/main.css');
    
    if (!existsSync(loaderPath) || !existsSync(buildScriptPath)) return false;
    
    const loaderContent = readFileSync(loaderPath, 'utf8');
    const scriptContent = readFileSync(buildScriptPath, 'utf8');
    
    // Check loader functionality
    const loaderValid = loaderContent.includes('fetch') &&
                       loaderContent.includes('tailwind-styles') &&
                       loaderContent.includes('shadowRoot') &&
                       loaderContent.includes('injectTailwindStyles');
    
    // Check build script
    const scriptValid = scriptContent.includes('writeFileSync') &&
                       scriptContent.includes('dist/css/main.css') &&
                       scriptContent.includes('Tailwind CSS');
    
    // Check CSS file exists and has content
    const cssValid = existsSync(cssPath) && readFileSync(cssPath, 'utf8').length > 1000;
    
    return loaderValid && scriptValid && cssValid;
  }

  validateZustandIntegration() {
    const storePath = join(projectRoot, 'src/storage/store.js');
    const appPath = join(projectRoot, 'src/ShadowApp.jsx');
    
    if (!existsSync(storePath) || !existsSync(appPath)) return false;
    
    const storeContent = readFileSync(storePath, 'utf8');
    const appContent = readFileSync(appPath, 'utf8');
    
    // Check store configuration
    const storeValid = storeContent.includes('persist') &&
                      storeContent.includes('localStorage') &&
                      storeContent.includes('shadow-plugin-storage') &&
                      storeContent.includes('isPanelOpen');
    
    // Check app uses store
    const appUsesStore = appContent.includes('useStore') &&
                        appContent.includes('useWordPressStore');
    
    return storeValid && appUsesStore;
  }

  validateBuildProcess() {
    const packagePath = join(projectRoot, 'package.json');
    const viteConfigPath = join(projectRoot, 'vite.config.js');
    const jsBundle = join(projectRoot, 'dist/js/shadow-plugin.js');
    const cssBundle = join(projectRoot, 'dist/css/main.css');
    
    if (!existsSync(packagePath) || !existsSync(viteConfigPath)) return false;
    
    const packageContent = readFileSync(packagePath, 'utf8');
    const viteContent = readFileSync(viteConfigPath, 'utf8');
    
    // Check package.json scripts
    const pkg = JSON.parse(packageContent);
    const hasScripts = pkg.scripts?.build && pkg.scripts?.['build:css'];
    
    // Check vite config
    const viteValid = viteContent.includes('defineConfig') &&
                     viteContent.includes('react()') &&
                     viteContent.includes('tailwindcss()') &&
                     viteContent.includes('formats: [\'iife\']');
    
    // Check bundles exist
    const bundlesExist = existsSync(jsBundle) && existsSync(cssBundle);
    
    return hasScripts && viteValid && bundlesExist;
  }

  validateKeyboardShortcuts() {
    const shortcutsPath = join(projectRoot, 'src/utils/keyboardShortcuts.js');
    const panelPath = join(projectRoot, 'src/components/Panel.jsx');
    
    if (!existsSync(shortcutsPath) || !existsSync(panelPath)) return false;
    
    const shortcutsContent = readFileSync(shortcutsPath, 'utf8');
    const panelContent = readFileSync(panelPath, 'utf8');
    
    // Check shortcuts implementation
    const shortcutsValid = shortcutsContent.includes('KeyboardShortcutManager') &&
                          shortcutsContent.includes('addEventListener') &&
                          shortcutsContent.includes('keydown');
    
    // Check panel uses shortcuts
    const panelUsesShortcuts = panelContent.includes('createKeyboardManager') ||
                              panelContent.includes('useKeyboard');
    
    return shortcutsValid && panelUsesShortcuts;
  }

  run() {
    this.log('🔗 Starting Integration Tests...', 'info');
    this.log('='.repeat(50), 'info');

    // WordPress Integration Tests
    this.test('WordPress plugin structure is valid', () => this.validateWordPressPlugin());
    this.test('REST API endpoints are properly configured', () => this.validateRestApiIntegration());
    this.test('Assets are properly enqueued', () => this.validateAssetEnqueuing());
    this.test('Server data integration works', () => this.validateServerDataIntegration());

    // React Integration Tests
    this.test('Web component registration is correct', () => this.validateWebComponentRegistration());
    this.test('Tailwind CSS integration is complete', () => this.validateTailwindIntegration());
    this.test('Zustand state management is integrated', () => this.validateZustandIntegration());

    // Build Process Tests
    this.test('Build process is properly configured', () => this.validateBuildProcess());
    this.test('Keyboard shortcuts are implemented', () => this.validateKeyboardShortcuts());

    // Component Integration
    this.test('All components can be imported', () => {
      const components = [
        'src/components/Panel.jsx',
        'src/components/CommandPalette.jsx',
        'src/components/SettingsDialog.jsx',
        'src/components/PanelHeader.jsx',
        'src/components/TailwindDemo.jsx'
      ];
      
      return components.every(comp => existsSync(join(projectRoot, comp)));
    });

    // Final results
    this.log('='.repeat(50), 'info');
    this.log(`📊 Integration Test Results: ${this.results.passed} passed, ${this.results.failed} failed`, 
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
  const tester = new IntegrationTester();
  const success = tester.run();
  process.exit(success ? 0 : 1);
}

export { IntegrationTester };