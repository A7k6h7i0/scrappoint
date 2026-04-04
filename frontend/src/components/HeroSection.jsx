import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  PlusCircle,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import shopHero from '../assets/shop-hero.svg';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function HeroMetric({ label, value, icon: Icon, tone = 'teal' }) {
  const tones = {
    teal: 'border-primary-200/50 bg-gradient-to-br from-primary-50 to-emerald-50 text-primary-700 dark:border-primary-400/10 dark:from-primary-950/40 dark:to-emerald-950/30 dark:text-primary-300',
    blue: 'border-blue-200/50 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 dark:border-blue-400/10 dark:from-blue-950/40 dark:to-cyan-950/30 dark:text-blue-300',
    slate: 'border-slate-200/60 bg-gradient-to-br from-slate-50 to-white text-slate-700 dark:border-slate-600/30 dark:from-slate-800/60 dark:to-slate-900/60 dark:text-slate-300',
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-label text-[0.65rem]">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {value}
          </p>
        </div>
        <Icon className="h-5 w-5 shrink-0 opacity-50" />
      </div>
    </div>
  );
}

export default function HeroSection({
  search,
  onSearchChange,
  locationStatus,
  locationError,
  onRetryLocation,
  radiusKm,
  onRadiusChange,
  currentPage,
  totalPages,
  allShopsCount,
  nearbyShopsCount,
  onOpenAddShop,
  heroImage,
}) {
  const heroRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    heroRef.current.style.setProperty('--spot-x', `${x}%`);
    heroRef.current.style.setProperty('--spot-y', `${y}%`);
  }, []);

  const locationLabel =
    locationStatus === 'ready'
      ? 'Live location active'
      : locationStatus === 'loading'
        ? 'Checking location…'
        : 'Manual search mode';

  return (
    <motion.section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="relative overflow-hidden glass-card border-[var(--color-border)]"
      style={{
        '--spot-x': '50%',
        '--spot-y': '50%',
      }}
    >
      {/* Mouse-following spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(600px circle at var(--spot-x) var(--spot-y), var(--color-accent-glow), transparent 55%)',
        }}
      />

      {/* Floating background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-8 h-56 w-56 animate-float rounded-full bg-primary-300/20 blur-3xl dark:bg-primary-400/8" />
        <div className="absolute right-[-3rem] top-28 h-64 w-64 animate-float-delayed rounded-full bg-blue-300/15 blur-3xl dark:bg-blue-400/6" />
        <div className="absolute bottom-[-4rem] left-1/3 h-72 w-72 animate-float rounded-full bg-cyan-200/12 blur-3xl dark:bg-cyan-400/4" />
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
        {/* ── Left Column ─────────────────────────── */}
        <motion.div variants={staggerVariants} className="relative space-y-6 p-6 sm:p-8 lg:p-10">
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-primary-200/50 bg-primary-50/80 px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm backdrop-blur-sm dark:border-primary-400/15 dark:bg-primary-400/10 dark:text-primary-300"
          >
            <Sparkles className="h-4 w-4" />
            Nearby scrap shops based on your location
          </motion.div>

          {/* Heading */}
          <div className="space-y-4">
            <motion.h2
              variants={itemVariants}
              className="font-display max-w-2xl text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl xl:text-[3.5rem] xl:leading-[1.1]"
            >
              Discover the closest{' '}
              <span className="text-gradient">scrap shops</span>{' '}
              with a premium search flow.
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="max-w-xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg"
            >
              We fetch the live scrap catalog and rank the best matches
              automatically so the most useful stores rise to the top.
            </motion.p>
          </div>

          {/* Search bar with location button */}
          <motion.div variants={itemVariants} className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="flex items-center gap-3 rounded-xl border-[1.5px] border-[var(--color-border-strong)] bg-[var(--color-surface-solid)] px-4 py-3 shadow-sm transition-all duration-200 focus-within:border-[var(--color-accent)] focus-within:shadow-[0_0_0_4px_var(--color-accent-glow)]">
              <Search className="h-5 w-5 text-[var(--color-accent)]" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by store, address, category..."
                className="w-full bg-transparent text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
              />
            </label>
            <motion.button
              type="button"
              onClick={onRetryLocation}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
            >
              <RefreshCw className="h-4 w-4" />
              Use my location
            </motion.button>
          </motion.div>

          {/* Filters row */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-solid)] px-4 py-2.5 text-sm text-[var(--color-text-secondary)] shadow-sm">
              Radius
              <select
                value={radiusKm}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className="bg-transparent font-semibold text-[var(--color-text)] outline-none"
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </label>
            <span className="inline-flex items-center rounded-xl border border-primary-200/50 bg-primary-50/80 px-3 py-2 text-sm font-medium text-primary-700 dark:border-primary-400/15 dark:bg-primary-400/10 dark:text-primary-300">
              Page {currentPage} of {totalPages}
            </span>
          </motion.div>

          {/* Status pills */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-solid)] px-3 py-1.5 text-[var(--color-text-secondary)] shadow-sm">
              {locationLabel}
            </span>
            {locationStatus === 'ready' && (
              <span className="rounded-full border border-primary-200/50 bg-primary-50 px-3 py-1.5 text-primary-700 shadow-sm dark:border-primary-400/15 dark:bg-primary-400/10 dark:text-primary-300">
                ✓ Using your live location
              </span>
            )}
            {locationError && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700 shadow-sm dark:border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300">
                {locationError}
              </span>
            )}
          </motion.div>
        </motion.div>

        {/* ── Right Column (dark panel) ───────────── */}
        <motion.div
          variants={itemVariants}
          className="relative bg-[linear-gradient(180deg,var(--hero-dark-from)_0%,var(--hero-dark-to)_100%)] p-6 text-white sm:p-8 lg:p-10"
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-8 top-8 h-32 w-32 rounded-full bg-primary-400/12 blur-3xl" />
            <div className="absolute bottom-4 right-[-1.5rem] h-36 w-36 rounded-full bg-blue-400/8 blur-3xl" />
          </div>

          {/* Illustration */}
          <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-white/5 shadow-[0_16px_48px_rgba(0,0,0,0.25)]">
            <img
              src={heroImage || shopHero}
              alt="Shop discovery illustration"
              className="h-60 w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
            />
          </div>

          {/* Add shop CTA */}
          <div className="relative mt-6 space-y-5 rounded-3xl border border-white/8 bg-white/5 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <p className="section-label text-primary-300">Add shop</p>
                <h3 className="font-display text-xl font-bold text-white">Create a new listing</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Add a shop or update an image for better results.
                </p>
              </div>
              <PlusCircle className="h-5 w-5 text-primary-300/70" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <motion.button
                type="button"
                onClick={onOpenAddShop}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-black/15 transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                Add shop
              </motion.button>
              <motion.button
                type="button"
                onClick={onRetryLocation}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </motion.button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <HeroMetric label="Catalog" value={allShopsCount.toLocaleString()} icon={ShoppingBag} tone="slate" />
              <HeroMetric label="Nearby" value={nearbyShopsCount.toLocaleString()} icon={MapPin} tone="teal" />
              <HeroMetric label="Page" value={`${currentPage}/${totalPages}`} icon={Sparkles} tone="blue" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
