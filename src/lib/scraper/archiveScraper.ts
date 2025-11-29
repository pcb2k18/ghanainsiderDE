import * as cheerio from 'cheerio';

export interface ScrapedArchiveData {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category_slug: string;
  published_at: string | null;
  featured_image: string | null;
}

/**
 * Scrapes archive.org HTML and extracts article data
 * WITHOUT using AI - pure HTML parsing
 */
export function scrapeArchiveHTML(html: string, originalUrl: string): ScrapedArchiveData {
  const $ = cheerio.load(html);

  // 1. Extract title from H1
  let title = '';
  const h1Element = $('h1.gb-headline.gb-headline-text, h1.entry-title, h1');
  if (h1Element.length > 0) {
    title = h1Element.first().text().trim();
  }

  // 2. Extract featured image
  const featured_image = extractFeaturedImage($);

  // 3. Extract article content
  const articleElement = $('article .entry-content');

  if (articleElement.length > 0) {
    // Remove unwanted elements
    articleElement.find('.quads-location').remove(); // Remove all ads
    articleElement.find('[class*="quads-"]').remove(); // Remove anything with quads in class
    articleElement.find('#ez-toc-container').remove(); // Remove table of contents
    articleElement.find('script').remove(); // Remove all scripts
    articleElement.find('ins.adsbygoogle').remove(); // Remove adsense
    articleElement.find('iframe').remove(); // Remove iframes

    // Get the cleaned HTML
    let content = articleElement.html() || '';

    // Clean up ALL archive.org URLs from links (not just ghanainsider.com)
    // Pattern: https://web.archive.org/web/TIMESTAMP/https://example.com/...
    content = content.replace(
      /https:\/\/web\.archive\.org\/web\/\d+\/(https?:\/\/[^"'\s]+)/g,
      '$1'
    );

    // Also handle archive URLs in other attributes (src, href, etc)
    content = content.replace(
      /web\.archive\.org\/web\/\d+\//g,
      ''
    );

    // Remove empty paragraphs and extra whitespace
    content = content
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 4. Generate excerpt (first 2-3 sentences or 150 chars)
    const textContent = cheerio.load(content).text();
    const sentences = textContent.match(/[^.!?]+[.!?]+/g) || [];
    const excerpt = sentences.slice(0, 3).join(' ').substring(0, 300).trim();

    // 5. Extract slug from original URL (not generated from title!)
    const slug = extractSlugFromUrl(originalUrl);

    // 6. Determine category from URL or content
    const category_slug = detectCategory(originalUrl, textContent);

    // 7. Use null for published_at - let the system use current date
    // We're treating archive imports as NEW articles, not historical ones
    const published_at = null;

    return {
      title,
      content,
      excerpt: excerpt || textContent.substring(0, 200).trim(),
      slug,
      category_slug,
      published_at,
      featured_image,
    };
  }

  // Fallback if no article found
  throw new Error('No article content found in the HTML. The page structure may be different or the content is missing.');
}

/**
 * Extract featured image from the HTML
 * Tries multiple sources in priority order:
 * 1. WordPress featured image (.wp-post-image)
 * 2. First image in article content
 * 3. OG image meta tag
 */
function extractFeaturedImage($: cheerio.CheerioAPI): string | null {
  // Try WordPress featured image
  const wpFeaturedImg = $('img.wp-post-image, img.attachment-post-thumbnail').first();
  if (wpFeaturedImg.length > 0) {
    const src = wpFeaturedImg.attr('src');
    if (src) {
      return cleanArchiveUrl(src);
    }
  }

  // Try first image in article content
  const contentImg = $('article .entry-content img').first();
  if (contentImg.length > 0) {
    const src = contentImg.attr('src');
    if (src) {
      return cleanArchiveUrl(src);
    }
  }

  // Try OG image meta tag
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) {
    return cleanArchiveUrl(ogImage);
  }

  // No image found
  return null;
}

/**
 * Clean archive.org URLs from image paths
 */
function cleanArchiveUrl(url: string): string {
  // Remove archive.org prefix: https://web.archive.org/web/TIMESTAMP/https://...
  let cleaned = url.replace(/https?:\/\/web\.archive\.org\/web\/\d+im_\//, '');
  cleaned = cleaned.replace(/https?:\/\/web\.archive\.org\/web\/\d+\//, '');

  // Ensure it's a full URL
  if (!cleaned.startsWith('http')) {
    // Relative URL - assume ghanainsider.com
    cleaned = `https://ghanainsider.com${cleaned.startsWith('/') ? '' : '/'}${cleaned}`;
  }

  return cleaned;
}

/**
 * Extract slug from the original URL
 * URL format: https://web.archive.org/web/TIMESTAMP/https://ghanainsider.com/de/index.php/SLUG/
 * Or: https://ghanainsider.com/de/index.php/SLUG/
 *
 * IMPORTANT: Preserves index.php/ in the slug if present
 * Example: /de/index.php/post-name/ → index.php/post-name
 */
function extractSlugFromUrl(url: string): string {
  // Remove archive.org prefix if present
  let cleanUrl = url.replace(/https:\/\/web\.archive\.org\/web\/\d+\//, '');

  // Find the /de/ part and extract everything after it
  const deIndex = cleanUrl.indexOf('/de/');

  if (deIndex !== -1) {
    // Get everything after /de/
    let afterDe = cleanUrl.substring(deIndex + 4); // +4 to skip '/de/'

    // Remove trailing slash and query params/hash
    afterDe = afterDe.replace(/\/$/, '').split('?')[0].split('#')[0];

    if (afterDe) {
      return afterDe.toLowerCase().trim();
    }
  }

  // Fallback: generate from URL path
  const pathParts = cleanUrl.split('/').filter(Boolean);
  return pathParts[pathParts.length - 1] || 'imported-post';
}

/**
 * Detect category from URL or content
 */
function detectCategory(url: string, content: string): string {
  const lowercaseUrl = url.toLowerCase();
  const lowercaseContent = content.toLowerCase();

  // Check URL patterns
  if (lowercaseUrl.includes('tod') || lowercaseUrl.includes('verstorben') || lowercaseUrl.includes('nachruf')) {
    return 'tod';
  }
  if (lowercaseUrl.includes('hochzeit') || lowercaseUrl.includes('heirat')) {
    return 'hochzeit';
  }
  if (lowercaseUrl.includes('gastbeitrag') || lowercaseUrl.includes('guest')) {
    return 'gastbeitrag';
  }

  // Check content patterns
  if (
    (lowercaseContent.includes('tod') || lowercaseContent.includes('verstorben')) &&
    (lowercaseContent.includes('todesursache') || lowercaseContent.includes('nachruf'))
  ) {
    return 'tod';
  }
  if (
    lowercaseContent.includes('hochzeit') ||
    (lowercaseContent.includes('heirat') && lowercaseContent.includes('braut'))
  ) {
    return 'hochzeit';
  }

  // Default to breaking-news
  return 'breaking-news';
}
