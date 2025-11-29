import Anthropic from '@anthropic-ai/sdk';
import { buildPrompt, SYSTEM_PROMPT } from './prompts';
import { AIFormattedContent } from '../supabase/types';
import { createServerClient } from '../supabase/client';
import { scrapeArchiveHTML } from '../scraper/archiveScraper';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Get the Claude model to use (priority: database > env > default)
async function getClaudeModel(): Promise<string> {
  try {
    // Try to get from database settings
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'ai_model')
      .single();

    if (!error && data?.value) {
      return data.value;
    }
  } catch (error) {
    // If database fetch fails, fall through to env/default
    console.warn('Could not fetch AI model from database:', error);
  }

  // Fall back to environment variable or default
  return process.env.CLAUDE_MODEL || 'claude-3-5-haiku-20241022';
}

export interface FormatContentParams {
  rawContent: string;
  categorySlug: string;
}

export interface ArchiveImportResult {
  title: string;
  content: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  slug: string;
  category_slug: string;
  published_at: string | null;
  keywords: string[];
}

export async function formatContentWithAI(
  params: FormatContentParams
): Promise<AIFormattedContent> {
  const { rawContent, categorySlug } = params;

  const userPrompt = buildPrompt(categorySlug, rawContent);
  const model = await getClaudeModel();

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    // Extract text content from response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    // Parse JSON response
    // Handle potential markdown code blocks
    let jsonString = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    }

    const result = JSON.parse(jsonString) as AIFormattedContent;
    
    // Validate and sanitize the result
    return {
      title: result.title || '',
      meta_title: result.meta_title || '',
      meta_description: result.meta_description || '',
      slug: sanitizeSlug(result.slug || ''),
      content: result.content || '',
      excerpt: result.excerpt || '',
      keywords: result.keywords || [],
      featured_image_suggestion: result.featured_image_suggestion || '',
      schema_markup: result.schema_markup || {},
      seo_score: result.seo_score || 0,
      seo_suggestions: result.seo_suggestions || [],
    };
  } catch (error) {
    console.error('AI formatting error:', error);
    throw new Error(`Failed to format content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Import from archive.org WITHOUT using AI
 * Uses HTML scraping to extract content and save API costs
 */
export async function importFromArchive(
  htmlContent: string,
  originalUrl: string
): Promise<ArchiveImportResult> {
  try {
    const scraped = scrapeArchiveHTML(htmlContent, originalUrl);

    return {
      title: scraped.title,
      content: scraped.content,
      excerpt: scraped.excerpt,
      meta_title: scraped.title.substring(0, 60),
      meta_description: scraped.excerpt.substring(0, 155),
      slug: scraped.slug,
      category_slug: scraped.category_slug,
      published_at: scraped.published_at,
      keywords: extractKeywords(scraped.title, scraped.content),
    };
  } catch (error) {
    console.error('Archive import error:', error);
    throw new Error(`Failed to import from archive: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract keywords from title and content
 */
function extractKeywords(title: string, content: string): string[] {
  const keywords: string[] = [];

  // Extract from title
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);

  keywords.push(...titleWords.slice(0, 3));

  // Common German keywords to look for
  const commonKeywords = ['tod', 'hochzeit', 'biografie', 'karriere', 'vermögen', 'familie'];
  const contentLower = content.toLowerCase();

  for (const keyword of commonKeywords) {
    if (contentLower.includes(keyword) && !keywords.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  return keywords.slice(0, 5);
}

export async function improveContent(
  existingContent: string,
  instructions: string
): Promise<string> {
  const model = await getClaudeModel();

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Verbessere den folgenden deutschen Artikel basierend auf diesen Anweisungen:

ANWEISUNGEN: ${instructions}

AKTUELLER INHALT:
${existingContent}

Antworte nur mit dem verbesserten Inhalt in HTML-Format, ohne zusätzliche Erklärungen.`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    return message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');
  } catch (error) {
    console.error('Content improvement error:', error);
    throw new Error(`Failed to improve content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function calculateSeoScore(content: AIFormattedContent): {
  score: number;
  checks: { name: string; passed: boolean; points: number }[];
} {
  const checks = [
    {
      name: 'Keyword in URL',
      passed: content.keywords.length > 0 && 
              content.keywords.some(kw => 
                content.slug.toLowerCase().includes(kw.toLowerCase().replace(/\s+/g, '-'))
              ),
      points: 15,
    },
    {
      name: 'Keyword in Title Tag',
      passed: content.keywords.length > 0 &&
              content.keywords.some(kw => 
                content.meta_title.toLowerCase().includes(kw.toLowerCase())
              ),
      points: 15,
    },
    {
      name: 'Keyword in H1',
      passed: content.keywords.length > 0 &&
              content.keywords.some(kw => 
                content.title.toLowerCase().includes(kw.toLowerCase())
              ),
      points: 15,
    },
    {
      name: 'Keyword in First 100 Words',
      passed: content.keywords.length > 0 &&
              content.keywords.some(kw => 
                content.content.substring(0, 500).toLowerCase().includes(kw.toLowerCase())
              ),
      points: 10,
    },
    {
      name: 'Meta Description Length (150-160)',
      passed: content.meta_description.length >= 150 && content.meta_description.length <= 160,
      points: 10,
    },
    {
      name: 'Has H2 Headings',
      passed: (content.content.match(/<h2/gi) || []).length >= 3,
      points: 10,
    },
    {
      name: 'Has Schema Markup',
      passed: Object.keys(content.schema_markup).length > 0,
      points: 10,
    },
    {
      name: 'Has Excerpt',
      passed: content.excerpt.length > 50,
      points: 5,
    },
    {
      name: 'Has Keywords',
      passed: content.keywords.length >= 3,
      points: 5,
    },
    {
      name: 'Has Image Suggestion',
      passed: content.featured_image_suggestion.length > 0,
      points: 5,
    },
  ];

  const score = checks.reduce((acc, check) => acc + (check.passed ? check.points : 0), 0);

  return { score, checks };
}

function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
