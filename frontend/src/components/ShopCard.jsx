import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Globe,
  MapPin,
  Phone,
  Star,
  Store,
} from 'lucide-react';

function getPrimaryTags(shop) {
  return String(shop.categories || shop.main_category || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function formatRating(rating, reviews) {
  if (rating == null && reviews == null) return null;
  const r = rating != null ? Number(rating).toFixed(1) : 'N/A';
  const rv = reviews != null ? `(${Number(reviews).toLocaleString()})` : '';
  return `${r} ${rv}`.trim();
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function ShopCard({ shop }) {
  const tags = getPrimaryTags(shop);
  const [imgFailed, setImgFailed] = useState(false);
  const image = shop.featured_image || null;
  const hasImage = Boolean(image) && !imgFailed;
  const ratingLabel = formatRating(shop.rating, shop.reviews);

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group glass-card overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-border-strong)]"
    >
      {/* ── Image ──────────────────────────────── */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-primary-100 via-cyan-50 to-blue-100 dark:from-primary-900/30 dark:via-slate-800 dark:to-blue-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]" />

        {hasImage ? (
          <img
            src={image}
            alt={shop.name || shop.shopName || 'Store'}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/60 bg-white/85 text-primary-600 shadow-lg shadow-primary-500/10 dark:border-white/10 dark:bg-white/10 dark:text-primary-400">
                <Store className="h-7 w-7" />
              </div>
              <p className="max-w-[11rem] truncate px-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {shop.name || shop.shopName || 'Shop'}
              </p>
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute left-4 top-4">
          <span className={shop.is_temporarily_closed ? 'badge-closed' : 'badge-open'}>
            {shop.is_temporarily_closed ? 'Closed' : 'Open'}
          </span>
        </div>
      </div>

      {/* ── Content ────────────────────────────── */}
      <div className="flex h-full flex-col p-5">
        {/* Name + address */}
        <div className="space-y-1.5">
          <h4 className="font-display text-base font-semibold leading-snug text-[var(--color-text)] line-clamp-2">
            {shop.name || shop.shopName}
          </h4>
          <p className="text-sm leading-relaxed text-[var(--color-text-muted)] line-clamp-2">
            {shop.address}
          </p>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          {tags.length > 0
            ? tags.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full border border-primary-200/60 bg-primary-50 px-2.5 py-1 font-medium text-primary-700 dark:border-primary-400/15 dark:bg-primary-400/10 dark:text-primary-300"
                >
                  {cat}
                </span>
              ))
            : (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                  Uncategorised
                </span>
              )}
        </div>

        {/* Info block */}
        <div className="mt-4 grid gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3.5 text-sm text-[var(--color-text-secondary)]">
          {ratingLabel && (
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span className="font-medium text-[var(--color-text)]">{ratingLabel}</span>
            </div>
          )}
          {shop.workday_timing && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
              <span className="min-w-0 break-words text-xs">{shop.workday_timing}</span>
            </div>
          )}
          {shop.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
              <span className="font-medium text-[var(--color-text)]">{shop.phone}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-4">
          {shop.website && (
            <motion.a
              href={shop.website}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary flex-1 py-2.5 text-xs sm:flex-none"
            >
              <Globe className="h-3.5 w-3.5" />
              Website
            </motion.a>
          )}
          {shop.link && (
            <motion.a
              href={shop.link}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-secondary flex-1 py-2.5 text-xs sm:flex-none"
            >
              Map listing
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.a>
          )}
          {!shop.website && !shop.link && (
            <span className="text-xs text-[var(--color-text-muted)]">No external links</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
