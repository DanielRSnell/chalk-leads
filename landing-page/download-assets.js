import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadAssets() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Create assets directory if it doesn't exist
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    console.log('Loading page...');
    await page.goto('https://www.atlantafurnituremovers.com/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
    });
    
    console.log('Page loaded, extracting assets...');
    
    // Extract all image and SVG URLs
    const assets = await page.evaluate(() => {
        const urls = new Set();
        
        // Get all img elements
        document.querySelectorAll('img').forEach(img => {
            if (img.src) urls.add(img.src);
            if (img.srcset) {
                img.srcset.split(',').forEach(srcset => {
                    const url = srcset.trim().split(' ')[0];
                    if (url) urls.add(url);
                });
            }
        });
        
        // Get all SVG elements
        document.querySelectorAll('svg').forEach(svg => {
            if (svg.outerHTML) {
                urls.add('data:image/svg+xml;base64,' + btoa(svg.outerHTML));
            }
        });
        
        // Get background images from computed styles
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const backgroundImage = style.backgroundImage;
            if (backgroundImage && backgroundImage !== 'none') {
                const matches = backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/g);
                if (matches) {
                    matches.forEach(match => {
                        const url = match.replace(/url\(['"]?/, '').replace(/['"]?\)$/, '');
                        if (url && !url.startsWith('data:')) {
                            urls.add(url);
                        }
                    });
                }
            }
        });
        
        // Get any data-src or data-background attributes
        document.querySelectorAll('[data-src], [data-background]').forEach(element => {
            if (element.dataset.src) urls.add(element.dataset.src);
            if (element.dataset.background) urls.add(element.dataset.background);
        });
        
        return Array.from(urls);
    });
    
    console.log(`Found ${assets.length} assets:`);
    assets.forEach(url => console.log(url));
    
    // Download each asset
    const downloadPromises = assets.map(async (url, index) => {
        try {
            if (url.startsWith('data:')) {
                // Handle inline SVGs
                const matches = url.match(/data:image\/svg\+xml;base64,(.+)/);
                if (matches) {
                    const svgContent = Buffer.from(matches[1], 'base64').toString();
                    const filename = `inline-svg-${index}.svg`;
                    fs.writeFileSync(path.join(assetsDir, filename), svgContent);
                    console.log(`Saved inline SVG: ${filename}`);
                }
                return;
            }
            
            // Skip external domains we don't want
            if (!url.includes('atlantafurnituremovers.com') && 
                !url.includes('cdnjs.cloudflare.com') &&
                !url.includes('fonts.googleapis.com')) {
                return;
            }
            
            const urlObj = new URL(url);
            const filename = path.basename(urlObj.pathname) || `asset-${index}`;
            const filepath = path.join(assetsDir, filename);
            
            // Skip if file already exists
            if (fs.existsSync(filepath)) {
                console.log(`Skipping existing file: ${filename}`);
                return;
            }
            
            await downloadFile(url, filepath);
            console.log(`Downloaded: ${filename}`);
            
        } catch (error) {
            console.error(`Error downloading ${url}:`, error.message);
        }
    });
    
    await Promise.all(downloadPromises);
    
    console.log('All downloads completed!');
    await browser.close();
}

function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        
        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
                file.on('error', reject);
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                // Handle redirects
                downloadFile(response.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
            } else {
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}

// Run the script
downloadAssets().catch(console.error);