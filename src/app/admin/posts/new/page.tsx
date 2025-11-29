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
  User,
} from 'lucide-react';
import slugify from 'slugify';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';

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

export default function NewPostPage() {
  const router = useRouter();
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
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [postType, setPostType] = useState<'guest_post' | 'manual'>('guest_post');
  const [guestAuthorName, setGuestAuthorName] = useState('');
  const [guestAuthorEmail, setGuestAuthorEmail] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const catResponse = await fetch('/api/categories');
      const catData = await catResponse.json();
      if (catData.success && catData.data) {
        setCategories(catData.data);
        if (catData.data.length > 0) {
          setCategoryId(catData.data[0].id);
        }
      }

      // Fetch authors
      const authResponse = await fetch('/api/authors');
      const authData = await authResponse.json();
      if (authData.success && authData.data) {
        setAuthors(authData.data);
        const defaultAuthor = authData.data.find((a: Author) => a.is_default);
        if (defaultAuthor) {
          setAuthorId(defaultAuthor.id);
        }
      }
    } catch (error) {
      setError('Failed to load data');
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
          author_id: authorId || null,
          status: saveStatus,
          post_type: postType,
          author_name: guestAuthorName || null,
          author_email: guestAuthorEmail || null,
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
            Create New Post
          </h1>
          <p className="mt-2 text-surface-400">
            Create a new post with rich text editing
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
        {/* Main Content - Left Column (2/3) */}
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
              className="input text-lg"
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

          {/* Rich Text Editor */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              Content *
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing your content..."
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
              placeholder="Brief summary of the article (2-3 sentences)..."
              className="textarea"
              rows={3}
            />
          </div>
        </div>

        {/* Settings - Right Column (1/3) */}
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
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </button>
            </div>
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

          {/* Guest Author Info (for guest posts) */}
          {postType === 'guest_post' && (
            <div className="card p-6">
              <h3 className="mb-4 font-semibold text-surface-100">
                Guest Author Info
              </h3>

              <div className="mb-4">
                <label className="mb-2 block text-sm text-surface-400">
                  Name
                </label>
                <input
                  type="text"
                  value={guestAuthorName}
                  onChange={(e) => setGuestAuthorName(e.target.value)}
                  placeholder="John Doe"
                  className="input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-surface-400">
                  Email
                </label>
                <input
                  type="email"
                  value={guestAuthorEmail}
                  onChange={(e) => setGuestAuthorEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="input"
                />
              </div>
            </div>
          )}

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
