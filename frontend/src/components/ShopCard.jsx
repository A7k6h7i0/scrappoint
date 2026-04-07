import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Phone, Star, Store } from 'lucide-react';

function getPrimaryTags(shop) {
  return String(shop.categories || shop.main_category || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 2);
}

function formatRating(rating) {
  if (rating == null) return '0.0';
  return Number(rating).toFixed(1);
}

function getFallbackDescription(shop, tags) {
  const location = shop.location?.address || shop.address || 'your area';
  const categoryText = tags.length > 0 ? tags.join(', ') : 'scrap pickup and resale';
  return `Trusted for ${categoryText.toLowerCase()} around ${location}. Quick contact and local pricing details available.`;
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
  const ratingLabel = formatRating(shop.rating);
  const isClosed = Boolean(shop.is_temporarily_closed);
  const description = getFallbackDescription(shop, tags);
  const primaryHref = shop.link || shop.website || null;
  const primaryLabel = shop.link ? 'View directions' : shop.website ? 'Visit website' : 'See details';

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.992 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden rounded-[2rem] border border-white/65 bg-[#d8d9d2] shadow-[0_26px_70px_rgba(40,31,22,0.10)]"
    >
      <div className="relative h-56 overflow-hidden">
        {hasImage ? (
          <img
            src={image}
            alt={shop.name || shop.shopName || 'Store'}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#7d856c_0%,#545c47_100%)]">
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] border border-white/30 bg-white/12 text-white/90 backdrop-blur-md">
              <Store className="h-9 w-9" />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,12,10,0.02)_0%,rgba(12,14,12,0.08)_45%,rgba(12,14,12,0.32)_100%)]" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            className={
              isClosed
                ? 'inline-flex items-center rounded-full bg-[rgba(0,0,0,0.82)] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white'
                : 'inline-flex items-center rounded-full bg-[rgba(58,107,54,0.88)] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white'
            }
          >
            {isClosed ? 'Closed' : 'Open'}
          </span>
        </div>

        <div className="absolute right-4 top-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/34 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md">
            <Star className="h-3.5 w-3.5 text-amber-300" />
            {ratingLabel}
          </span>

          {shop.phone && (
            <a
              href={`tel:${shop.phone}`}
              className="inline-flex min-h-[2.45rem] items-center justify-center rounded-full bg-black/34 px-4 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-black/46"
            >
              Call
            </a>
          )}
        </div>
      </div>

      <div className="bg-[linear-gradient(180deg,#505050_0%,#474747_24%,#3e3e3e_52%,#363636_78%,#2f2f2f_100%)] px-5 pb-5 pt-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="space-y-3">
          <h3 className="font-display text-[1.45rem] font-semibold uppercase leading-[1.02] tracking-[-0.03em] text-white line-clamp-2">
            {shop.name || shop.shopName || 'Scrap Shop'}
          </h3>

          <p className="font-sans text-sm leading-6 text-white/84 line-clamp-4">
            {description}
          </p>

          <div className="flex flex-wrap gap-2">
            {(tags.length > 0 ? tags : ['Local scrap']).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-white/12 px-3 py-2 font-sans text-sm text-white/88"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {shop.phone && (
              <span className="inline-flex items-center gap-2 rounded-full bg-black/14 px-3 py-2 font-sans text-xs text-white/86">
                <Phone className="h-3.5 w-3.5" />
                {shop.phone}
              </span>
            )}

            {(shop.main_category || tags[0]) && (
              <span className="inline-flex items-center gap-2 rounded-full bg-black/14 px-3 py-2 font-sans text-xs text-white/86">
                <MapPin className="h-3.5 w-3.5" />
                {shop.main_category || tags[0]}
              </span>
            )}
          </div>

          {primaryHref ? (
            <motion.a
              href={primaryHref}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.985 }}
              className="mt-2 inline-flex min-h-[3.15rem] w-full items-center justify-center gap-2 rounded-full bg-white px-5 font-sans text-[0.98rem] font-semibold text-[#171b13] shadow-[0_16px_34px_rgba(255,255,255,0.16)]"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </motion.a>
          ) : (
            <div className="mt-2 inline-flex min-h-[3.15rem] w-full items-center justify-center gap-2 rounded-full bg-white px-5 font-sans text-[0.98rem] font-semibold text-[#171b13] shadow-[0_16px_34px_rgba(255,255,255,0.16)]">
              See details
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
