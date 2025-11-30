'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Archive,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Upload,
} from 'lucide-react';

interface ImportRecord {
  id: string;
  archive_url: string;
  original_url: string;
  import_status: 'pending' | 'processing' | 'completed' | 'failed';
  post_id: string | null;
  error_message: string | null;
  created_at: string;
  posts?: {
    title: string;
    slug: string;
    status: string;
  } | null;
}

export default function ArchiveImportPage() {
  const [archiveUrl, setArchiveUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchImports();
  }, []);

  const fetchImports = async () => {
    try {
      const response = await fetch('/api/archive/import');
      const data = await response.json();
      if (data.success) {
        setImports(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch imports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!archiveUrl.trim()) {
      setError('Please enter an Archive.org URL');
      return;
    }

    if (!archiveUrl.includes('web.archive.org')) {
      setError('Invalid URL format. Please use an Archive.org URL');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/archive/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archiveUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Import successful! The post has been saved as a draft.');
        setArchiveUrl('');
        fetchImports();
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />;
      default:
        return <Clock className="h-4 w-4 text-surface-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-surface-100">
            <Archive className="h-8 w-8 text-brand-400" />
            Archive.org Import
          </h1>
          <p className="mt-2 text-surface-400">
            Recover your old posts from Archive.org Wayback Machine
          </p>
        </div>
        <Link href="/de/admin/archive/bulk" className="btn-secondary flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Bulk Import
        </Link>
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

      {/* Import Form */}
      <div className="card mb-8 p-6">
        <h2 className="mb-4 text-lg font-semibold text-surface-100">
          Start New Import
        </h2>
        <p className="mb-6 text-sm text-surface-400">
          Paste an Archive.org URL to import the content and save it as a draft.
        </p>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
            <input
              type="url"
              value={archiveUrl}
              onChange={(e) => setArchiveUrl(e.target.value)}
              placeholder="https://web.archive.org/web/20250115124628/https://ghanainsider.com/de/..."
              className="input pl-11 font-mono text-sm"
            />
          </div>
          <button
            onClick={handleImport}
            disabled={importing}
            className="btn-primary flex items-center gap-2"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                Import
              </>
            )}
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-surface-800/50 p-4">
          <h3 className="mb-2 text-sm font-medium text-surface-300">
            URL Format Example:
          </h3>
          <code className="block text-xs text-surface-400 break-all">
            https://web.archive.org/web/20250115124628/https://ghanainsider.com/de/index.php/article-slug/
          </code>
        </div>
      </div>

      {/* Import History */}
      <div className="card">
        <div className="flex items-center justify-between border-b border-surface-800 p-6">
          <h2 className="text-lg font-semibold text-surface-100">
            Import History
          </h2>
          <button
            onClick={fetchImports}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="divide-y divide-surface-800">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-6">
                <div className="skeleton h-4 w-4 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton mb-2 h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/4" />
                </div>
              </div>
            ))
          ) : imports.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Archive className="mb-4 h-12 w-12 text-surface-600" />
              <p className="text-surface-400">No imports yet</p>
              <p className="mt-1 text-sm text-surface-500">
                Start your first import above
              </p>
            </div>
          ) : (
            imports.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-4 p-6 transition-colors hover:bg-surface-800/30"
              >
                {getStatusIcon(record.import_status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {record.posts && record.post_id ? (
                      <Link
                        href={`/admin/posts/${record.post_id}`}
                        className="font-medium text-surface-100 hover:text-brand-400"
                      >
                        {record.posts.title}
                      </Link>
                    ) : (
                      <span className="truncate font-mono text-sm text-surface-300">
                        {record.original_url}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-surface-500">
                    <span>{formatDate(record.created_at)}</span>
                    <span className="flex items-center gap-1">
                      {getStatusText(record.import_status)}
                    </span>
                    {record.error_message && (
                      <span className="text-red-400">{record.error_message}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={record.archive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-100"
                    title="Open in Archive.org"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Batch Import Info */}
      <div className="mt-8 rounded-lg border border-surface-800 bg-surface-900/30 p-6">
        <h3 className="mb-2 font-semibold text-surface-100">
          💡 Tip: Batch Import
        </h3>
        <p className="text-sm text-surface-400">
          To import multiple pages at once, you can use the Archive.org Wayback Machine CDX API. 
          Contact us for a batch import script.
        </p>
      </div>
    </div>
  );
}
