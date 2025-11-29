'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { use } from 'react';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  category_id: string | null;
  status: 'draft' | 'published' | 'archived';
  post_type: string;
  seo_score: number;
  author_name: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  categories: { name: string; slug: string } | null;
  seo_metadata: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function PostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    fetchPost();
    fetchCategories();
  }, [resolvedParams.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts?id=${resolvedParams.id}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const p = data.data;
        setPost(p);
        setTitle(p.title);
        setSlug(p.slug);
        setContent(p.content);
        setExcerpt(p.excerpt || '');
        setCategoryId(p.category_id || '');
        setStatus(p.status);
        setMetaTitle(p.seo_metadata?.meta_title || '');
        setMetaDescription(p.seo_metadata?.meta_description || '');
        setKeywords(p.seo_metadata?.keywords?.join(', ') || '');
      }
    } catch (error) {
      setError('Error loading post');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resolvedParams.id,
          title,
          slug,
          content,
          excerpt,
          category_id: categoryId || null,
          status,
          seo_metadata: {
            meta_title: metaTitle,
            meta_description: metaDescription,
            keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Changes saved!');
        setPost(data.data);
      } else {
        setError(data.error || 'Save failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts?id=${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/posts');
      }
    } catch (error) {
      setError('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <p className="text-surface-400">Post not found</p>
        <Link href="/admin/posts" className="btn-primary mt-4">
          Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-100">Edit Post</h1>
            <p className="text-sm text-surface-500">ID: {post.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {post.status === 'published' && (
            <a
              href={`https://ghanainsider.com/de/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View
            </a>
          )}
          <button
            onClick={handleDelete}
            className="btn-ghost flex items-center gap-2 text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Title */}
          <div className="card p-6">
            <label className="mb-2 block text-sm font-medium text-surface-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input text-lg font-semibold"
            />
          </div>

          {/* Slug */}
          <div className="card p-6">
            <label className="mb-2 block text-sm font-medium text-surface-300">
              URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-surface-500">/de/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="input flex-1 font-mono"
              />
            </div>
          </div>

          {/* Content */}
          <div className="card p-6">
            <label className="mb-2 block text-sm font-medium text-surface-300">
              Content (HTML)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea min-h-[500px] font-mono text-sm"
            />
          </div>

          {/* Excerpt */}
          <div className="card p-6">
            <label className="mb-2 block text-sm font-medium text-surface-300">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="textarea"
              rows={3}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Category */}
          <div className="card p-6">
            <h3 className="mb-4 font-semibold text-surface-100">Publishing</h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-surface-400">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="select"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-surface-400">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="select"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="card p-6">
            <h3 className="mb-4 font-semibold text-surface-100">SEO</h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-surface-400">
                  Meta Title ({metaTitle.length}/60)
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={60}
                  className="input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-surface-400">
                  Meta Description ({metaDescription.length}/160)
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={160}
                  className="textarea"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-surface-400">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                  className="input"
                />
              </div>

              <div className="rounded-lg bg-surface-800/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-400">SEO Score:</span>
                  <span className={`font-mono font-semibold ${
                    post.seo_score >= 80
                      ? 'text-emerald-400'
                      : post.seo_score >= 60
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}>
                    {post.seo_score}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="card p-6">
            <h3 className="mb-4 font-semibold text-surface-100">Information</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">Type:</span>
                <span className="text-surface-300">{post.post_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Created:</span>
                <span className="text-surface-300">
                  {new Date(post.created_at).toLocaleDateString('en-US')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Updated:</span>
                <span className="text-surface-300">
                  {new Date(post.updated_at).toLocaleDateString('en-US')}
                </span>
              </div>
              {post.published_at && (
                <div className="flex justify-between">
                  <span className="text-surface-500">Published:</span>
                  <span className="text-surface-300">
                    {new Date(post.published_at).toLocaleDateString('en-US')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
