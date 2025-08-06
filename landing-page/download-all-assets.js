import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadAllAssets() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Create assets directory if it doesn't exist
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    // Pages to scrape
    const pages = [
        'https://www.atlantafurnituremovers.com/',
        'https://www.atlantafurnituremovers.com/services/',
        'https://www.atlantafurnituremovers.com/about/',
        'https://www.atlantafurnituremovers.com/contact/',
    ];
    
    const allAssets = new Set();
    
    for (const pageUrl of pages) {
        try {
            console.log(`Loading page: ${pageUrl}`);
            await page.goto(pageUrl, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            
            // Wait a bit more for any lazy-loaded content
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('Extracting assets...');
            
            const assets = await page.evaluate(() => {
                const urls = new Set();
                
                // Get all img elements with actual src
                document.querySelectorAll('img[src]').forEach(img => {
                    if (img.src && !img.src.startsWith('data:') && img.src.includes('http')) {
                        urls.add(img.src);
                    }
                    // Check srcset too
                    if (img.srcset) {
                        img.srcset.split(',').forEach(srcset => {
                            const url = srcset.trim().split(' ')[0];
                            if (url && !url.startsWith('data:') && url.includes('http')) {
                                urls.add(url);
                            }
                        });
                    }
                });
                
                // Get all svg elements and save them
                document.querySelectorAll('svg').forEach(svg => {
                    if (svg.outerHTML && svg.outerHTML.length > 100) { // Skip tiny/empty SVGs
                        urls.add('data:image/svg+xml;base64,' + btoa(svg.outerHTML));
                    }
                });
                
                // Get background images from computed styles - only check elements likely to have backgrounds
                const backgroundElements = document.querySelectorAll('div, section, header, .bg, [style*="background"]');
                backgroundElements.forEach(element => {
                    const style = window.getComputedStyle(element);
                    const backgroundImage = style.backgroundImage;
                    if (backgroundImage && backgroundImage !== 'none' && backgroundImage.includes('url(')) {
                        const matches = backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/g);
                        if (matches) {
                            matches.forEach(match => {
                                const url = match.replace(/url\(['"]?/, '').replace(/['"]?\)$/, '');
                                if (url && !url.startsWith('data:') && url.includes('http')) {
                                    urls.add(url);
                                }
                            });
                        }
                    }
                });
                
                // Check for any data attributes with image URLs
                document.querySelectorAll('[data-src], [data-background], [data-image]').forEach(element => {
                    ['data-src', 'data-background', 'data-image'].forEach(attr => {
                        const url = element.getAttribute(attr);
                        if (url && !url.startsWith('data:') && url.includes('http')) {
                            urls.add(url);
                        }
                    });
                });
                
                return Array.from(urls).filter(url => {
                    // Filter for actual image files and Atlanta domain
                    return (url.includes('atlantafurnituremovers.com') || url.startsWith('data:')) &&
                           (url.match(/\.(jpg|jpeg|png|webp|svg|gif)(\?|$)/i) || url.startsWith('data:image/svg'));
                });
            });
            
            assets.forEach(asset => allAssets.add(asset));
            console.log(`Found ${assets.length} assets on ${pageUrl}`);
            
        } catch (error) {
            console.error(`Error loading ${pageUrl}:`, error.message);
        }
    }
    
    console.log(`\nTotal unique assets found: ${allAssets.size}`);
    Array.from(allAssets).forEach(url => console.log(url));
    
    // Download each asset
    let downloadCount = 0;
    const downloadPromises = Array.from(allAssets).map(async (url, index) => {
        try {
            if (url.startsWith('data:image/svg')) {
                // Handle inline SVGs
                const matches = url.match(/data:image\/svg\+xml;base64,(.+)/);
                if (matches) {
                    const svgContent = Buffer.from(matches[1], 'base64').toString();
                    const filename = `inline-svg-${index}.svg`;
                    fs.writeFileSync(path.join(assetsDir, filename), svgContent);
                    console.log(`Saved inline SVG: ${filename}`);
                    downloadCount++;
                }
                return;
            }
            
            const urlObj = new URL(url);
            let filename = path.basename(urlObj.pathname);
            
            // Remove any query parameters from filename
            filename = filename.split('?')[0];
            
            // If no extension, try to determine from URL
            if (!path.extname(filename)) {
                if (url.includes('.jpg') || url.includes('.jpeg')) filename += '.jpg';
                else if (url.includes('.png')) filename += '.png';
                else if (url.includes('.webp')) filename += '.webp';
                else if (url.includes('.svg')) filename += '.svg';
                else filename += '.jpg'; // default
            }
            
            const filepath = path.join(assetsDir, filename);
            
            // Skip if file already exists
            if (fs.existsSync(filepath)) {
                console.log(`Skipping existing file: ${filename}`);
                return;
            }
            
            await downloadFile(url, filepath);
            console.log(`Downloaded: ${filename}`);
            downloadCount++;
            
        } catch (error) {
            console.error(`Error downloading ${url}:`, error.message);
        }
    });
    
    await Promise.all(downloadPromises);
    
    console.log(`\nDownload completed! ${downloadCount} new files downloaded.`);
    await browser.close();
}

function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        
        const request = protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
                file.on('error', (err) => {
                    fs.unlink(filepath, () => {}); // Delete the file on error
                    reject(err);
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                // Handle redirects
                const redirectUrl = response.headers.location;
                if (redirectUrl) {
                    downloadFile(redirectUrl, filepath)
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(new Error(`Redirect without location header: ${response.statusCode}`));
                }
            } else {
                reject(new Error(`HTTP ${response.statusCode} for ${url}`));
            }
        });
        
        request.on('error', reject);
        request.setTimeout(30000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Run the script
downloadAllAssets().catch(console.error);