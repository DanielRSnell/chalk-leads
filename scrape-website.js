import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function scrapeAtlantaFurnitureMovers() {
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for production
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Navigating to Atlanta Furniture Movers...');
    await page.goto('https://www.atlantafurnituremovers.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Take screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'atlanta-furniture-movers-screenshot.png',
      fullPage: true 
    });

    // Extract all text content
    console.log('📝 Extracting content...');
    const content = await page.evaluate(() => {
      const data = {
        title: document.title,
        url: window.location.href,
        headings: {},
        paragraphs: [],
        links: [],
        images: [],
        services: [],
        testimonials: [],
        contactInfo: {},
        brandColors: [],
        sections: []
      };

      // Extract headings (H1-H6)
      for (let i = 1; i <= 6; i++) {
        const headings = Array.from(document.querySelectorAll(`h${i}`));
        if (headings.length > 0) {
          data.headings[`h${i}`] = headings.map(h => ({
            text: h.textContent.trim(),
            id: h.id || null,
            classes: h.className || null
          }));
        }
      }

      // Extract paragraphs
      data.paragraphs = Array.from(document.querySelectorAll('p')).map(p => ({
        text: p.textContent.trim(),
        classes: p.className || null
      })).filter(p => p.text.length > 0);

      // Extract images
      data.images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt || '',
        title: img.title || '',
        classes: img.className || null,
        width: img.width || null,
        height: img.height || null
      }));

      // Extract links
      data.links = Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.textContent.trim(),
        classes: a.className || null
      })).filter(link => link.text.length > 0);

      // Look for service-related content
      const serviceKeywords = ['service', 'moving', 'packing', 'storage', 'delivery', 'installation'];
      const serviceElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent.toLowerCase();
        return serviceKeywords.some(keyword => text.includes(keyword)) && 
               el.children.length === 0 && 
               text.length > 10 && 
               text.length < 200;
      });
      
      data.services = serviceElements.map(el => ({
        text: el.textContent.trim(),
        tag: el.tagName.toLowerCase(),
        classes: el.className || null
      }));

      // Look for testimonials/reviews
      const testimonialKeywords = ['review', 'testimonial', 'customer', 'client', 'excellent', 'great', 'amazing', 'professional'];
      const testimonialElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent.toLowerCase();
        return testimonialKeywords.some(keyword => text.includes(keyword)) && 
               el.children.length <= 2 && 
               text.length > 20 && 
               text.length < 500;
      });
      
      data.testimonials = testimonialElements.map(el => ({
        text: el.textContent.trim(),
        tag: el.tagName.toLowerCase(),
        classes: el.className || null
      }));

      // Extract contact information
      const phoneRegex = /(\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4}|\d{10})/g;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const addressRegex = /\d+\s+[a-zA-Z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct)\s*,?\s*[a-zA-Z\s]+,?\s*[A-Z]{2}\s*\d{5}/gi;
      
      const bodyText = document.body.textContent;
      const phones = bodyText.match(phoneRegex) || [];
      const emails = bodyText.match(emailRegex) || [];
      const addresses = bodyText.match(addressRegex) || [];
      
      data.contactInfo = {
        phones: [...new Set(phones)],
        emails: [...new Set(emails)],
        addresses: [...new Set(addresses)]
      };

      // Try to extract brand colors from CSS
      const stylesheets = Array.from(document.styleSheets);
      const colors = new Set();
      
      try {
        stylesheets.forEach(sheet => {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach(rule => {
              if (rule.style) {
                const styleText = rule.style.cssText;
                const colorMatches = styleText.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g);
                if (colorMatches) {
                  colorMatches.forEach(color => colors.add(color));
                }
              }
            });
          }
        });
      } catch (e) {
        console.log('Could not extract colors from stylesheets');
      }
      
      data.brandColors = Array.from(colors);

      // Extract main sections
      const sections = Array.from(document.querySelectorAll('section, .section, div[class*="section"], main, header, footer')).map(section => ({
        tag: section.tagName.toLowerCase(),
        classes: section.className || null,
        id: section.id || null,
        textContent: section.textContent.trim().substring(0, 500) + (section.textContent.length > 500 ? '...' : ''),
        childCount: section.children.length
      }));
      
      data.sections = sections.filter(section => section.textContent.length > 50);

      return data;
    });

    // Save content to JSON file
    const contentJson = JSON.stringify(content, null, 2);
    fs.writeFileSync('atlanta-furniture-movers-content.json', contentJson);
    
    console.log('✅ Content extracted and saved to atlanta-furniture-movers-content.json');
    console.log('✅ Screenshot saved to atlanta-furniture-movers-screenshot.png');
    
    // Print summary
    console.log('\n📊 Content Summary:');
    console.log(`Title: ${content.title}`);
    console.log(`Headings: ${Object.keys(content.headings).length} types`);
    console.log(`Paragraphs: ${content.paragraphs.length}`);
    console.log(`Images: ${content.images.length}`);
    console.log(`Links: ${content.links.length}`);
    console.log(`Services found: ${content.services.length}`);
    console.log(`Testimonials found: ${content.testimonials.length}`);
    console.log(`Phone numbers: ${content.contactInfo.phones.length}`);
    console.log(`Email addresses: ${content.contactInfo.emails.length}`);
    console.log(`Addresses: ${content.contactInfo.addresses.length}`);
    console.log(`Brand colors: ${content.brandColors.length}`);
    console.log(`Sections: ${content.sections.length}`);

  } catch (error) {
    console.error('❌ Error scraping website:', error);
  } finally {
    await browser.close();
  }
}

scrapeAtlantaFurnitureMovers();