import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/client';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

// Disable static generation - require runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Never cache

async function getPosts() {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories(name, slug),
        seo_metadata(meta_description)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPosts:', error);
    return [];
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function HomePage() {
  const posts = await getPosts();
  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 7);
  const olderPosts = posts.slice(7);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="mb-8 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-brand-400" />
          <h2 className="font-display text-lg font-semibold text-brand-400">
            Aktuelle Nachrichten
          </h2>
        </div>

        {featuredPost ? (
          <Link
            href={`/de/${featuredPost.slug}`}
            className="group block overflow-hidden rounded-2xl border border-surface-800 bg-surface-900/50 transition-all hover:border-surface-700"
          >
            <div className="p-8 md:p-12">
              {featuredPost.categories && (
                <span className="inline-block rounded-full bg-brand-500/10 px-3 py-1 text-sm font-medium text-brand-400">
                  {featuredPost.categories.name}
                </span>
              )}
              <h1 className="mt-4 font-display text-3xl font-bold text-surface-100 transition-colors group-hover:text-brand-400 md:text-4xl">
                {featuredPost.title}
              </h1>
              <p className="mt-4 text-lg text-surface-400 line-clamp-3">
                {featuredPost.excerpt}
              </p>
              <div className="mt-6 flex items-center gap-4 text-sm text-surface-500">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(featuredPost.published_at || featuredPost.created_at)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />3 Min. Lesezeit
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-surface-800 bg-surface-900/50 p-12 text-center">
            <p className="text-surface-400">Noch keine Beiträge verfügbar</p>
          </div>
        )}
      </section>

      {/* Recent Posts Grid */}
      {recentPosts.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 font-display text-2xl font-bold text-surface-100">
            Neueste Artikel
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <article
                key={post.id}
                className="group overflow-hidden rounded-xl border border-surface-800 bg-surface-900/50 transition-all hover:border-surface-700"
              >
                <Link href={`/de/${post.slug}`} className="block p-6">
                  {post.categories && (
                    <span className="text-xs font-medium uppercase tracking-wider text-brand-400">
                      {post.categories.name}
                    </span>
                  )}
                  <h3 className="mt-3 font-display text-lg font-semibold text-surface-100 transition-colors group-hover:text-brand-400 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm text-surface-400 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 text-sm text-surface-500">
                    {formatDate(post.published_at || post.created_at)}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Older Posts */}
      {olderPosts.length > 0 && (
        <section>
          <h2 className="mb-8 font-display text-2xl font-bold text-surface-100">
            Weitere Artikel
          </h2>
          <div className="divide-y divide-surface-800 rounded-xl border border-surface-800">
            {olderPosts.map((post) => (
              <article key={post.id}>
                <Link
                  href={`/de/${post.slug}`}
                  className="group flex items-center gap-6 p-6 transition-colors hover:bg-surface-900/50"
                >
                  <div className="flex-1 min-w-0">
                    {post.categories && (
                      <span className="text-xs font-medium uppercase tracking-wider text-brand-400">
                        {post.categories.name}
                      </span>
                    )}
                    <h3 className="mt-1 font-display text-lg font-semibold text-surface-100 transition-colors group-hover:text-brand-400">
                      {post.title}
                    </h3>
                  </div>
                  <div className="text-sm text-surface-500 whitespace-nowrap">
                    {formatDate(post.published_at || post.created_at)}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
