import puppeteer from 'puppeteer';

async function quickTest() {
  console.log('🚀 Quick widget test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the site
    await page.goto('http://example-site.local:55059/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Page loaded successfully');
    
    // Check if FAB exists and click it
    const clickResult = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (!widget || !widget.shadowRoot) {
        return { error: 'No widget found' };
      }
      
      const button = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6 button');
      if (!button) {
        return { error: 'No button found' };
      }
      
      // Click the button
      button.click();
      
      // Check if widget opens
      setTimeout(() => {
        const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
        console.log('Widget opened:', !!leadWidget);
      }, 500);
      
      return { success: true };
    });
    
    console.log('✅ Button click result:', clickResult);
    
    // Wait and check final state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalState = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (!widget || !widget.shadowRoot) {
        return { error: 'No widget found' };
      }
      
      const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
      return {
        widgetVisible: !!leadWidget && getComputedStyle(leadWidget).display !== 'none',
        hasProgressBar: !!widget.shadowRoot.querySelector('.bg-primary'),
        hasGradientHeader: !!widget.shadowRoot.querySelector('.bg-gradient-to-r')
      };
    });
    
    console.log('✅ Final state:', finalState);
    
    if (finalState.widgetVisible) {
      console.log('🎉 SUCCESS: Widget opens correctly when button is clicked!');
    } else {
      console.log('❌ ISSUE: Widget did not open properly');
    }
    
    // Keep browser open briefly for visual verification
    console.log('🔍 Keeping browser open for 10 seconds for visual check...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

quickTest().catch(console.error);