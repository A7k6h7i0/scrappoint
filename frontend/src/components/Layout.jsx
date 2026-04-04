import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Sparkles, X } from 'lucide-react';
import useTheme from '../hooks/useTheme';
import ThemeToggle from './ui/ThemeToggle';
import Footer from './Footer';

const navLinks = [
  { to: '/', label: 'Home' },
];

const navLinkClass = ({ isActive }) =>
  [
    'rounded-xl border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-300',
    isActive
      ? 'border-primary-500/20 bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg shadow-primary-600/15'
      : 'border-[var(--color-border-strong)] bg-[var(--color-surface-solid)] text-[var(--color-text-secondary)] hover:border-primary-300 hover:text-[var(--color-text)]',
  ].join(' ');

export default function Layout() {
  const { theme, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-[var(--color-text)]">
      {/* ── Header ────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-blue-600 text-white shadow-lg shadow-primary-600/20">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="hidden sm:block">
              <p className="section-label text-[0.65rem] tracking-[0.3em]">
                Scrap Point
              </p>
              <h1 className="font-display text-base font-bold tracking-tight text-[var(--color-text)]">
                Premium local store discovery
              </h1>
            </div>
          </motion.div>

          {/* Desktop nav */}
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 sm:flex">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <ThemeToggle theme={theme} onToggle={toggle} />
            {/* Mobile menu button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-solid)] text-[var(--color-text-secondary)] sm:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-surface-solid)] sm:hidden"
            >
              <div className="flex flex-col gap-2 p-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main (no padding — sections handle their own) ── */}
      <main className="relative z-10 w-full">
        <Outlet />
      </main>

      {/* ── Footer ────────────────────────────── */}
      <Footer />
    </div>
  );
}
