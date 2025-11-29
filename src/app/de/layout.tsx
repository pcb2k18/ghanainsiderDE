import Link from 'next/link';
import { ReactNode } from 'react';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/de" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
                <span className="text-lg font-bold text-white">G</span>
              </div>
              <span className="font-display text-xl font-bold text-surface-100">
                Ghana Insider
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden items-center gap-8 md:flex">
              <Link
                href="/de"
                className="text-sm font-medium text-surface-400 transition-colors hover:text-surface-100"
              >
                Startseite
              </Link>
              <Link
                href="/de/kategorie/tod"
                className="text-sm font-medium text-surface-400 transition-colors hover:text-surface-100"
              >
                Nachruf
              </Link>
              <Link
                href="/de/kategorie/breaking-news"
                className="text-sm font-medium text-surface-400 transition-colors hover:text-surface-100"
              >
                Breaking News
              </Link>
              <Link
                href="/de/kategorie/hochzeit"
                className="text-sm font-medium text-surface-400 transition-colors hover:text-surface-100"
              >
                Hochzeit
              </Link>
            </nav>

            {/* Language Switcher */}
            <div className="flex items-center gap-4">
              <select className="rounded-lg bg-surface-800 px-3 py-1.5 text-sm text-surface-300 border border-surface-700">
                <option value="de">🇩🇪 Deutsch</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-surface-800 bg-surface-900/50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            {/* About */}
            <div className="md:col-span-2">
              <Link href="/de" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
                  <span className="text-lg font-bold text-white">G</span>
                </div>
                <span className="font-display text-xl font-bold text-surface-100">
                  Ghana Insider
                </span>
              </Link>
              <p className="mt-4 max-w-md text-sm text-surface-400">
                Ihre Quelle für aktuelle Nachrichten, Promi-News und Breaking
                Stories aus Ghana und der Welt. Täglich aktualisiert.
              </p>
            </div>

            {/* Categories */}
            <div>
              <h3 className="mb-4 font-semibold text-surface-100">Kategorien</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/de/kategorie/tod"
                    className="text-sm text-surface-400 hover:text-surface-100"
                  >
                    Nachruf & Tod
                  </Link>
                </li>
                <li>
                  <Link
                    href="/de/kategorie/breaking-news"
                    className="text-sm text-surface-400 hover:text-surface-100"
                  >
                    Breaking News
                  </Link>
                </li>
                <li>
                  <Link
                    href="/de/kategorie/hochzeit"
                    className="text-sm text-surface-400 hover:text-surface-100"
                  >
                    Hochzeit
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="mb-4 font-semibold text-surface-100">Rechtliches</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/de/impressum"
                    className="text-sm text-surface-400 hover:text-surface-100"
                  >
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link
                    href="/de/datenschutz"
                    className="text-sm text-surface-400 hover:text-surface-100"
                  >
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link
                    href="/de/kontakt"
                    className="text-sm text-surface-400 hover:text-surface-100"
                  >
                    Kontakt
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-surface-800 pt-8 text-center text-sm text-surface-500">
            © {new Date().getFullYear()} Ghana Insider. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}
