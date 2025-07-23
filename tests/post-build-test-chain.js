import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class PostBuildTestChain {
  constructor() {
    this.results = {
      fileValidation: [],
      widgetFunctionality: [],
      uiValidation: [],
      performance: [],
      overall: { passed: 0, failed: 0, total: 0 }
    };
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Starting Post-Build Test Chain...');
    console.log('================================================');
    
    this.browser = await puppeteer.launch({ 
      headless: true, // Change to false for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Enable console and error logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 PAGE ERROR:', msg.text());
      }
    });
    
    this.page.on('pageerror', error => {
      console.error('🔴 PAGE CRASH:', error.message);
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  log(category, testName, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    const message = `${icon} ${testName}`;
    console.log(message + (details ? ` - ${details}` : ''));
    
    this.results[category].push({ testName, passed, details });
    this.results.overall.total++;
    if (passed) {
      this.results.overall.passed++;
    } else {
      this.results.overall.failed++;
    }
  }

  // 1. File Validation Tests
  async runFileValidationTests() {
    console.log('\n📁 Running File Validation Tests...');
    console.log('----------------------------------');

    // Check dist files exist and are recent
    const jsPath = 'dist/js/shadow-plugin.js';
    const cssPath = 'dist/css/main.css';
    
    try {
      const jsStats = fs.statSync(jsPath);
      const cssStats = fs.statSync(cssPath);
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);
      
      this.log('fileValidation', 'JavaScript bundle exists', fs.existsSync(jsPath));
      this.log('fileValidation', 'CSS bundle exists', fs.existsSync(cssPath));
      this.log('fileValidation', 'JavaScript bundle is recent', jsStats.mtime.getTime() > fiveMinutesAgo);
      this.log('fileValidation', 'CSS bundle is recent', cssStats.mtime.getTime() > fiveMinutesAgo);
      this.log('fileValidation', 'JavaScript bundle has minimum size', jsStats.size > 500000, `${Math.round(jsStats.size/1024)}KB`);
      this.log('fileValidation', 'CSS bundle has minimum size', cssStats.size > 10000, `${Math.round(cssStats.size/1024)}KB`);
      
      // Check file contents
      const jsContent = fs.readFileSync(jsPath, 'utf8');
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      
      this.log('fileValidation', 'JavaScript contains React', jsContent.includes('React'));
      this.log('fileValidation', 'JavaScript contains Zustand store', jsContent.includes('useLeadStore'));
      this.log('fileValidation', 'JavaScript contains FloatingActionButton', jsContent.includes('FloatingActionButton'));
      this.log('fileValidation', 'CSS contains Tailwind', cssContent.includes('tailwindcss'));
      this.log('fileValidation', 'CSS contains brand colors', cssContent.includes('--color-primary'));
      this.log('fileValidation', 'CSS contains animations', cssContent.includes('animate-in'));
      
    } catch (error) {
      this.log('fileValidation', 'File system access', false, error.message);
    }
  }

  // 2. Widget Functionality Tests  
  async runWidgetFunctionalityTests() {
    console.log('\n🎛️ Running Widget Functionality Tests...');
    console.log('--------------------------------------');

    try {
      // Navigate to test site
      await this.page.goto('http://example-site.local:55059/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test 1: Check if custom element is defined
      const isCustomElementDefined = await this.page.evaluate(() => {
        return customElements.get('moovinleads-widget') !== undefined;
      });
      this.log('widgetFunctionality', 'Custom element is defined', isCustomElementDefined);
      
      // Test 2: Check if widget element exists in DOM
      const widgetExists = await this.page.evaluate(() => {
        return document.querySelector('moovinleads-widget') !== null;
      });
      this.log('widgetFunctionality', 'Widget element exists in DOM', widgetExists);
      
      // Test 3: Check shadow DOM setup
      const shadowDOMSetup = await this.page.evaluate(() => {
        const widget = document.querySelector('moovinleads-widget');
        return widget && widget.shadowRoot && widget.shadowRoot.children.length > 0;
      });
      this.log('widgetFunctionality', 'Shadow DOM is properly set up', shadowDOMSetup);
      
      // Test 4: Check if FAB exists and is visible
      const fabCheck = await this.page.evaluate(() => {
        const widget = document.querySelector('moovinleads-widget');
        if (!widget || !widget.shadowRoot) return false;
        
        const fab = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6');
        return fab && getComputedStyle(fab).display !== 'none';
      });
      this.log('widgetFunctionality', 'Floating Action Button is visible', fabCheck);
      
      // Test 5: Check initial widget state (should be closed)
      const initialWidgetState = await this.page.evaluate(() => {
        const widget = document.querySelector('moovinleads-widget');
        if (!widget || !widget.shadowRoot) return false;
        
        const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
        return leadWidget === null; // Should be null initially
      });
      this.log('widgetFunctionality', 'Widget starts in closed state', initialWidgetState);
      
      // Test 6: Test FAB click functionality
      const clickTest = await this.page.evaluate(() => {
        const widget = document.querySelector('moovinleads-widget');
        if (!widget || !widget.shadowRoot) return false;
        
        const button = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6 button');
        if (!button) return false;
        
        // Click the button
        button.click();
        return true;
      });
      this.log('widgetFunctionality', 'FAB button click executes', clickTest);
      
      // Test 7: Check if widget opens after click
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for animations
      const widgetOpensAfterClick = await this.page.evaluate(() => {
        const widget = document.querySelector('moovinleads-widget');
        if (!widget || !widget.shadowRoot) return false;
        
        const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
        return leadWidget !== null && getComputedStyle(leadWidget).display !== 'none';
      });
      this.log('widgetFunctionality', 'Widget opens after FAB click', widgetOpensAfterClick);
      
      // Test 8: Check if close button works
      const closeTest = await this.page.evaluate(() => {
        const widget = document.querySelector('moovinleads-widget');
        if (!widget || !widget.shadowRoot) return false;
        
        const closeButton = widget.shadowRoot.querySelector('button[aria-label*="Close"]');
        if (!closeButton) return false;
        
        closeButton.click();
        return true;
      });
      this.log('widgetFunctionality', 'Close button executes', closeTest);
      
      // Test 9: Check if widget closes after close click
      await new Promise(resolve => setTimeout(resolve, 500));
      const widgetClosesAfterClick = await this.page.evaluate(() => {
        const widget = document.querySelector('moovinleads-widget');
        if (!widget || !widget.shadowRoot) return true; // If no widget, consider it closed
        
        const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
        return leadWidget === null;
      });
      this.log('widgetFunctionality', 'Widget closes after close button click', widgetClosesAfterClick);
      
    } catch (error) {
      this.log('widgetFunctionality', 'Widget functionality test execution', false, error.message);
    }
  }

  // 3. UI/UX Validation Tests
  async runUIValidationTests() {
    console.log('\n🎨 Running UI/UX Validation Tests...');
    console.log('----------------------------------');

    try {
      // Open widget for UI testing
      await this.page.evaluate(() => {
        const widget = document.querySelector('moovinleads-widget');
        if (widget && widget.shadowRoot) {
          const button = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6 button');
          if (button) button.click();
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test enhanced UI elements
      const uiElements = await this.page.evaluate(() => {
        const widget = document.querySelector('moovinleads-widget');
        if (!widget || !widget.shadowRoot) return {};
        
        const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
        if (!leadWidget) return {};
        
        return {
          hasGradientHeader: leadWidget.querySelector('.bg-gradient-to-r') !== null,
          hasBackdropBlur: leadWidget.querySelector('.backdrop-blur-xl') !== null,
          hasProgressBar: leadWidget.querySelector('.bg-primary') !== null,
          hasProperHeight: leadWidget.className.includes('min-h-[700px]'),
          hasAnimations: leadWidget.querySelector('.animate-in') !== null,
          hasGlassmorphism: leadWidget.className.includes('bg-card/95'),
          hasShadow: leadWidget.querySelector('.shadow-2xl') !== null,
          hasRoundedCorners: leadWidget.querySelector('.rounded-xl') !== null
        };
      });
      
      this.log('uiValidation', 'Gradient header present', uiElements.hasGradientHeader);
      this.log('uiValidation', 'Backdrop blur effects present', uiElements.hasBackdropBlur);
      this.log('uiValidation', 'Progress bar styling present', uiElements.hasProgressBar);
      this.log('uiValidation', 'Proper height classes present', uiElements.hasProperHeight);
      this.log('uiValidation', 'Animation classes present', uiElements.hasAnimations);
      this.log('uiValidation', 'Glassmorphism effects present', uiElements.hasGlassmorphism);
      this.log('uiValidation', 'Shadow effects present', uiElements.hasShadow);
      this.log('uiValidation', 'Rounded corners present', uiElements.hasRoundedCorners);
      
      // Test color theme consistency
      const colorTheme = await this.page.evaluate(() => {
        const widget = document.querySelector('moovinleads-widget');
        if (!widget || !widget.shadowRoot) return {};
        
        const styles = widget.shadowRoot.querySelector('style');
        if (!styles) return {};
        
        const cssText = styles.textContent;
        return {
          hasPrimaryColor: cssText.includes('--color-primary'),
          hasBrandColors: cssText.includes('#F4C443'),
          hasSemanticTokens: cssText.includes('--color-foreground'),
          hasAnimationKeyframes: cssText.includes('@keyframes')
        };
      });
      
      this.log('uiValidation', 'Primary color defined', colorTheme.hasPrimaryColor);
      this.log('uiValidation', 'Brand colors defined', colorTheme.hasBrandColors);
      this.log('uiValidation', 'Semantic color tokens defined', colorTheme.hasSemanticTokens);
      this.log('uiValidation', 'Animation keyframes defined', colorTheme.hasAnimationKeyframes);
      
    } catch (error) {
      this.log('uiValidation', 'UI validation test execution', false, error.message);
    }
  }

  // 4. Performance Tests
  async runPerformanceTests() {
    console.log('\n⚡ Running Performance Tests...');
    console.log('------------------------------');

    try {
      // Measure page load performance
      const metrics = await this.page.metrics();
      
      this.log('performance', 'JavaScript heap usage reasonable', metrics.JSHeapUsedSize < 50000000, `${Math.round(metrics.JSHeapUsedSize/1024/1024)}MB`);
      this.log('performance', 'DOM nodes count reasonable', metrics.Nodes < 1000, `${metrics.Nodes} nodes`);
      
      // Test widget rendering performance
      const renderTime = await this.page.evaluate(() => {
        const start = performance.now();
        
        const widget = document.querySelector('moovinleads-widget');
        if (widget && widget.shadowRoot) {
          const button = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6 button');
          if (button) button.click();
        }
        
        return performance.now() - start;
      });
      
      this.log('performance', 'Widget opens quickly', renderTime < 100, `${Math.round(renderTime)}ms`);
      
      // Test CSS loading
      const cssMetrics = await this.page.evaluate(() => {
        const widget = document.querySelector('moovinleads-widget');
        if (!widget || !widget.shadowRoot) return null;
        
        const styleTag = widget.shadowRoot.querySelector('style');
        return styleTag ? styleTag.textContent.length : 0;
      });
      
      this.log('performance', 'CSS bundle loaded correctly', cssMetrics > 10000, `${Math.round(cssMetrics/1024)}KB`);
      
    } catch (error) {
      this.log('performance', 'Performance test execution', false, error.message);
    }
  }

  // Generate test report
  generateReport() {
    console.log('\n📊 Test Chain Results');
    console.log('====================');
    
    const categories = ['fileValidation', 'widgetFunctionality', 'uiValidation', 'performance'];
    
    categories.forEach(category => {
      const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const passed = this.results[category].filter(test => test.passed).length;
      const total = this.results[category].length;
      
      console.log(`\n${categoryName}: ${passed}/${total} passed`);
      
      this.results[category].forEach(test => {
        const icon = test.passed ? '✅' : '❌';
        console.log(`  ${icon} ${test.testName}${test.details ? ` (${test.details})` : ''}`);
      });
    });
    
    console.log(`\n🎯 Overall: ${this.results.overall.passed}/${this.results.overall.total} tests passed`);
    
    const successRate = (this.results.overall.passed / this.results.overall.total) * 100;
    
    if (successRate === 100) {
      console.log('🎉 ALL TESTS PASSED! Widget is ready for production.');
      return true;
    } else if (successRate >= 90) {
      console.log('⚠️  Most tests passed. Minor issues detected.');
      return false;
    } else {
      console.log('❌ CRITICAL ISSUES DETECTED. Widget needs fixes before deployment.');
      return false;
    }
  }

  // Run all tests
  async runAllTests() {
    try {
      await this.init();
      
      await this.runFileValidationTests();
      await this.runWidgetFunctionalityTests();
      await this.runUIValidationTests();
      await this.runPerformanceTests();
      
      const allPassed = this.generateReport();
      
      // Save results to file
      fs.writeFileSync('test-results.json', JSON.stringify(this.results, null, 2));
      
      return allPassed;
      
    } catch (error) {
      console.error('❌ Test chain failed:', error.message);
      return false;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testChain = new PostBuildTestChain();
  testChain.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Failed to run test chain:', error);
      process.exit(1);
    });
}

export { PostBuildTestChain };