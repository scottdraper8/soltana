/**
 * Image collector for CFM lesson banner images.
 * Handles IIIF URL extraction and conversion to max size.
 */

import { Page } from 'playwright';

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
 * Extract the banner image URL directly from the page.
 * Looks for the first large IIIF image in the main content area.
 */
export async function extractBannerImageUrl(page: Page): Promise<string | null> {
  try {
    const iiifUrl = await page.evaluate(() => {
      // Look for images in main content area
      const images = Array.from(
        document.querySelectorAll('main img, article img, [role="main"] img')
      );

      for (const img of images) {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';

        // Look for IIIF URLs from churchofjesuschrist.org
        if (src.includes('churchofjesuschrist.org/imgs')) {
          // Check if image is reasonably large (likely a banner, not an icon)
          const rect = img.getBoundingClientRect();
          if (rect.width > 200 && rect.height > 100) {
            return src.startsWith('//') ? `https:${src}` : src;
          }
        }
      }
      return null;
    });

    return iiifUrl;
  } catch {
    return null;
  }
}

export interface ImageCollectorResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Collect banner image URL from a CFM lesson page.
 * Returns the IIIF URL for the image.
 */
export async function collectImage(page: Page): Promise<ImageCollectorResult> {
  try {
    // Extract banner image URL directly
    const iiifUrl = await extractBannerImageUrl(page);
    if (!iiifUrl) {
      return { success: false, error: 'Could not find banner image with IIIF URL' };
    }

    // Convert to max size (changes !640, to max)
    const maxUrl = convertToMaxSize(iiifUrl);
    console.log(`    IIIF URL: ${maxUrl}`);

    return { success: true, imageUrl: maxUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
