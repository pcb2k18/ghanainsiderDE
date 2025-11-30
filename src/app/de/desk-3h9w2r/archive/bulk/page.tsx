'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';

interface ImportResult {
  url: string;
  status: 'pending' | 'success' | 'skipped' | 'error';
  message?: string;
  post?: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function BulkArchiveImportPage() {
  const [urls, setUrls] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const urlList = urls
    .split('\n')
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  const validUrls = urlList.filter((url) =>
    url.includes('web.archive.org') && url.includes('ghanainsider.com')
  );

  const handleImport = async () => {
    if (validUrls.length === 0) return;

    setImporting(true);
    setResults([]);
    setCurrentIndex(0);

    // Initialize results
    const initialResults: ImportResult[] = validUrls.map((url) => ({
      url,
      status: 'pending',
    }));
    setResults(initialResults);

    // Import one by one
    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];
      setCurrentIndex(i + 1);

      try {
        const response = await fetch('/api/archive/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archiveUrl: url }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          initialResults[i] = {
            url,
            status: 'success',
            message: `Imported: ${data.data.post.title}`,
            post: data.data.post,
          };
        } else if (response.status === 409) {
          // Duplicate
          initialResults[i] = {
            url,
            status: 'skipped',
            message: data.message || 'Already exists',
          };
        } else {
          initialResults[i] = {
            url,
            status: 'error',
            message: data.error || 'Import failed',
          };
        }
      } catch (error) {
        initialResults[i] = {
          url,
          status: 'error',
          message: error instanceof Error ? error.message : 'Network error',
        };
      }

      setResults([...initialResults]);
    }

    setImporting(false);
  };

  const downloadResults = () => {
    const csv = [
      'URL,Status,Message,Post Title,Post Slug',
      ...results.map((r) =>
        [
          r.url,
          r.status,
          r.message || '',
          r.post?.title || '',
          r.post?.slug || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-import-results-${Date.now()}.csv`;
    a.click();
  };

  const successCount = results.filter((r) => r.status === 'success').length;
  const skippedCount = results.filter((r) => r.status === 'skipped').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/de/desk-3h9w2r/archive"
          className="inline-flex items-center gap-2 text-surface-400 hover:text-surface-100 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Archive Import
        </Link>
        <h1 className="text-3xl font-bold mb-2">Bulk Archive Import</h1>
        <p className="text-surface-400">
          Import multiple posts from archive.org at once
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Archive URLs</h2>
            <p className="text-sm text-surface-400 mb-4">
              Paste archive.org URLs, one per line:
            </p>

            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://web.archive.org/web/.../ghanainsider.com/de/..."
              className="input min-h-[300px] font-mono text-sm"
              disabled={importing}
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-surface-400">
                {urlList.length > 0 && (
                  <>
                    <span className="text-surface-100 font-semibold">
                      {validUrls.length}
                    </span>{' '}
                    valid URLs
                    {validUrls.length !== urlList.length && (
                      <span className="text-amber-400 ml-2">
                        ({urlList.length - validUrls.length} invalid)
                      </span>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={handleImport}
                disabled={importing || validUrls.length === 0}
                className="btn-primary flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {importing ? `Importing ${currentIndex}/${validUrls.length}...` : 'Start Import'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Import Results</h2>
              {results.length > 0 && !importing && (
                <button
                  onClick={downloadResults}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download CSV
                </button>
              )}
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 text-surface-400">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Results will appear here after import starts</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-2xl font-bold text-emerald-400">
                      {successCount}
                    </div>
                    <div className="text-xs text-surface-400">Success</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="text-2xl font-bold text-amber-400">
                      {skippedCount}
                    </div>
                    <div className="text-xs text-surface-400">Skipped</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="text-2xl font-bold text-red-400">
                      {errorCount}
                    </div>
                    <div className="text-xs text-surface-400">Failed</div>
                  </div>
                </div>

                {/* Progress */}
                {importing && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-surface-400">Progress</span>
                      <span className="text-surface-100 font-semibold">
                        {currentIndex} / {validUrls.length}
                      </span>
                    </div>
                    <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{
                          width: `${(currentIndex / validUrls.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Results List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.status === 'success'
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : result.status === 'skipped'
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : result.status === 'error'
                          ? 'bg-red-500/5 border-red-500/20'
                          : 'bg-surface-800/50 border-surface-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {result.status === 'success' && (
                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                          )}
                          {result.status === 'skipped' && (
                            <AlertCircle className="h-5 w-5 text-amber-400" />
                          )}
                          {result.status === 'error' && (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                          {result.status === 'pending' && (
                            <div className="h-5 w-5 rounded-full border-2 border-surface-600 border-t-surface-400 animate-spin" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono text-surface-400 truncate">
                            {result.url.replace('https://web.archive.org/web/', '').substring(0, 80)}...
                          </p>
                          {result.message && (
                            <p className="text-sm mt-1">{result.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
