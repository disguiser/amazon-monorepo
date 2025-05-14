import { Page } from 'puppeteer';

/**
 * @description Attempts to extract high-resolution product image URLs from the current Amazon product page using Puppeteer.
 * Extracts raw data using page.evaluate() and processes it in the Node.js context.
 * @param page - The Puppeteer page object representing the loaded product page.
 * @returns A promise that resolves to an array of potential high-resolution image URLs.
 */
export async function getAmazonHighResImgs(page: Page): Promise<string[]> {
    console.log("Attempting to extract Amazon high-res images (Processing in Node.js)...");
    let imageUrls = new Set<string>(); // Use a Set to automatically handle duplicates
  
    try {
      // Step 1: Extract raw data from the browser using page.evaluate()
      const rawData = await page.evaluate(() => {
        console.log("Browser context: Extracting raw data..."); // Log in browser
  
        // Get script contents
        const scriptContents = Array.from(document.querySelectorAll('script[type="text/javascript"]'))
                                    .map(script => script.innerHTML);
  
        // Get main image data
        const mainImage = document.getElementById('landingImage') as HTMLImageElement | null;
        const mainImageDynamicData = mainImage ? mainImage.dataset.aDynamicImage : null;
        const mainImageSrc = mainImage ? mainImage.src : null;
  
        // Get thumbnail image sources
        const thumbImageSrcs = Array.from(document.querySelectorAll('#altImages .a-button-thumbnail img'))
                                    .map(img => (img as HTMLImageElement).src);
  
        console.log(`Browser context: Extracted ${scriptContents.length} scripts, main image data, ${thumbImageSrcs.length} thumbnails.`); // Log in browser
        return {
          scriptContents,
          mainImageDynamicData,
          mainImageSrc,
          thumbImageSrcs
        };
      }); // End of page.evaluate()
  
      // --- Step 2: Process extracted data in Node.js context ---
      console.log("Node.js context: Processing extracted data...");
  
      // --- Strategy 1: Process Script Data ---
      let foundDataInScripts = false;
      for (const scriptContent of rawData.scriptContents) {
        if (foundDataInScripts) break; // Stop if we already found good data
  
        // Pattern 1: Look for 'imageGalleryData'
        const galleryMatch = scriptContent.match(/'imageGalleryData'\s*:\s*(\[.*?\])/s);
        if (galleryMatch && galleryMatch[1]) {
            try {
                // Carefully use Function constructor in Node.js (sandboxing might be needed for untrusted content)
                const galleryData = new Function(`return ${galleryMatch[1]}`)();
                if (Array.isArray(galleryData)) {
                    galleryData.forEach((img: any) => {
                        if (img.mainUrl) imageUrls.add(img.mainUrl);
                        if (img.largeUrl) imageUrls.add(img.largeUrl);
                        if (img.hiResUrl) imageUrls.add(img.hiResUrl);
                    });
                    if (imageUrls.size > 0) {
                       console.log("Node.js context: Found image URLs via 'imageGalleryData'.");
                       foundDataInScripts = true;
                    }
                }
            } catch (e) {
                console.warn("Node.js context: Could not parse 'imageGalleryData'. Falling back to regex.", (e as Error).message);
                 // Fallback regex on the string itself if parsing failed
                 const urlRegex = /"mainUrl":"(https?:\/\/.*?)"/g;
                 let urlMatch;
                 while ((urlMatch = urlRegex.exec(galleryMatch[1])) !== null) {
                     imageUrls.add(urlMatch[1].replace(/\\/g, '')); // Remove potential backslashes
                 }
                 if (imageUrls.size > 0) foundDataInScripts = true; // Consider found even if only regex worked
            }
            continue; // Move to next script
        }
  
        // Pattern 2: Look for 'colorImages' data structure
        const colorImagesMatch = scriptContent.match(/'colorImages':\s*({.*}),\s*'colorToAsin'/s);
        if (colorImagesMatch && colorImagesMatch[1]) {
            try {
                const colorData = new Function(`return ${colorImagesMatch[1]}`)();
                if (colorData && colorData.initial && Array.isArray(colorData.initial)) {
                    colorData.initial.forEach((imgInfo: any) => {
                        if (imgInfo.hiRes) {
                            imageUrls.add(imgInfo.hiRes);
                        } else if (imgInfo.large) {
                            imageUrls.add(imgInfo.large); // Fallback to large
                        } else if (imgInfo.main && typeof imgInfo.main === 'object') {
                            const mainKeys = Object.keys(imgInfo.main);
                            if (mainKeys.length > 0) {
                                 mainKeys.forEach(key => imageUrls.add(imgInfo.main[key]));
                            }
                        }
                    });
                     if (imageUrls.size > 0) {
                       console.log("Node.js context: Found image URLs via 'colorImages' data.");
                       foundDataInScripts = true;
                    }
                }
            } catch (e) {
                console.warn("Node.js context: Could not parse 'colorImages' data:", (e as Error).message);
            }
            continue; // Move to next script
        }
  
        // Pattern 3: Look for data assigned using `jQuery.parseJSON`
         const jQueryJsonMatch = scriptContent.match(/jQuery\.parseJSON\('(.*)'\)/);
         if (jQueryJsonMatch && jQueryJsonMatch[1]) {
             try {
                 const jsonDataString = jQueryJsonMatch[1]
                   .replace(/\\'/g, "'").replace(/\\\\/g, "\\");
                 const jsonData = JSON.parse(jsonDataString);
  
                 let foundInJson = false;
                 if (jsonData.imageGalleryData && Array.isArray(jsonData.imageGalleryData)) {
                    jsonData.imageGalleryData.forEach((img: any) => {
                         if (img.mainUrl) imageUrls.add(img.mainUrl);
                         if (img.largeUrl) imageUrls.add(img.largeUrl);
                         if (img.hiResUrl) imageUrls.add(img.hiResUrl);
                     });
                     if (imageUrls.size > 0) foundInJson = true; // Check if new URLs were added
                 }
                 if (!foundInJson && jsonData.colorImages && jsonData.colorImages.initial && Array.isArray(jsonData.colorImages.initial)) {
                     jsonData.colorImages.initial.forEach((imgInfo: any) => {
                         if (imgInfo.hiRes) imageUrls.add(imgInfo.hiRes);
                         else if (imgInfo.large) imageUrls.add(imgInfo.large);
                     });
                      if (imageUrls.size > 0 && !foundDataInScripts) foundInJson = true; // Check if new URLs were added if galleryData wasn't present
                 }
  
                 if(foundInJson) {
                    console.log("Node.js context: Found image URLs via jQuery.parseJSON data.");
                    foundDataInScripts = true; // Mark as found if URLs were added via this JSON
                 }
  
             } catch(e) {
                 console.warn("Node.js context: Could not parse JSON data from jQuery.parseJSON:", (e as Error).message);
             }
             continue; // Move to next script
         }
      } // End of script processing loop
  
      // --- Strategy 2: Fallback to DOM Data (processed in Node.js) ---
      if (imageUrls.size === 0) {
          console.log("Node.js context: Script data did not yield URLs. Processing DOM data...");
  
          // Try main image 'data-a-dynamic-image' attribute
          if (rawData.mainImageDynamicData) {
              try {
                  const dynamicImages = JSON.parse(rawData.mainImageDynamicData);
                  Object.keys(dynamicImages).forEach(url => imageUrls.add(url));
                  console.log("Node.js context: Found potential URLs via main image 'data-a-dynamic-image'.");
              } catch (e) {
                  console.warn("Node.js context: Could not parse 'data-a-dynamic-image'. Falling back to src.", (e as Error).message);
                   if (rawData.mainImageSrc) imageUrls.add(rawData.mainImageSrc);
              }
          } else if (rawData.mainImageSrc) {
               imageUrls.add(rawData.mainImageSrc);
                console.log("Node.js context: Used main image 'src' attribute.");
          }
  
          // Try thumbnails
          if (rawData.thumbImageSrcs && rawData.thumbImageSrcs.length > 0) {
            let addedFromThumbs = false;
            rawData.thumbImageSrcs.forEach(thumbSrc => {
                if (thumbSrc) {
                    const potentialHiRes = thumbSrc.replace(/\._[A-Z0-9]+_\.(jpg|png|gif)/i, '._SL1500_.$1');
                     if (potentialHiRes !== thumbSrc) {
                        imageUrls.add(potentialHiRes);
                        addedFromThumbs = true;
                     } else {
                         imageUrls.add(thumbSrc); // Add original if no transformation
                         addedFromThumbs = true;
                     }
                }
            });
             if (addedFromThumbs) {
                 console.log("Node.js context: Added/Generated URLs from thumbnails.");
             }
          }
      } // End of DOM fallback
  
      // --- Step 3: Post-processing: Clean up URLs (in Node.js) ---
      const finalUrls = new Set<string>();
      imageUrls.forEach(url => {
        if (typeof url === 'string') { // Ensure it's a string before processing
          if (url.includes('media-amazon.com/images/I/')) {
              const cleanedUrl = url.replace(/\._[A-Z0-9]+_\.(jpg|png|gif|jpeg)/i, '.$1');
              finalUrls.add(cleanedUrl);
          } else {
              finalUrls.add(url); // Keep non-standard URLs as they are
          }
        }
      });
  
      return Array.from(finalUrls);
  
    } catch (error) {
        console.error("Node.js context: An error occurred during image extraction:", error);
        return []; // Return empty array on error
    }
}
