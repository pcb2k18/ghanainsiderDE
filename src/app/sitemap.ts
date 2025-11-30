import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://ghanainsider.com';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching for sitemap

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Create Supabase client using environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials for sitemap generation');
    return getStaticPages();
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fetch all published posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts for sitemap:', error);
      return getStaticPages();
    }

    // Build sitemap entries
    const sitemapEntries: MetadataRoute.Sitemap = [
      // Static pages
      ...getStaticPages(),

      // Dynamic post pages
      ...(posts || []).map((post) => {
        const lastModified = post.updated_at || post.published_at;
        const date = lastModified ? new Date(lastModified) : new Date();

        return {
          url: `${SITE_URL}/de/${post.slug}`,
          lastModified: date,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      }),
    ];

    return sitemapEntries;
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return getStaticPages();
  }
}

function getStaticPages(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/de`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
