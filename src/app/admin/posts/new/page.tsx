'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import slugify from 'slugify';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewPostPage() {
  const router = useRouter();
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
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [postType, setPostType] = useState<'guest_post' | 'manual'>('guest_post');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success && data.data) {
        setCategories(data.data);
        if (data.data.length > 0) {
          setCategoryId(data.data[0].id);
        }
      }
    } catch (error) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    const slug = slugify(text, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    })
      .replace(/[äÄ]/g, 'ae')
      .replace(/[öÖ]/g, 'oe')
      .replace(/[üÜ]/g, 'ue')
      .replace(/ß/g, 'ss');

    setSlug(slug);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug) {
      generateSlug(value);
    }
  };

  const handleSave = async (saveStatus: 'draft' | 'published') => {
    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!slug.trim()) {
      setError('URL slug is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const keywordsArray = keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          featured_image: featuredImage || null,
          category_id: categoryId || null,
          status: saveStatus,
          post_type: postType,
          author_name: authorName || null,
          author_email: authorEmail || null,
          seo_score: 0,
          seo_metadata: {
            meta_title: metaTitle || title,
            meta_description: metaDescription || excerpt,
            keywords: keywordsArray,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(
          saveStatus === 'published'
            ? 'Post published successfully!'
            : 'Draft saved successfully!'
        );
        setTimeout(() => {
          router.push(`/admin/posts/${data.data.id}`);
        }, 1500);
      } else {
        setError(data.error || 'Save failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-surface-100">
            <FileText className="h-8 w-8 text-brand-400" />
            Create Guest Post
          </h1>
          <p className="mt-2 text-surface-400">
            Manually create a new post (for guest posts or manual content)
          </p>
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
        {/* Main Content - Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Title */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title..."
              className="input"
            />
          </div>

          {/* URL Slug */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              URL Slug *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500">
                /de/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-friendly-slug"
                className="input pl-12 font-mono"
              />
            </div>
            <button
              onClick={() => generateSlug(title)}
              className="btn-ghost mt-2 text-sm"
            >
              Generate from title
            </button>
          </div>

          {/* Content Editor */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              Content * (HTML)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<h2>Your content here...</h2>"
              className="textarea min-h-[400px] font-mono text-sm"
            />
            <p className="mt-2 text-sm text-surface-500">
              Accepts HTML. Use H2 tags for sections.
            </p>
          </div>

          {/* Excerpt */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the article (2-3 sentences)..."
              className="textarea"
              rows={3}
            />
          </div>
        </div>

        {/* Settings - Right Column */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="card p-6">
            <h3 className="mb-4 font-semibold text-surface-100">Publish</h3>

            <div className="mb-4">
              <label className="mb-3 block text-sm font-medium text-surface-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="select"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-3 block text-sm font-medium text-surface-300">
                Post Type
              </label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as 'guest_post' | 'manual')}
                className="select"
              >
                <option value="guest_post">Guest Post</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="btn-secondary flex-1"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span className="ml-2">Save Draft</span>
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                <span className="ml-2">Publish</span>
              </button>
            </div>
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
              {categories.length === 0 ? (
                <option>No categories available</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
            {categories.length === 0 && (
              <p className="mt-2 text-sm text-amber-400">
                ⚠️ Please set up categories in the database
              </p>
            )}
          </div>

          {/* Author Info */}
          <div className="card p-6">
            <h3 className="mb-4 font-semibold text-surface-100">
              Guest Author (Optional)
            </h3>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-surface-400">
                Author Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="John Doe"
                className="input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-surface-400">
                Author Email
              </label>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="john@example.com"
                className="input"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              Featured Image URL
            </label>
            <input
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="input"
            />
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
                placeholder="Auto-generated from title"
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
                placeholder="Auto-generated from excerpt"
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
        </div>
      </div>
    </div>
  );
}
