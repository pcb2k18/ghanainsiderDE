'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Sparkles,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
}

interface RecentPost {
  id: string;
  title: string;
  status: string;
  created_at: string;
  seo_score: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
  });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/posts?limit=5');
      const data = await response.json();
      
      if (data.success) {
        const posts = data.data || [];
        setRecentPosts(posts);
        setStats({
          totalPosts: data.pagination?.total || posts.length,
          publishedPosts: posts.filter((p: RecentPost) => p.status === 'published').length,
          draftPosts: posts.filter((p: RecentPost) => p.status === 'draft').length,
          totalViews: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-100">Dashboard</h1>
        <p className="mt-2 text-surface-400">
          Welcome to Ghana Insider DE Admin Panel
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <Link
          href="/admin/create"
          className="card-hover flex items-center gap-4 p-6"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
            <Sparkles className="h-6 w-6 text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-100">Create AI Article</h3>
            <p className="text-sm text-surface-400">
              Format content with AI assistance
            </p>
          </div>
        </Link>
        
        <Link
          href="/admin/posts/new"
          className="card-hover flex items-center gap-4 p-6"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
            <FileText className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-100">Create Guest Post</h3>
            <p className="text-sm text-surface-400">
              Manually create a new post
            </p>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-400">Total Posts</p>
              <p className="mt-1 text-3xl font-bold text-surface-100">
                {loading ? '—' : stats.totalPosts}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-800">
              <FileText className="h-6 w-6 text-surface-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-400">Published</p>
              <p className="mt-1 text-3xl font-bold text-emerald-400">
                {loading ? '—' : stats.publishedPosts}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-400">Drafts</p>
              <p className="mt-1 text-3xl font-bold text-amber-400">
                {loading ? '—' : stats.draftPosts}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-400">Views (Today)</p>
              <p className="mt-1 text-3xl font-bold text-blue-400">
                {loading ? '—' : stats.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <Eye className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="card">
        <div className="flex items-center justify-between border-b border-surface-800 p-6">
          <h2 className="text-lg font-semibold text-surface-100">
            Recent Posts
          </h2>
          <Link
            href="/admin/posts"
            className="text-sm text-brand-400 hover:text-brand-300"
          >
            View all →
          </Link>
        </div>
        
        <div className="divide-y divide-surface-800">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-6">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <div className="skeleton mb-2 h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/4" />
                </div>
              </div>
            ))
          ) : recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-surface-600" />
              <p className="text-surface-400">No posts yet</p>
              <Link
                href="/admin/create"
                className="btn-primary mt-4"
              >
                Create First Post
              </Link>
            </div>
          ) : (
            recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}`}
                className="flex items-center gap-4 p-6 transition-colors hover:bg-surface-800/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-800">
                  <FileText className="h-5 w-5 text-surface-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-medium text-surface-100">
                    {post.title}
                  </h3>
                  <p className="text-sm text-surface-500">
                    {formatDate(post.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-mono text-sm ${getSeoScoreColor(post.seo_score)}`}>
                    {post.seo_score}/100
                  </span>
                  <span
                    className={`badge ${
                      post.status === 'published'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}
                  >
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
