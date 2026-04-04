import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  Loader2,
  ShoppingBag,
  WifiOff,
} from 'lucide-react';
import { shopApi } from '../services/api';

import HeroSection from '../components/HeroSection';
import ShopCard from '../components/ShopCard';
import AddShopModal from '../components/AddShopModal';
import StatsBar from '../components/StatsBar';
import HowItWorks from '../components/HowItWorks';
import SkeletonLoader from '../components/ui/SkeletonLoader';

/* ── Constants ─────────────────────────────────── */
const DEFAULT_RADIUS_KM = 50;
const RESULTS_PER_PAGE = 24;

const INITIAL_NEW_SHOP = {
  name: '', address: '', categories: '', main_category: '',
  featured_image: '', website: '', phone: '', link: '',
  latitude: '', longitude: '',
};

/* ── Utility helpers ───────────────────────────── */
function toRadians(v) { return (v * Math.PI) / 180; }

function getDistanceKm(userLocation, shop) {
  const coords = shop?.location?.coordinates;
  if (!userLocation || !Array.isArray(coords) || coords.length < 2) return null;
  const [lng, lat] = coords;
  const dLat = toRadians(lat - userLocation.latitude);
  const dLng = toRadians(lng - userLocation.longitude);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(userLocation.latitude)) * Math.cos(toRadians(lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function matchesSearchTerm(shop, search) {
  if (!search) return true;
  const haystack = [
    shop.name, shop.shopName, shop.address, shop.location?.address,
    shop.categories, shop.main_category, shop.query,
    shop.owner_name, shop.review_keywords, shop.place_id,
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(search.toLowerCase());
}

function createFormPayload(f) {
  return {
    name: f.name.trim(), address: f.address.trim(),
    categories: f.categories.trim(), main_category: f.main_category.trim(),
    featured_image: f.featured_image.trim(), website: f.website.trim(),
    phone: f.phone.trim(), link: f.link.trim(),
    location: { address: f.address.trim(), latitude: Number(f.latitude), longitude: Number(f.longitude) },
  };
}

function isValidLatitude(v) { const n = Number(v); return Number.isFinite(n) && Math.abs(n) <= 90; }
function isValidLongitude(v) { const n = Number(v); return Number.isFinite(n) && Math.abs(n) <= 180; }

function requestCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation is not supported.')); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

/* ── Animation variants ────────────────────────── */
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.06 } },
};

