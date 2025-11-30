import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createServerClient } from '@/lib/supabase/client';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import ShareButton from '@/components/ShareButton';

// Disable static generation
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  const supabase = createServerClient();

  // Prepend index.php/ to the slug for database lookup
  const fullSlug = `index.php/${slug}`;

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories(name, slug),
      seo_metadata(*)
    `)
    .eq('slug', fullSlug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return null;
  }

  // Increment view count
  await supabase
    .from('posts')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', data.id);

  return data;
}

async function getRelatedPosts(categoryId: string, currentId: string) {
  const supabase = createServerClient();

  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, published_at')
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .neq('id', currentId)
    .order('published_at', { ascending: false })
    .limit(4);

  return data || [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Artikel nicht gefunden | Ghana Insider',
    };
  }

  const seo = post.seo_metadata;

  return {
    title: seo?.meta_title || post.title,
    description: seo?.meta_description || post.excerpt,
    keywords: seo?.keywords?.join(', '),
    openGraph: {
      title: seo?.meta_title || post.title,
      description: seo?.meta_description || post.excerpt,
      url: `https://ghanainsider.com/de/${post.slug}`,
      siteName: 'Ghana Insider',
      locale: 'de_DE',
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name || 'Ghana Insider'],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.meta_title || post.title,
      description: seo?.meta_description || post.excerpt,
    },
    alternates: {
      canonical: seo?.canonical_url || `https://ghanainsider.com/de/${post.slug}`,
    },
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = post.category_id
    ? await getRelatedPosts(post.category_id, post.id)
    : [];

  const readingTime = calculateReadingTime(post.content);
  const seo = post.seo_metadata;

  // Extract text content for word count
  const textContent = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(' ').length;

  // Generate JSON-LD schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: seo?.meta_description || post.excerpt,
    image: post.featured_image ? [post.featured_image] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: 'Ghana Insider',
      url: 'https://ghanainsider.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ghana Insider',
      url: 'https://ghanainsider.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ghanainsider.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ghanainsider.com/de/${post.slug}`,
    },
    articleBody: textContent.substring(0, 5000), // First 5000 chars for schema
    wordCount: wordCount,
    inLanguage: 'de-DE',
    keywords: seo?.keywords?.join(', ') || undefined,
    articleSection: post.categories?.name || undefined,
    ...seo?.schema_markup,
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-7xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/de"
            className="inline-flex items-center gap-2 text-sm text-surface-400 transition-colors hover:text-surface-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Link>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1fr,380px]">
          {/* Main Content */}
          <div>
            {/* Article Header */}
            <header className="mb-12">
              {post.categories && (
                <Link
                  href={`/de/kategorie/${post.categories.slug}`}
                  className="inline-block rounded-full bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400 transition-colors hover:bg-brand-500/20"
                >
                  {post.categories.name}
                </Link>
              )}

              <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-surface-100 md:text-5xl">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-6 text-xl text-surface-400">{post.excerpt}</p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-6 border-b border-surface-800 pb-8">
                <div className="flex items-center gap-2 text-surface-400">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.published_at || post.created_at}>
                    {formatDate(post.published_at || post.created_at)}
                  </time>
                </div>
                <div className="flex items-center gap-2 text-surface-400">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} Min. Lesezeit</span>
                </div>
                <ShareButton
                  title={post.title}
                  url={`https://ghanainsider.com/de/${post.slug}`}
                />
              </div>
            </header>

            {/* Article Content */}
            <div
              className="prose-content text-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Keywords/Tags */}
            {seo?.keywords && seo.keywords.length > 0 && (
              <div className="mt-12 border-t border-surface-800 pt-8">
                <h3 className="mb-4 text-sm font-medium text-surface-400">
                  Verwandte Themen:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {seo.keywords.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="rounded-full bg-surface-800 px-4 py-1.5 text-sm text-surface-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            {/* Featured Image */}
            {post.featured_image && (
              <div className="mb-8 overflow-hidden rounded-2xl border border-surface-800">
                <div className="relative aspect-video w-full">
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <aside className="mt-16">
            <h2 className="mb-8 font-display text-2xl font-bold text-surface-100">
              Ähnliche Artikel
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/de/${related.slug}`}
                  className="group rounded-xl border border-surface-800 bg-surface-900/50 p-6 transition-all hover:border-surface-700"
                >
                  <h3 className="font-display font-semibold text-surface-100 transition-colors group-hover:text-brand-400 line-clamp-2">
                    {related.title}
                  </h3>
                  <div className="mt-3 text-sm text-surface-500">
                    {formatDate(related.published_at)}
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </article>
    </>
  );
}
