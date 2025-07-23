import puppeteer from 'puppeteer';

async function testSimpleButton() {
  console.log('🔍 Testing with simplified button...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    await page.goto('http://example-site.local:55059/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Replace the complex button with a simple one for testing
    const buttonTest = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (!widget || !widget.shadowRoot) return { error: 'No widget' };
      
      const fabContainer = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6');
      if (!fabContainer) return { error: 'No FAB container' };
      
      const originalButton = fabContainer.querySelector('button');
      if (!originalButton) return { error: 'No original button' };
      
      // Create a simple test button
      const testButton = document.createElement('button');
      testButton.innerHTML = 'TEST';
      testButton.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 100px;
        width: 100px;
        height: 100px;
        background: red;
        color: white;
        border: none;
        font-size: 20px;
        z-index: 9999999;
        cursor: pointer;
      `;
      
      // Add click handler
      testButton.onclick = () => {
        console.log('TEST BUTTON CLICKED!');
        alert('Test button works!');
        
        // Also trigger the original handler
        originalButton.click();
      };
      
      // Add to shadow DOM
      widget.shadowRoot.appendChild(testButton);
      
      return { success: true, message: 'Test button added' };
    });
    
    console.log('🔍 Button Test Result:', buttonTest);
    
    console.log('\n🔍 Try clicking both buttons:');
    console.log('- Red TEST button (should show alert)');
    console.log('- Yellow original button (should open widget)');
    console.log('Press Ctrl+C when done testing.');
    
    await new Promise(resolve => {
      process.on('SIGINT', () => {
        console.log('\n👋 Exiting...');
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSimpleButton().catch(console.error);