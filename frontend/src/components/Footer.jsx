import { motion } from 'framer-motion';
import { Code2, Heart, MessageSquare, Sparkles } from 'lucide-react';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Search shops', href: '/' },
      { label: 'Add a listing', href: '/' },
      { label: 'Categories', href: '/' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'API docs', href: '#' },
      { label: 'Status page', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-8 overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Gradient accent line */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />

      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-primary-200/10 blur-[80px] dark:bg-primary-400/4" />
        <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-blue-200/8 blur-[80px] dark:bg-blue-400/3" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-blue-600 text-white shadow-lg shadow-primary-600/20">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-display text-base font-bold text-[var(--color-text)]">Scrap Point</p>
                <p className="text-xs text-[var(--color-text-muted)]">Premium local store discovery</p>
              </div>
            </motion.div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Discover the closest scrap shops near you with live location search, smart filtering, and distance-ranked results.
            </p>
            {/* Social icons */}
            <div className="mt-5 flex gap-3">
              {[
                { icon: Code2, href: '#', label: 'GitHub' },
                { icon: MessageSquare, href: '#', label: 'Twitter' },
              ].map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-solid)] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="font-display text-sm font-semibold text-[var(--color-text)]">
                {group.title}
              </p>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6 sm:flex-row">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} Scrap Point. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            Built with <Heart className="h-3 w-3 text-red-500" /> using React & Vite
          </p>
        </div>
      </div>
    </footer>
  );
}
