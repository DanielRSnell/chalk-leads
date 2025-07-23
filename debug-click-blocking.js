import puppeteer from 'puppeteer';

async function debugClickBlocking() {
  console.log('🔍 Debugging Click Blocking Issues...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the site
    await page.goto('http://example-site.local:55059/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check what's at the button position
    const clickabilityTest = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (!widget || !widget.shadowRoot) {
        return { error: 'No widget found' };
      }
      
      const button = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6 button');
      if (!button) {
        return { error: 'No button found' };
      }
      
      // Get button position relative to viewport
      const rect = button.getBoundingClientRect();
      const buttonCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      // Check what element is actually at the button position
      const elementAtPoint = document.elementFromPoint(buttonCenter.x, buttonCenter.y);
      
      // Check if there are any overlapping elements
      const allElementsAtPoint = [];
      let currentElement = elementAtPoint;
      while (currentElement) {
        allElementsAtPoint.push({
          tagName: currentElement.tagName,
          className: currentElement.className,
          id: currentElement.id,
          zIndex: getComputedStyle(currentElement).zIndex,
          position: getComputedStyle(currentElement).position,
          pointerEvents: getComputedStyle(currentElement).pointerEvents
        });
        currentElement = currentElement.parentElement;
      }
      
      // Check for WordPress elements that might interfere
      const wpElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const id = el.id || '';
        const className = el.className || '';
        return id.includes('wp-') || 
               className.includes('wp-') || 
               id.includes('admin') ||
               className.includes('admin') ||
               getComputedStyle(el).zIndex > 999999;
      }).map(el => ({
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        zIndex: getComputedStyle(el).zIndex,
        position: getComputedStyle(el).position
      }));
      
      return {
        buttonPosition: rect,
        buttonCenter,
        elementAtPoint: elementAtPoint ? {
          tagName: elementAtPoint.tagName,
          className: elementAtPoint.className,
          id: elementAtPoint.id
        } : null,
        allElementsAtPoint,
        potentialBlockingElements: wpElements,
        buttonIsVisible: getComputedStyle(button).display !== 'none',
        buttonPointerEvents: getComputedStyle(button).pointerEvents
      };
    });
    
    console.log('🔍 Clickability Test:', JSON.stringify(clickabilityTest, null, 2));
    
    // Try to simulate real mouse interaction
    console.log('🖱️ Testing real mouse interaction...');
    
    const mouseTest = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (!widget || !widget.shadowRoot) return { error: 'No widget' };
      
      const button = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6 button');
      if (!button) return { error: 'No button' };
      
      // Add event listeners to capture all events
      const events = [];
      
      ['mousedown', 'mouseup', 'click', 'pointerdown', 'pointerup'].forEach(eventType => {
        button.addEventListener(eventType, (e) => {
          events.push({
            type: eventType,
            target: e.target.tagName,
            bubbles: e.bubbles,
            cancelable: e.cancelable,
            defaultPrevented: e.defaultPrevented
          });
        });
      });
      
      // Simulate mouse events manually
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Create and dispatch mouse events
      const mouseDown = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: centerY
      });
      
      const mouseUp = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: centerY
      });
      
      const click = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: centerY
      });
      
      button.dispatchEvent(mouseDown);
      button.dispatchEvent(mouseUp);
      button.dispatchEvent(click);
      
      return { events, center: { x: centerX, y: centerY } };
    });
    
    console.log('🔍 Mouse Test:', JSON.stringify(mouseTest, null, 2));
    
    // Wait and check widget state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const widgetState = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (!widget || !widget.shadowRoot) return { error: 'No widget' };
      
      const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
      return {
        widgetVisible: !!leadWidget && getComputedStyle(leadWidget).display !== 'none'
      };
    });
    
    console.log('🔍 Widget State After Mouse Test:', widgetState);
    
    // Try using Puppeteer's click method on the actual coordinates
    console.log('🖱️ Testing Puppeteer coordinate click...');
    
    const buttonCoords = await page.evaluate(() => {
      const widget = document.querySelector('moovinleads-widget');
      if (!widget || !widget.shadowRoot) return null;
      
      const button = widget.shadowRoot.querySelector('.fixed.bottom-6.right-6 button');
      if (!button) return null;
      
      const rect = button.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    });
    
    if (buttonCoords) {
      await page.mouse.click(buttonCoords.x, buttonCoords.y);
      console.log(`🖱️ Clicked at coordinates: ${buttonCoords.x}, ${buttonCoords.y}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalState = await page.evaluate(() => {
        const widget = document.querySelector('moovinleads-widget');
        if (!widget || !widget.shadowRoot) return { error: 'No widget' };
        
        const leadWidget = widget.shadowRoot.querySelector('.fixed.bottom-24.right-6');
        return {
          widgetVisible: !!leadWidget && getComputedStyle(leadWidget).display !== 'none'
        };
      });
      
      console.log('🔍 Final State After Coordinate Click:', finalState);
    }
    
    // Manual inspection time
    console.log('\n🔍 Manual inspection time!');
    console.log('Try clicking the yellow button in the browser.');
    console.log('Check DevTools Console for any errors.');
    console.log('Press Ctrl+C when done.');
    
    await new Promise(resolve => {
      process.on('SIGINT', () => {
        console.log('\n👋 Exiting...');
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugClickBlocking().catch(console.error);