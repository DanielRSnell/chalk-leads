import puppeteer from 'puppeteer';

async function debugWidget() {
  console.log('🔍 Starting detailed widget debug...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log('PAGE LOG:', msg.text());
    });
    
    page.on('pageerror', error => {
      console.error('PAGE ERROR:', error.message);
    });
    
    // Navigate to the site
    console.log('📍 Navigating to http://example-site.local:55059/');
    await page.goto('http://example-site.local:55059/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check initial state
    console.log('🔍 Checking initial widget state...');
    const initialState = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (!widget || !widget.shadowRoot) {
        return { error: 'No widget or shadow root found' };
      }
      
      const fab = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6');
      const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
      
      return {
        fabExists: !!fab,
        leadWidgetExists: !!leadWidget,
        fabVisible: fab ? getComputedStyle(fab).display !== 'none' : false,
        leadWidgetVisible: leadWidget ? getComputedStyle(leadWidget).display !== 'none' : false,
        shadowHTML: widget.shadowRoot.innerHTML.substring(0, 1000)
      };
    });
    
    console.log('Initial state:', initialState);
    
    // Try to access Zustand store directly
    const storeState = await page.evaluate(() => {
      // Try to access the store through the React component
      const widget = document.querySelector('moovinleads-widget');
      if (widget && widget.shadowRoot) {
        // Check if there's any React state we can access
        try {
          // Look for any store data in window
          return {
            hasWindow: typeof window !== 'undefined',
            hasZustand: typeof window.zustand !== 'undefined',
            hasStore: typeof window.store !== 'undefined',
            reactPresent: typeof window.React !== 'undefined'
          };
        } catch (e) {
          return { error: e.message };
        }
      }
      return { error: 'No widget found' };
    });
    
    console.log('Store access:', storeState);
    
    // Click the FAB and monitor state changes
    console.log('🖱️ Clicking FAB and monitoring state...');
    const clickTest = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (!widget || !widget.shadowRoot) {
        return { error: 'No widget found' };
      }
      
      const button = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6 button');
      if (!button) {
        return { error: 'No button found' };
      }
      
      // Log what we find before clicking
      const beforeClick = {
        buttonText: button.textContent || 'no text',
        buttonHTML: button.innerHTML.substring(0, 200),
        hasClickHandler: typeof button.onclick === 'function',
        buttonClasses: button.className
      };
      
      // Click the button
      button.click();
      
      // Check immediately after click
      setTimeout(() => {
        const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
        console.log('After click - leadWidget exists:', !!leadWidget);
      }, 100);
      
      return { 
        success: true, 
        beforeClick,
        clickPerformed: true
      };
    });
    
    console.log('Click test:', clickTest);
    
    // Wait a moment and check again
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const afterClickState = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (!widget || !widget.shadowRoot) {
        return { error: 'No widget found' };
      }
      
      const fab = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6');
      const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
      
      return {
        fabExists: !!fab,
        leadWidgetExists: !!leadWidget,
        fabVisible: fab ? getComputedStyle(fab).display !== 'none' : false,
        leadWidgetVisible: leadWidget ? getComputedStyle(leadWidget).display !== 'none' : false,
        totalShadowChildren: widget.shadowRoot.children.length,
        shadowChildrenTypes: Array.from(widget.shadowRoot.children).map(child => child.tagName)
      };
    });
    
    console.log('After click state:', afterClickState);
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser staying open for 30 seconds...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugWidget().catch(console.error);