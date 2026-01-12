/**
 * Image collector for CFM lesson banner images.
 * Handles IIIF URL extraction, conversion to max size, and image download.
 */

import { Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

/**
 * Convert IIIF image URL to maximum size version.
 * Pattern: /imgs/{id}/full/{size}/0/default -> /imgs/{id}/full/max/0/default
 */
export function convertToMaxSize(url: string): string {
  if (!url || !url.includes('churchofjesuschrist.org/imgs')) {
    return url;
  }

  // Decode URL first to handle encoded parameters like %21640%2C
  const decodedUrl = decodeURIComponent(url);

  // Match IIIF URL pattern
  const pattern = /(https?:\/\/[^/]+\/imgs\/[^/]+\/full\/)([^/]+)(\/0\/default.*)/;
  const match = decodedUrl.match(pattern);

  if (match) {
    const base = match[1];
    const suffix = match[3];
    return `${base}max${suffix}`;
  }

  // Try with original URL if decoded didn't match
  const originalMatch = url.match(pattern);
  if (originalMatch) {
    const base = originalMatch[1];
    const suffix = originalMatch[3];
    return `${base}max${suffix}`;
  }

  return url;
}

/**
 * Convert title to snake_case filename, removing author/artist info.
 */
export function generateFilename(title: string): string {
  let cleaned = title;

  // Remove common author patterns
  cleaned = cleaned.replace(/\s*by\s+[^,]+/gi, '');
  cleaned = cleaned.replace(/\s*artist:\s*[^,]+/gi, '');
  cleaned = cleaned.replace(/\s*©\s*[^,]+/gi, '');

  // Convert to snake_case
  cleaned = cleaned.toLowerCase();
  cleaned = cleaned.replace(/[^\w\s-]/g, ''); // Remove special chars except spaces/hyphens
  cleaned = cleaned.replace(/\s+/g, '_'); // Replace spaces with underscores
  cleaned = cleaned.replace(/_+/g, '_'); // Collapse multiple underscores
  cleaned = cleaned.replace(/^_|_$/g, ''); // Remove leading/trailing underscores

  return cleaned || 'untitled_image';
}

/**
 * Find and click the banner image to expand it.
 */
export async function findAndClickBannerImage(page: Page): Promise<boolean> {
  const bannerSelectors = [
    'img[class*="banner"]',
    'img[class*="hero"]',
    'picture img',
    '[class*="banner"] img',
    '[class*="hero"] img',
    'header img',
    'main img',
    '[class*="lesson"] img',
    '[class*="content"] img',
  ];

  for (const selector of bannerSelectors) {
    try {
      const img = page.locator(selector).first();
      if (await img.isVisible()) {
        await img.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await img.click();
        await page.waitForTimeout(2000); // Wait for modal/expansion
        return true;
      }
    } catch {
      // Selector not found, continue
    }
  }

  return false;
}

/**
 * Extract IIIF image URL from the page.
 * Prioritizes IIIF URLs from churchofjesuschrist.org.
 */
export async function extractIiifUrl(page: Page): Promise<string | null> {
  // Use JavaScript to find all image sources
  const iiifUrl = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    for (const img of images) {
      const sources = [
        img.src,
        img.getAttribute('data-src'),
        img.getAttribute('data-full'),
        img.getAttribute('data-original'),
        img.getAttribute('data-large'),
        img.currentSrc,
      ];

      for (const src of sources) {
        if (src && src.includes('churchofjesuschrist.org/imgs')) {
          return src.startsWith('//') ? `https:${src}` : src;
        }
      }
    }
    return null;
  });

  return iiifUrl;
}

/**
 * Extract image title from caption or alt text.
 */
export async function extractImageTitle(page: Page): Promise<string | null> {
  // Try caption selectors first
  const captionSelectors = [
    'figcaption',
    '.caption',
    '[class*="caption"]',
    '[class*="image-caption"]',
  ];

  for (const selector of captionSelectors) {
    try {
      const caption = page.locator(selector).first();
      if (await caption.isVisible()) {
        const text = await caption.textContent();
        if (text?.trim()) {
          return text.trim();
        }
      }
    } catch {
      // Continue to next selector
    }
  }

  // Fallback to alt text
  try {
    const alt = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img[alt]'));
      for (const img of imgs) {
        const altText = img.getAttribute('alt');
        if (altText && altText.trim() && altText.length > 3) {
          return altText.trim();
        }
      }
      return null;
    });
    return alt;
  } catch {
    return null;
  }
}

/**
 * Download image from URL and save to filepath.
 */
export async function downloadImage(url: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, { timeout: 30000 }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, filepath).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        console.error(`    Failed to download: HTTP ${response.statusCode}`);
        resolve(false);
        return;
      }

      // Determine file extension from content-type
      const contentType = response.headers['content-type'] || '';
      let ext = '.jpg';
      if (contentType.includes('png')) ext = '.png';
      else if (contentType.includes('webp')) ext = '.webp';
      else if (contentType.includes('gif')) ext = '.gif';

      // Update filepath with correct extension if needed
      const finalPath = filepath.endsWith(ext) ? filepath : `${filepath}${ext}`;

      const dir = path.dirname(finalPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const file = fs.createWriteStream(finalPath);
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`    Saved: ${path.basename(finalPath)}`);
        resolve(true);
      });

      file.on('error', (err) => {
        fs.unlink(finalPath, () => {});
        console.error(`    Write error: ${err.message}`);
        resolve(false);
      });
    });

    request.on('error', (err) => {
      console.error(`    Download error: ${err.message}`);
      resolve(false);
    });

    request.on('timeout', () => {
      request.destroy();
      console.error('    Download timeout');
      resolve(false);
    });
  });
}

export interface ImageCollectorResult {
  success: boolean;
  imagePath?: string;
  error?: string;
}

/**
 * Collect banner image from a CFM lesson page.
 * Returns the relative path to the saved image.
 */
export async function collectImage(
  page: Page,
  imagesDir: string,
  weekNumber: number
): Promise<ImageCollectorResult> {
  try {
    // Click banner image to expand
    const clicked = await findAndClickBannerImage(page);
    if (!clicked) {
      return { success: false, error: 'Could not find banner image' };
    }

    // Extract IIIF URL
    const iiifUrl = await extractIiifUrl(page);
    if (!iiifUrl) {
      return { success: false, error: 'Could not find IIIF URL' };
    }

    // Convert to max size
    const maxUrl = convertToMaxSize(iiifUrl);
    console.log(`    IIIF URL: ${maxUrl}`);

    // Extract title for filename
    let title = await extractImageTitle(page);
    if (!title) {
      title = `week_${weekNumber}_image`;
    }

    const filename = generateFilename(title);
    const filepath = path.join(imagesDir, filename);

    // Download image
    const success = await downloadImage(maxUrl, filepath);
    if (!success) {
      return { success: false, error: 'Failed to download image' };
    }

    // Return relative path (with .jpg extension added by download)
    const relativePath = `assets/images/${filename}.jpg`;
    return { success: true, imagePath: relativePath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
