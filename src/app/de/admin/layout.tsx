import Link from 'next/link';
import { ReactNode } from 'react';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Archive,
  Users,
  Settings,
  ExternalLink,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/posts', icon: FileText, label: 'Posts' },
  { href: '/admin/create', icon: Sparkles, label: 'AI Create' },
  { href: '/admin/archive', icon: Archive, label: 'Archive Import' },
  { href: '/admin/agencies', icon: Users, label: 'Agencies' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-surface-800 bg-surface-900/50 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-surface-800 px-6">
          <Link href="/de/admin" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
              <span className="text-lg font-bold text-white">G</span>
            </div>
            <div>
              <span className="font-display text-lg font-semibold text-surface-100">
                Ghana Insider
              </span>
              <span className="block text-xs text-surface-500">DE Admin</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-surface-400 transition-all hover:bg-surface-800/50 hover:text-surface-100 [&.active]:bg-brand-500/10 [&.active]:text-brand-400"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* View Site Link */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-surface-800 p-4">
          <a
            href="https://ghanainsider.com/de"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-surface-800/50 px-4 py-2.5 text-sm text-surface-400 transition-all hover:bg-surface-800 hover:text-surface-100"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Site</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
