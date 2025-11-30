'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  Clock,
  Archive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  post_type: string;
  seo_score: number;
  view_count: number;
  created_at: string;
  published_at: string | null;
  categories: { name: string; slug: string } | null;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const postsPerPage = 20;

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      params.set('limit', postsPerPage.toString());
      params.set('offset', ((currentPage - 1) * postsPerPage).toString());

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data || []);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== id));
        setSelectedPosts(selectedPosts.filter((selectedId) => selectedId !== id));
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedPosts.length} post${selectedPosts.length > 1 ? 's' : ''}? This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // Delete all selected posts
      const deletePromises = selectedPosts.map((id) =>
        fetch(`/api/posts?id=${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);

      // Update UI
      setPosts(posts.filter((p) => !selectedPosts.includes(p.id)));
      setSelectedPosts([]);

      alert(`Successfully deleted ${selectedPosts.length} post${selectedPosts.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Failed to delete posts:', error);
      alert('Failed to delete some posts. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="badge-success flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="badge-warning flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="badge-info flex items-center gap-1">
            <Archive className="h-3 w-3" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Select all functionality
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(filteredPosts.map((post) => post.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const isAllSelected = filteredPosts.length > 0 && selectedPosts.length === filteredPosts.length;
  const isSomeSelected = selectedPosts.length > 0 && selectedPosts.length < filteredPosts.length;

  const totalPages = Math.ceil(totalCount / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage + 1;
  const endIndex = Math.min(currentPage * postsPerPage, totalCount);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedPosts([]); // Clear selection when changing pages
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-100">Posts</h1>
          <p className="mt-2 text-surface-400">
            Manage all your articles and guest posts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/de/admin/archive" className="btn-secondary flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archive Import
          </Link>
          <Link href="/de/admin/create" className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="input pl-11"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1); // Reset to first page when filter changes
          }}
          className="select w-48"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedPosts.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-brand-500/20 bg-brand-500/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-surface-100">
              {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedPosts([])}
              className="text-sm text-surface-400 hover:text-surface-200"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-800 bg-surface-900/50">
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-surface-600 bg-surface-800"
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-surface-400">
                Title
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-surface-400">
                Category
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-surface-400">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-surface-400">
                SEO
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-surface-400">
                Date
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-surface-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="skeleton h-4 w-4" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="skeleton h-5 w-64" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="skeleton h-5 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="skeleton h-6 w-28" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="skeleton h-5 w-12" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="skeleton h-5 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="skeleton h-8 w-8 ml-auto" />
                  </td>
                </tr>
              ))
            ) : filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <p className="text-surface-500">No posts found</p>
                  <Link
                    href="/de/admin/create"
                    className="btn-primary mt-4 inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Post
                  </Link>
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="transition-colors hover:bg-surface-800/30"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts([...selectedPosts, post.id]);
                        } else {
                          setSelectedPosts(selectedPosts.filter((id) => id !== post.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-surface-600 bg-surface-800"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="font-medium text-surface-100 hover:text-brand-400"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1 truncate font-mono text-xs text-surface-500">
                        /de/{post.slug}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-surface-300">
                      {post.categories?.name || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-mono text-sm font-medium ${getSeoScoreColor(
                        post.seo_score
                      )}`}
                    >
                      {post.seo_score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 text-surface-400">
                    {formatDate(post.published_at || post.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {post.status === 'published' && (
                        <a
                          href={`https://ghanainsider.com/de/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-100"
                          title="View"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-100"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount > postsPerPage && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-surface-400">
            Showing <span className="font-medium text-surface-200">{startIndex}</span> to{' '}
            <span className="font-medium text-surface-200">{endIndex}</span> of{' '}
            <span className="font-medium text-surface-200">{totalCount}</span> posts
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-surface-500">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-brand-500 text-white'
                          : 'text-surface-300 hover:bg-surface-800'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