/* ═══════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════ */
export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();

  /* ── State ───────────────────────────────────── */
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [currentPage, setCurrentPage] = useState(1);
  const [newShop, setNewShop] = useState(INITIAL_NEW_SHOP);
  const [addShopState, setAddShopState] = useState({ status: 'idle', message: '' });
  const [isGettingFormLocation, setIsGettingFormLocation] = useState(false);
  const [isSubmittingShop, setIsSubmittingShop] = useState(false);
  const [isAddShopOpen, setIsAddShopOpen] = useState(false);
  const deferredSearch = useDeferredValue(search.trim());

  /* ── Geolocation on mount ────────────────────── */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLocationStatus('loading');
      setLocationError('');
      try {
        const pos = await requestCurrentPosition();
        if (!cancelled) { setUserLocation(pos); setLocationStatus('ready'); }
      } catch (err) {
        if (!cancelled) {
          setLocationStatus('error');
          setLocationError(err?.code === 1
            ? 'Location access denied. You can still search manually.'
            : err?.message || 'Could not read your location.');
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  /* ── Data fetching ───────────────────────────── */
  const shopsQuery = useQuery({ queryKey: ['stores'], queryFn: () => shopApi.getAllShops() });
  const allShops = useMemo(() => shopsQuery.data ?? [], [shopsQuery.data]);

  /* ── Filtering & sorting ─────────────────────── */
  const nearbyState = useMemo(() => {
    const withDist = allShops.map((s) => ({ ...s, distanceKm: getDistanceKm(userLocation, s) }));
    const enriched = withDist.filter((s) => matchesSearchTerm(s, deferredSearch))
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    const fallback = (userLocation ? withDist : enriched).slice()
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

    if (deferredSearch) {
      if (enriched.length === 0 && allShops.length > 0) return { shops: fallback, usedFallback: true };
      const near = enriched.filter((s) => typeof s.distanceKm === 'number' && s.distanceKm <= radiusKm);
      const far = enriched.filter((s) => !(typeof s.distanceKm === 'number' && s.distanceKm <= radiusKm));
      return {
        shops: near.length > 0
          ? [...near, ...far].slice(0, Math.max(near.length, RESULTS_PER_PAGE))
          : enriched,
        usedFallback: near.length === 0 && enriched.length > 0,
      };
    }

    if (!userLocation) return { shops: enriched, usedFallback: false };

    const within = enriched.filter((s) => typeof s.distanceKm === 'number' && s.distanceKm <= radiusKm);
    if (within.length > 0) {
      const rest = enriched.filter((s) => !(typeof s.distanceKm === 'number' && s.distanceKm <= radiusKm));
      return {
        shops: [...within, ...rest],
        usedFallback: within.length < RESULTS_PER_PAGE && rest.length > 0,
      };
    }
    return { shops: fallback, usedFallback: true };
  }, [allShops, deferredSearch, radiusKm, userLocation]);

  const nearbyShops = nearbyState.shops;
  const totalPages = Math.max(1, Math.ceil(nearbyShops.length / RESULTS_PER_PAGE));

  useEffect(() => { setCurrentPage(1); }, [deferredSearch, radiusKm, userLocation?.latitude, userLocation?.longitude]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  const pagedShops = useMemo(
    () => nearbyShops.slice((currentPage - 1) * RESULTS_PER_PAGE, currentPage * RESULTS_PER_PAGE),
    [currentPage, nearbyShops],
  );

  /* ── Handlers ────────────────────────────────── */
  const handleRetryLocation = async () => {
    setLocationStatus('loading');
    setLocationError('');
    try {
      const pos = await requestCurrentPosition();
      setUserLocation(pos); setLocationStatus('ready');
    } catch (err) {
      setLocationStatus('error');
      setLocationError(err?.message || 'Could not read your location.');
    }
  };

  const handleFillFormLocation = async () => {
    setIsGettingFormLocation(true);
    setAddShopState({ status: 'idle', message: '' });
    try {
      const pos = await requestCurrentPosition();
      setNewShop((c) => ({ ...c, latitude: String(pos.latitude), longitude: String(pos.longitude) }));
    } catch (err) {
      setAddShopState({ status: 'error', message: err?.message || 'Could not get location.' });
    } finally { setIsGettingFormLocation(false); }
  };

  const handleAddShop = async (e) => {
    e.preventDefault();
    setAddShopState({ status: 'idle', message: '' });
    if (!newShop.name.trim() || !newShop.address.trim()) {
      setAddShopState({ status: 'error', message: 'Shop name and address are required.' }); return;
    }
    if (!isValidLatitude(newShop.latitude) || !isValidLongitude(newShop.longitude)) {
      setAddShopState({ status: 'error', message: 'Please enter valid latitude and longitude.' }); return;
    }
    setIsSubmittingShop(true);
    try {
      await shopApi.createShop(createFormPayload(newShop));
      await queryClient.invalidateQueries({ queryKey: ['stores'] });
      setNewShop(INITIAL_NEW_SHOP);
      setIsAddShopOpen(false);
      setAddShopState({ status: 'success', message: 'Shop added successfully!' });
    } catch (err) {
      setAddShopState({ status: 'error', message: err?.message || 'Could not add the shop.' });
    } finally { setIsSubmittingShop(false); }
  };

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <motion.div
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'visible'}
      variants={staggerVariants}
    >
      {/* ── Hero Section ────────────────────────── */}
      <div className="px-4 pt-6 sm:px-6 lg:px-8">
        <HeroSection
          search={search}
          onSearchChange={setSearch}
          locationStatus={locationStatus}
          locationError={locationError}
          onRetryLocation={handleRetryLocation}
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          currentPage={currentPage}
          totalPages={totalPages}
          allShopsCount={allShops.length}
          nearbyShopsCount={nearbyShops.length}
          onOpenAddShop={() => setIsAddShopOpen(true)}
        />
      </div>

      {/* ── Stats Bar ───────────────────────────── */}
      <div className="mt-8">
        <StatsBar allShopsCount={allShops.length} />
      </div>

      {/* ── How It Works ────────────────────────── */}
      <HowItWorks />

      {/* ── Featured Stores Section ─────────────── */}
      <motion.section
        variants={sectionVariants}
        className="relative overflow-hidden px-4 pb-12 sm:px-6 lg:px-8"
      >
        {/* Section header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label mb-2">Results</p>
            <h3 className="section-title text-2xl sm:text-3xl">Featured stores</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <ShoppingBag className="h-4 w-4" />
            {allShops.length.toLocaleString()} stores loaded
          </div>
        </div>

        {/* Content states */}
        {shopsQuery.isLoading ? (
          <SkeletonLoader count={6} />
        ) : shopsQuery.isError ? (
          <div className="glass-card border-blue-200/50 bg-gradient-to-br from-blue-50/80 via-cyan-50/60 to-primary-50/50 p-6 text-blue-900 dark:border-blue-400/10 dark:from-blue-950/30 dark:via-cyan-950/20 dark:to-primary-950/20 dark:text-blue-200">
            <div className="flex items-start gap-3">
              <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-display font-semibold">Could not load stores</p>
                <p className="mt-1 text-sm leading-relaxed opacity-80">
                  {shopsQuery.error?.message || 'The store API is not reachable right now.'}
                </p>
              </div>
            </div>
          </div>
        ) : nearbyState.usedFallback && nearbyShops.length > 0 ? (
          <>
            <div className="mb-6 glass-card border-primary-200/40 bg-gradient-to-r from-primary-50/70 via-white/60 to-blue-50/50 p-4 dark:border-primary-400/10 dark:from-primary-950/20 dark:to-blue-950/15">
              <p className="font-display font-semibold text-[var(--color-text)]">No exact matches found</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Showing the closest available shops instead.
              </p>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${currentPage}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div variants={staggerVariants} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {pagedShops.map((shop) => (
                    <ShopCard key={shop.id || shop._id || `${shop.name}-${shop.address}`} shop={shop} />
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>
            {nearbyShops.length > RESULTS_PER_PAGE && <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />}
          </>
        ) : nearbyShops.length === 0 ? (
          <div className="glass-card border-dashed border-[var(--color-border-strong)] bg-gradient-to-br from-white via-primary-50/40 to-blue-50/30 p-12 text-center dark:from-slate-900 dark:via-primary-950/20 dark:to-blue-950/15">
            <AlertTriangle className="mx-auto h-10 w-10 text-[var(--color-accent)]" />
            <p className="mt-4 font-display text-lg font-bold text-[var(--color-text)]">No nearby stores found</p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Try increasing the radius or changing your search query.
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${currentPage}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div variants={staggerVariants} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {pagedShops.map((shop) => (
                    <ShopCard key={shop.id || shop._id || `${shop.name}-${shop.address}`} shop={shop} />
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>
            {nearbyShops.length > RESULTS_PER_PAGE && <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />}
          </>
        )}
      </motion.section>

      {/* ── Add Shop Modal ──────────────────────── */}
      <AddShopModal
        isOpen={isAddShopOpen}
        onClose={() => setIsAddShopOpen(false)}
        newShop={newShop}
        onNewShopChange={setNewShop}
        addShopState={addShopState}
        isGettingFormLocation={isGettingFormLocation}
        isSubmittingShop={isSubmittingShop}
        onFillFormLocation={handleFillFormLocation}
        onSubmit={handleAddShop}
      />
    </motion.div>
  );
}

/* ── Pagination ────────────────────────────────── */
function Pagination({ currentPage, totalPages, setCurrentPage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mt-8 flex flex-col gap-4 rounded-2xl glass-card p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-[var(--color-text-secondary)]">
        Page <span className="font-semibold text-[var(--color-text)]">{currentPage}</span> of{' '}
        <span className="font-semibold text-[var(--color-text)]">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="btn-secondary disabled:opacity-40"
        >
          Previous
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary disabled:opacity-40"
        >
          Next
        </motion.button>
      </div>
    </motion.div>
  );
}
