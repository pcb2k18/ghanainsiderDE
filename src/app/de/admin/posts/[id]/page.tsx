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
  User,
} from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  category_id: string | null;
  author_id: string | null;
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

interface Author {
  id: string;
  name: string;
  email: string;
  is_default: boolean;
}

export default function PostEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      // Fetch post
      const postResponse = await fetch(`/api/posts?id=${params.id}`);
      const postData = await postResponse.json();

      if (postData.success && postData.data) {
        const p = postData.data;
        setPost(p);
        setTitle(p.title);
        setSlug(p.slug);
        setContent(p.content);
        setExcerpt(p.excerpt || '');
        setFeaturedImage(p.featured_image || '');
        setCategoryId(p.category_id || '');
        setAuthorId(p.author_id || '');
        setStatus(p.status);
        setMetaTitle(p.seo_metadata?.meta_title || '');
        setMetaDescription(p.seo_metadata?.meta_description || '');
        setKeywords(p.seo_metadata?.keywords?.join(', ') || '');
      }

      // Fetch categories
      const catResponse = await fetch('/api/categories');
      const catData = await catResponse.json();
      if (catData.success) {
        setCategories(catData.data);
      }

      // Fetch authors
      const authResponse = await fetch('/api/authors');
      const authData = await authResponse.json();
      if (authData.success && authData.data) {
        setAuthors(authData.data);
      }
    } catch (error) {
      setError('Error loading post');
    } finally {
      setLoading(false);
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
          id: params.id,
          title,
          slug,
          content,
          excerpt,
          featured_image: featuredImage || null,
          category_id: categoryId || null,
          author_id: authorId || null,
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
        setSuccess('Changes saved successfully!');
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
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts?id=${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        router.push('/de/admin/posts');
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-surface-100">Post not found</h2>
        <Link href="/de/admin/posts" className="btn-ghost mt-4">
          Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/de/admin/posts"
            className="mb-4 inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Link>
          <h1 className="text-3xl font-bold text-surface-100">Edit Post</h1>
          <p className="mt-2 text-surface-400">
            Last updated: {new Date(post.updated_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/de/${post.slug}`}
            target="_blank"
            className="btn-ghost flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View
          </Link>
          <button
            onClick={handleDelete}
            className="btn-ghost flex items-center gap-2 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete
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

      {/* Form */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Content - Left Column (2/3) */}
        <div className="col-span-2 space-y-6">
          {/* Title */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input text-lg"
            />
          </div>

          {/* URL Slug */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              URL Slug
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500">
                /de/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="input pl-12 font-mono"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              Content
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Edit your content..."
              minHeight="500px"
            />
          </div>

          {/* Excerpt */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary..."
              className="textarea"
              rows={3}
            />
          </div>
        </div>

        {/* Settings - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="card p-6">
            <h3 className="mb-4 font-semibold text-surface-100">Actions</h3>

            <div className="mb-4">
              <label className="mb-3 block text-sm font-medium text-surface-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="select"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span className="ml-2">Save Changes</span>
                </>
              )}
            </button>
          </div>

          {/* Featured Image */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              Featured Image
            </label>
            <ImageUpload value={featuredImage} onChange={setFeaturedImage} />
          </div>

          {/* Category */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="select"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Author */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Author
              </div>
            </label>
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="select"
            >
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name} {author.is_default && '(Default)'}
                </option>
              ))}
            </select>
          </div>

          {/* SEO Metadata */}
          <div className="card p-6">
            <h3 className="mb-4 font-semibold text-surface-100">SEO Metadata</h3>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-surface-400">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="input"
                maxLength={60}
              />
              <p className="mt-1 text-xs text-surface-500">
                {metaTitle.length}/60 chars
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-surface-400">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="textarea"
                rows={3}
                maxLength={160}
              />
              <p className="mt-1 text-xs text-surface-500">
                {metaDescription.length}/160 chars
              </p>
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
          </div>

          {/* Post Info */}
          <div className="card p-6">
            <h3 className="mb-4 font-semibold text-surface-100">Post Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-surface-500">Type:</span>
                <span className="ml-2 text-surface-200">{post.post_type}</span>
              </div>
              <div>
                <span className="text-surface-500">SEO Score:</span>
                <span className="ml-2 text-surface-200">{post.seo_score}/100</span>
              </div>
              <div>
                <span className="text-surface-500">Created:</span>
                <span className="ml-2 text-surface-200">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              {post.published_at && (
                <div>
                  <span className="text-surface-500">Published:</span>
                  <span className="ml-2 text-surface-200">
                    {new Date(post.published_at).toLocaleDateString()}
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
