import puppeteer from 'puppeteer';

async function debugManualClick() {
  console.log('🔍 Debugging Manual Click Behavior...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Keep browser visible
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable detailed logging
    page.on('console', msg => {
      console.log(`🟦 PAGE: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      console.error(`🔴 ERROR: ${error.message}`);
    });
    
    // Navigate to the site
    console.log('📍 Navigating to site...');
    await page.goto('http://example-site.local:55059/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if there are multiple widgets or conflicts
    const widgetAnalysis = await page.evaluate(() => {
      const widgets = document.querySelectorAll('moovinleads-widget');
      const results = {
        widgetCount: widgets.length,
        widgets: []
      };
      
      widgets.forEach((widget, index) => {
        results.widgets.push({
          index,
          hasShadowRoot: !!widget.shadowRoot,
          shadowChildCount: widget.shadowRoot ? widget.shadowRoot.children.length : 0,
          isConnected: widget.isConnected,
          hasAttributes: widget.hasAttributes(),
          attributes: Array.from(widget.attributes).map(attr => `${attr.name}="${attr.value}"`),
          position: {
            offsetTop: widget.offsetTop,
            offsetLeft: widget.offsetLeft,
            offsetWidth: widget.offsetWidth,
            offsetHeight: widget.offsetHeight
          }
        });
      });
      
      return results;
    });
    
    console.log('🔍 Widget Analysis:', JSON.stringify(widgetAnalysis, null, 2));
    
    // Check for JavaScript errors in console
    const consoleErrors = await page.evaluate(() => {
      // Override console.error to capture errors
      const errors = [];
      const originalError = console.error;
      console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, arguments);
      };
      
      // Trigger any lazy loading or initialization
      window.dispatchEvent(new Event('load'));
      
      return errors;
    });
    
    console.log('🔍 Console Errors:', consoleErrors);
    
    // Test the button with more realistic interaction
    console.log('🖱️ Testing realistic button interaction...');
    
    const buttonTest = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (!widget || !widget.shadowRoot) {
        return { error: 'No widget found' };
      }
      
      const fabContainer = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6');
      const button = fabContainer ? fabContainer.querySelector('button') : null;
      
      if (!button) {
        return { error: 'No button found' };
      }
      
      // Check button properties
      const buttonInfo = {
        isVisible: getComputedStyle(button).display !== 'none',
        isClickable: !button.disabled,
        hasClickListener: button.onclick !== null,
        zIndex: getComputedStyle(fabContainer).zIndex,
        position: getComputedStyle(fabContainer).position,
        pointerEvents: getComputedStyle(button).pointerEvents,
        dimensions: {
          width: button.offsetWidth,
          height: button.offsetHeight,
          top: button.offsetTop,
          left: button.offsetLeft
        },
        computedStyles: {
          backgroundColor: getComputedStyle(button).backgroundColor,
          border: getComputedStyle(button).border,
          borderRadius: getComputedStyle(button).borderRadius
        }
      };
      
      // Try different click methods
      const clickResults = {
        directClick: false,
        mouseEvent: false,
        pointerEvent: false
      };
      
      try {
        // Method 1: Direct click
        button.click();
        clickResults.directClick = true;
      } catch (e) {
        console.log('Direct click failed:', e.message);
      }
      
      try {
        // Method 2: Mouse event
        const mouseEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        button.dispatchEvent(mouseEvent);
        clickResults.mouseEvent = true;
      } catch (e) {
        console.log('Mouse event failed:', e.message);
      }
      
      try {
        // Method 3: Pointer event
        const pointerEvent = new PointerEvent('click', {
          bubbles: true,
          cancelable: true,
          pointerId: 1
        });
        button.dispatchEvent(pointerEvent);
        clickResults.pointerEvent = true;
      } catch (e) {
        console.log('Pointer event failed:', e.message);
      }
      
      return {
        buttonInfo,
        clickResults,
        success: true
      };
    });
    
    console.log('🔍 Button Test Results:', JSON.stringify(buttonTest, null, 2));
    
    // Wait and check if widget opened
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalState = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (!widget || !widget.shadowRoot) {
        return { error: 'No widget found' };
      }
      
      const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
      
      return {
        leadWidgetExists: !!leadWidget,
        leadWidgetVisible: leadWidget ? getComputedStyle(leadWidget).display !== 'none' : false,
        leadWidgetClasses: leadWidget ? leadWidget.className : 'none',
        allShadowElements: Array.from(widget.shadowRoot.children).map(child => ({
          tagName: child.tagName,
          className: child.className,
          id: child.id
        }))
      };
    });
    
    console.log('🔍 Final State:', JSON.stringify(finalState, null, 2));
    
    // Check Zustand store state
    const storeState = await page.evaluate(() => {
      // Try to access store through React DevTools or window
      try {
        return {
          hasWindow: typeof window !== 'undefined',
          windowKeys: Object.keys(window).filter(key => key.includes('react') || key.includes('zustand') || key.includes('store')),
          hasReactDevTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('🔍 Store State:', JSON.stringify(storeState, null, 2));
    
    // Manual inspection
    console.log('\n🔍 Browser will stay open for manual inspection...');
    console.log('Try clicking the button manually and check the DevTools console for any errors.');
    console.log('Press Ctrl+C to exit when done.');
    
    // Keep browser open for manual testing
    await new Promise(resolve => {
      process.on('SIGINT', () => {
        console.log('\n👋 Closing browser...');
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugManualClick().catch(console.error);