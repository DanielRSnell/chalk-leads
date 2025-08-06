import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of all image URLs found in the HTML content
const imageUrls = [
    // Awards/Credentials Carousel Images
    'https://www.atlantafurnituremovers.com/wp-content/uploads/2024/01/ga-atlanta-moving-2022-1-1.webp',
    'https://www.atlantafurnituremovers.com/wp-content/uploads/2023/06/Best-of-Georgia.webp',
    'https://www.atlantafurnituremovers.com/wp-content/uploads/2023/12/BOGA-Ribbon-2023-Best-RGBforWEB.webp',
    'https://www.atlantafurnituremovers.com/wp-content/uploads/2024/12/Best-of-Georgia-2024.webp',
    'https://www.atlantafurnituremovers.com/wp-content/uploads/2023/06/Google-Reviews.jpg',
    'https://www.atlantafurnituremovers.com/wp-content/uploads/2023/06/BBB-A-Accredited.webp',
    
    // Service Icons
    'https://www.atlantafurnituremovers.com/wp-content/uploads/2023/04/Moving-Services.png',
    'https://www.atlantafurnituremovers.com/wp-content/uploads/2023/04/Residential-Movers.png',
    'https://www.atlantafurnituremovers.com/wp-content/uploads/2023/04/Commercial-MOvers.png',
    'https://www.atlantafurnituremovers.com/wp-content/uploads/2023/04/Local-Movers.png',
    'https://www.atlantafurnituremovers.com/wp-content/uploads/2023/04/Long-Distance-Movers.png',
    'https://www.atlantafurnituremovers.com/wp-content/uploads/2023/04/Storage.png',
];

async function downloadAssets() {
    // Create assets directory if it doesn't exist
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    console.log(`Starting download of ${imageUrls.length} assets...`);
    
    // Download each asset
    let downloadCount = 0;
    const downloadPromises = imageUrls.map(async (url, index) => {
        try {
            const urlObj = new URL(url);
            let filename = path.basename(urlObj.pathname);
            
            // Remove any query parameters from filename
            filename = filename.split('?')[0];
            
            const filepath = path.join(assetsDir, filename);
            
            // Skip if file already exists
            if (fs.existsSync(filepath)) {
                console.log(`⏭️  Skipping existing file: ${filename}`);
                return;
            }
            
            await downloadFile(url, filepath);
            console.log(`✅ Downloaded: ${filename}`);
            downloadCount++;
            
        } catch (error) {
            console.error(`❌ Error downloading ${url}:`, error.message);
        }
    });
    
    await Promise.all(downloadPromises);
    
    console.log(`\n🎉 Download completed! ${downloadCount} new files downloaded.`);
    
    // List all assets in the directory
    console.log('\n📁 All assets in directory:');
    const files = fs.readdirSync(assetsDir).sort();
    files.forEach(file => {
        const filePath = path.join(assetsDir, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(1);
        console.log(`   ${file} (${size} KB)`);
    });
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
downloadAssets().catch(console.error);