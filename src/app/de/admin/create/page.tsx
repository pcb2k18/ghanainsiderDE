'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface FormattedContent {
  title: string;
  meta_title: string;
  meta_description: string;
  slug: string;
  content: string;
  excerpt: string;
  keywords: string[];
  featured_image_suggestion: string;
  schema_markup: object;
  seo_score: number;
  seo_suggestions: string[];
}

interface SeoCheck {
  name: string;
  passed: boolean;
  points: number;
}

export default function AICreatePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [rawContent, setRawContent] = useState<string>('');
  const [formattedContent, setFormattedContent] = useState<FormattedContent | null>(null);
  const [seoChecks, setSeoChecks] = useState<SeoCheck[]>([]);
  const [isFormatting, setIsFormatting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
        if (data.data.length > 0) {
          setSelectedCategory(data.data[0].slug);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleFormat = async () => {
    if (!rawContent.trim()) {
      setError('Please paste raw content first');
      return;
    }

    setIsFormatting(true);
    setError(null);
    setFormattedContent(null);

    try {
      const response = await fetch('/api/ai/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent,
          categorySlug: selectedCategory,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormattedContent(data.data);
        setSeoChecks(data.seo_checks || []);
      } else {
        setError(data.error || 'Formatting failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsFormatting(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formattedContent) return;

    setIsSaving(true);
    setError(null);

    try {
      const category = categories.find((c) => c.slug === selectedCategory);
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formattedContent.title,
          slug: formattedContent.slug,
          content: formattedContent.content,
          excerpt: formattedContent.excerpt,
          category_id: category?.id,
          status,
          post_type: 'ai_assisted',
          seo_score: formattedContent.seo_score,
          original_source: rawContent.substring(0, 500),
          seo_metadata: {
            meta_title: formattedContent.meta_title,
            meta_description: formattedContent.meta_description,
            keywords: formattedContent.keywords,
            schema_markup: formattedContent.schema_markup,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(
          status === 'published'
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
      setIsSaving(false);
    }
  };

  const handleCopyContent = () => {
    if (formattedContent) {
      navigator.clipboard.writeText(formattedContent.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500';
    if (score >= 60) return 'text-amber-400 border-amber-500';
    return 'text-red-400 border-red-500';
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-surface-100">
          <Sparkles className="h-8 w-8 text-brand-400" />
          AI Article Creator
        </h1>
        <p className="mt-2 text-surface-400">
          Paste unstructured content and let AI create an SEO-optimized German article
        </p>
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

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Category Selection */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              Select Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select pr-10"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 text-sm text-surface-500">
              {categories.find((c) => c.slug === selectedCategory)?.description}
            </p>
          </div>

          {/* Raw Content Input */}
          <div className="card p-6">
            <label className="mb-3 block text-sm font-medium text-surface-300">
              Paste Raw Content
            </label>
            <textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Copy and paste unformatted text from your source here..."
              className="textarea min-h-[400px] font-mono text-sm"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-surface-500">
                {rawContent.length.toLocaleString()} characters
              </span>
              <button
                onClick={handleFormat}
                disabled={isFormatting || !rawContent.trim()}
                className="btn-primary flex items-center gap-2"
              >
                {isFormatting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Formatting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Format with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          {/* SEO Score */}
          {formattedContent && (
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-surface-100">
                  SEO Score
                </h3>
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-4 ${getSeoScoreColor(
                    formattedContent.seo_score
                  )}`}
                >
                  <span className="text-2xl font-bold">
                    {formattedContent.seo_score}
                  </span>
                </div>
              </div>

              {/* SEO Checks */}
              <div className="mt-6 space-y-2">
                {seoChecks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-surface-800/50 px-4 py-2"
                  >
                    <div className="flex items-center gap-3">
                      {check.passed ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-surface-500" />
                      )}
                      <span
                        className={
                          check.passed ? 'text-surface-200' : 'text-surface-500'
                        }
                      >
                        {check.name}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-sm ${
                        check.passed ? 'text-emerald-400' : 'text-surface-600'
                      }`}
                    >
                      +{check.points}
                    </span>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              {formattedContent.seo_suggestions.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-medium text-surface-300">
                    Improvement Suggestions:
                  </h4>
                  <ul className="space-y-2">
                    {formattedContent.seo_suggestions.map((suggestion, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-surface-400"
                      >
                        <span className="text-brand-400">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Preview Card */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-surface-800 p-4">
              <h3 className="font-semibold text-surface-100">Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn-ghost flex items-center gap-2 text-sm"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      HTML
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Preview
                    </>
                  )}
                </button>
                {formattedContent && (
                  <button
                    onClick={handleCopyContent}
                    className="btn-ghost flex items-center gap-2 text-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[600px] overflow-auto p-6">
              {!formattedContent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Sparkles className="mb-4 h-12 w-12 text-surface-700" />
                  <p className="text-surface-500">
                    Formatted content will appear here
                  </p>
                </div>
              ) : showPreview ? (
                <div className="space-y-6">
                  {/* Meta Info */}
                  <div className="space-y-3 rounded-lg bg-surface-800/50 p-4">
                    <div>
                      <span className="text-xs text-surface-500">URL Slug:</span>
                      <p className="font-mono text-sm text-brand-400">
                        /de/{formattedContent.slug}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-surface-500">Title Tag:</span>
                      <p className="text-sm text-surface-200">
                        {formattedContent.meta_title}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-surface-500">
                        Meta Description:
                      </span>
                      <p className="text-sm text-surface-200">
                        {formattedContent.meta_description}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-surface-500">Keywords:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {formattedContent.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-surface-700 px-2 py-0.5 text-xs text-surface-300"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="prose-content">
                    <h1 className="text-2xl font-bold text-surface-100">
                      {formattedContent.title}
                    </h1>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formattedContent.content,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <pre className="content-editor whitespace-pre-wrap rounded-lg bg-surface-800/50 p-4 text-surface-300">
                  {formattedContent.content}
                </pre>
              )}
            </div>

            {/* Actions */}
            {formattedContent && (
              <div className="flex items-center justify-end gap-3 border-t border-surface-800 p-4">
                <button
                  onClick={handleFormat}
                  disabled={isFormatting}
                  className="btn-ghost flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </button>
                <button
                  onClick={() => handleSave('draft')}
                  disabled={isSaving}
                  className="btn-secondary flex items-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSave('published')}
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Publish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
