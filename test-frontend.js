import puppeteer from 'puppeteer';

async function testWidget() {
  console.log('🚀 Starting widget frontend test...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless mode
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
      console.log('PAGE LOG:', msg.text());
    });
    
    // Enable error logging
    page.on('pageerror', error => {
      console.error('PAGE ERROR:', error.message);
    });
    
    // Enable response monitoring for errors
    page.on('response', response => {
      if (!response.ok()) {
        console.error(`Failed response: ${response.url()} - ${response.status()}`);
      }
    });
    
    // Navigate to the site
    console.log('📍 Navigating to http://example-site.local:55059/');
    await page.goto('http://example-site.local:55059/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait a moment for everything to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if custom element is defined
    const isCustomElementDefined = await page.evaluate(() => {
      return customElements.get('moovinleads-widget') !== undefined;
    });
    console.log('Custom element defined:', isCustomElementDefined);
    
    // Manually create the widget element for testing
    const createResult = await page.evaluate(() => {
      console.log('Attempting to create moovinleads-widget element...');
      
      // Only add if not already present
      if (!document.querySelector('moovinleads-widget')) {
        const panel = document.createElement('moovinleads-widget');
        
        // Set attributes with test data
        panel.setAttribute('user-role', 'administrator');
        panel.setAttribute('site-url', window.location.origin);
        panel.setAttribute('user-id', '1');
        panel.setAttribute('settings', '{}');
        panel.setAttribute('api-nonce', 'test-nonce');
        panel.setAttribute('plugin-version', '1.0.0');
        panel.setAttribute('is-admin', 'false');
        panel.setAttribute('theme', 'dark');
        
        // Add the actual CSS content (we'll read it from the file)
        // For now, let's skip CSS and see if React renders
        panel.setAttribute('tailwind-css', '');
        
        // Add to body
        document.body.appendChild(panel);
        console.log('Manually created moovinleads-widget element');
        
        return 'created';
      } else {
        console.log('Element already exists');
        return 'exists';
      }
    });
    
    console.log('Create result:', createResult);
    
    // Wait for React to render
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check shadow DOM content
    const shadowContent = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (widget && widget.shadowRoot) {
        return {
          hasChildren: widget.shadowRoot.children.length > 0,
          childrenCount: widget.shadowRoot.children.length,
          innerHTML: widget.shadowRoot.innerHTML.substring(0, 500) // First 500 chars
        };
      }
      return { error: 'No shadow root found' };
    });
    console.log('Shadow DOM content:', shadowContent);
    
    // Check if the floating action button exists (inside shadow DOM)
    console.log('🔍 Looking for floating action button...');
    const fabInfo = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (widget && widget.shadowRoot) {
        const fab = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6');
        return {
          exists: fab !== null,
          isVisible: fab ? getComputedStyle(fab).display !== 'none' : false,
          hasButton: fab ? fab.querySelector('button') !== null : false
        };
      }
      return { exists: false, isVisible: false, hasButton: false };
    });
    console.log('FAB info:', fabInfo);
    
    // Check if the widget container exists
    console.log('🔍 Looking for widget container...');
    const widgetExists = await page.evaluate(() => {
      return document.querySelector('moovinleads-widget') !== null;
    });
    console.log('Widget custom element exists:', widgetExists);
    
    // Check if the lead capture widget exists initially (should be hidden)
    const leadWidgetInfo = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (widget && widget.shadowRoot) {
        const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
        return {
          exists: leadWidget !== null,
          isVisible: leadWidget ? getComputedStyle(leadWidget).display !== 'none' : false
        };
      }
      return { exists: false, isVisible: false };
    });
    console.log('Lead capture widget info (should be hidden initially):', leadWidgetInfo);
    
    // Check for JavaScript files loading
    console.log('🔍 Checking for JavaScript files...');
    const scripts = await page.$$eval('script', scripts => 
      scripts.map(script => script.src).filter(src => src.includes('shadow-plugin') || src.includes('moovin'))
    );
    console.log('JavaScript files found:', scripts);
    
    // Check for CSS files loading
    console.log('🔍 Checking for CSS files...');
    const styles = await page.$$eval('link[rel="stylesheet"]', links => 
      links.map(link => link.href).filter(href => href.includes('main.css') || href.includes('moovin'))
    );
    console.log('CSS files found:', styles);
    
    // Test clicking the floating action button
    if (fabInfo.exists && fabInfo.hasButton) {
      console.log('🖱️ Testing floating action button click...');
      
      try {
        // Click the FAB button inside shadow DOM
        const clickResult = await page.evaluate(() => {
          const widget = document.querySelector('moovinleads-widget');
          if (widget && widget.shadowRoot) {
            const button = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6 button');
            if (button) {
              button.click();
              return { success: true, message: 'Button clicked successfully' };
            }
          }
          return { success: false, message: 'Button not found' };
        });
        
        console.log('Click result:', clickResult);
        
        if (clickResult.success) {
          // Wait for animations and state changes
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if the lead capture widget is now visible
          const widgetAfterClick = await page.evaluate(() => {
            const widget = document.querySelector('moovinleads-widget');
            if (widget && widget.shadowRoot) {
              const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
              return {
                exists: leadWidget !== null,
                isVisible: leadWidget ? getComputedStyle(leadWidget).display !== 'none' : false,
                hasContent: leadWidget ? leadWidget.children.length > 0 : false
              };
            }
            return { exists: false, isVisible: false, hasContent: false };
          });
          
          console.log('📋 Widget after click:', widgetAfterClick);
          
          if (widgetAfterClick.isVisible) {
            // Test the enhanced UI elements
            const uiElements = await page.evaluate(() => {
              const widget = document.querySelector('moovinleads-widget');
              if (widget && widget.shadowRoot) {
                const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
                if (leadWidget) {
                  return {
                    hasGradientHeader: leadWidget.querySelector('.bg-gradient-to-r.from-primary') !== null,
                    hasBackdropBlur: leadWidget.querySelector('.backdrop-blur-xl') !== null,
                    hasProgressBar: leadWidget.querySelector('.bg-primary') !== null,
                    hasProperHeight: leadWidget.querySelector('.min-h-\\[700px\\].max-h-\\[800px\\]') !== null,
                    hasAnimations: leadWidget.querySelector('.animate-in') !== null
                  };
                }
              }
              return { hasGradientHeader: false, hasBackdropBlur: false, hasProgressBar: false, hasProperHeight: false, hasAnimations: false };
            });
            
            console.log('🎨 Enhanced UI elements present:', uiElements);
            
            // Test if we can see the first step content
            const firstStepContent = await page.evaluate(() => {
              const widget = document.querySelector('moovinleads-widget');
              if (widget && widget.shadowRoot) {
                const titleElement = widget.shadowRoot.querySelector('h2');
                return {
                  hasTitle: titleElement !== null,
                  titleText: titleElement ? titleElement.textContent : 'No title found'
                };
              }
              return { hasTitle: false, titleText: 'No widget found' };
            });
            
            console.log('📝 First step content:', firstStepContent);
            
            // Test closing the widget
            console.log('🔄 Testing widget close...');
            const closeResult = await page.evaluate(() => {
              const widget = document.querySelector('moovinleads-widget');
              if (widget && widget.shadowRoot) {
                const closeButton = widget.shadowRoot.querySelector('button[aria-label*="Close"]');
                if (closeButton) {
                  closeButton.click();
                  return { success: true, message: 'Close button clicked' };
                }
              }
              return { success: false, message: 'Close button not found' };
            });
            
            console.log('Close result:', closeResult);
            
            if (closeResult.success) {
              await new Promise(resolve => setTimeout(resolve, 500));
              
              const widgetAfterClose = await page.evaluate(() => {
                const widget = document.querySelector('moovinleads-widget');
                if (widget && widget.shadowRoot) {
                  const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
                  return {
                    exists: leadWidget !== null,
                    isVisible: leadWidget ? getComputedStyle(leadWidget).display !== 'none' : false
                  };
                }
                return { exists: false, isVisible: false };
              });
              
              console.log('📋 Widget after close:', widgetAfterClose);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error during FAB test:', error.message);
      }
    } else {
      console.log('❌ Cannot test FAB - button not available');
    }
    
    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'widget-test.png', fullPage: true });
    console.log('Screenshot saved as widget-test.png');
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for 30 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testWidget().catch(console.error);