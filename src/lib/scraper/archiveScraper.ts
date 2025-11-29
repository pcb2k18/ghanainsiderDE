import * as cheerio from 'cheerio';

export interface ScrapedArchiveData {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category_slug: string;
  published_at: string | null;
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

  // 2. Extract article content
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

    // 3. Generate excerpt (first 2-3 sentences or 150 chars)
    const textContent = cheerio.load(content).text();
    const sentences = textContent.match(/[^.!?]+[.!?]+/g) || [];
    const excerpt = sentences.slice(0, 3).join(' ').substring(0, 300).trim();

    // 4. Extract slug from original URL (not generated from title!)
    const slug = extractSlugFromUrl(originalUrl);

    // 5. Determine category from URL or content
    const category_slug = detectCategory(originalUrl, textContent);

    // 6. Use null for published_at - let the system use current date
    // We're treating archive imports as NEW articles, not historical ones
    const published_at = null;

    return {
      title,
      content,
      excerpt: excerpt || textContent.substring(0, 200).trim(),
      slug,
      category_slug,
      published_at,
    };
  }

  // Fallback if no article found
  throw new Error('No article content found in the HTML. The page structure may be different or the content is missing.');
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

  // Extract everything after /de/ (including index.php/ if present)
  const match = cleanUrl.match(/\/de\/(.+?)(?:\/|$)/);

  if (match && match[1]) {
    // Remove trailing slash and lowercase
    return match[1].replace(/\/$/, '').toLowerCase().trim();
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
