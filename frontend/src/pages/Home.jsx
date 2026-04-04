import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Globe,
  Loader2,
  MapPin,
  Phone,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  ShoppingBag,
  Store,
  Send,
  X,
  WifiOff,
} from 'lucide-react';
import { shopApi } from '../services/api';
import shopHero from '../assets/shop-hero.svg';

void motion;

const DEFAULT_RADIUS_KM = 50;
const RESULTS_PER_PAGE = 24;

const INITIAL_NEW_SHOP = {
  name: '', address: '', categories: '', main_category: '', featured_image: '', website: '', phone: '', link: '', latitude: '', longitude: '',
};

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const staggerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

function toRadians(value) { return (value * Math.PI) / 180; }
function getDistanceKm(userLocation, shop) {
  const coordinates = shop?.location?.coordinates;
  if (!userLocation || !Array.isArray(coordinates) || coordinates.length < 2) return null;
  const [shopLng, shopLat] = coordinates;
  const dLat = toRadians(shopLat - userLocation.latitude);
  const dLng = toRadians(shopLng - userLocation.longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(userLocation.latitude)) * Math.cos(toRadians(shopLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
function formatRating(rating, reviews) { if (rating == null && reviews == null) return null; const ratingText = rating != null ? Number(rating).toFixed(1) : 'N/A'; const reviewText = reviews != null ? `(${Number(reviews).toLocaleString()} reviews)` : ''; return `${ratingText} ${reviewText}`.trim(); }
function getPrimaryTags(shop) { return String(shop.categories || shop.main_category || '').split(',').map((category) => category.trim()).filter(Boolean).slice(0, 3); }
function matchesSearchTerm(shop, search) { if (!search) return true; const haystack = [shop.name, shop.shopName, shop.address, shop.location?.address, shop.categories, shop.main_category, shop.query, shop.owner_name, shop.review_keywords, shop.place_id].filter(Boolean).join(' ').toLowerCase(); return haystack.includes(search.toLowerCase()); }
function createFormPayload(formState) { return { name: formState.name.trim(), address: formState.address.trim(), categories: formState.categories.trim(), main_category: formState.main_category.trim(), featured_image: formState.featured_image.trim(), website: formState.website.trim(), phone: formState.phone.trim(), link: formState.link.trim(), location: { address: formState.address.trim(), latitude: Number(formState.latitude), longitude: Number(formState.longitude) } }; }
function isValidLatitude(value) { const num = Number(value); return Number.isFinite(num) && Math.abs(num) <= 90; }
function isValidLongitude(value) { const num = Number(value); return Number.isFinite(num) && Math.abs(num) <= 180; }
function requestCurrentPosition() { return new Promise((resolve, reject) => { if (!navigator.geolocation) { reject(new Error('Geolocation is not supported by this browser.')); return; } navigator.geolocation.getCurrentPosition((position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }), (error) => reject(error), { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }); }); }
function HeroMetric({ label, value, icon: Icon, tone = 'teal' }) {
  void Icon;
  const tones = {
    teal: 'from-teal-50 to-emerald-50 text-teal-700 border-teal-100',
    blue: 'from-blue-50 to-cyan-50 text-blue-700 border-blue-100',
    slate: 'from-slate-50 to-white text-slate-700 border-slate-200',
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <Icon className="h-5 w-5 shrink-0 opacity-70" />
      </div>
    </div>
  );
}

function ShopCard({ shop }) {
  const tags = getPrimaryTags(shop);
  const [imageFailed, setImageFailed] = useState(false);
  const image = shop.featured_image || null;
  const hasImage = Boolean(image) && !imageFailed;
  const ratingLabel = formatRating(shop.rating, shop.reviews);
  return (
    <motion.article variants={itemVariants} whileHover={{ y: -10, scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="group premium-card shadow-premium transition-all duration-300 hover:border-teal-200 hover:shadow-premium-lg">
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-teal-100 via-cyan-50 to-blue-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_transparent_58%)]" />
        {hasImage ? <img src={image} alt={shop.name || shop.shopName || 'Store image'} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" loading="lazy" onError={() => setImageFailed(true)} /> : <div className="flex h-full w-full items-center justify-center"><div className="flex flex-col items-center gap-3 text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/75 bg-white/90 text-teal-600 shadow-lg shadow-teal-500/10"><Store className="h-7 w-7" /></div><p className="max-w-[12rem] truncate px-3 text-sm font-semibold text-slate-700">{shop.name || shop.shopName || 'Shop'}</p></div></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex max-w-[calc(100%-7rem)] flex-wrap gap-2">
          <span className={["rounded-full border px-3 py-1 text-xs font-semibold shadow-lg backdrop-blur", shop.is_temporarily_closed ? 'border-white/10 bg-slate-950/80 text-white' : 'border-white/10 bg-emerald-500/95 text-white'].join(' ')}>{shop.is_temporarily_closed ? 'Closed' : 'Open'}</span>
        </div>
      </div>
      <div className="flex h-full flex-col p-6">
        <div className="space-y-2"><h4 className="text-lg font-semibold leading-6 text-slate-950 line-clamp-2">{shop.name || shop.shopName}</h4><p className="line-clamp-3 text-sm leading-6 text-slate-500">{shop.address}</p></div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">{tags.length > 0 ? tags.map((category) => <span key={category} className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 font-medium text-teal-700">{category}</span>) : <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-500">No categories listed</span>}</div>
        <div className="mt-5 grid gap-3 rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-600">{ratingLabel ? <div className="flex items-center gap-2"><Star className="h-4 w-4 shrink-0 text-amber-500" /><span className="font-medium text-slate-700">{ratingLabel}</span></div> : null}{shop.workday_timing ? <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" /><span className="min-w-0 break-words">{shop.workday_timing}</span></div> : null}{shop.phone ? <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-teal-500" /><span className="font-medium text-slate-700">{shop.phone}</span></div> : null}</div>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">{shop.website ? <motion.a href={shop.website} target="_blank" rel="noreferrer" whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition sm:flex-none"><Globe className="h-4 w-4" />Website</motion.a> : null}{shop.link ? <motion.a href={shop.link} target="_blank" rel="noreferrer" whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:text-slate-950 sm:flex-none">Map listing<ArrowRight className="h-4 w-4" /></motion.a> : null}{!shop.website && !shop.link ? <span className="text-sm text-slate-400">No external links available</span> : null}</div>
      </div>
    </motion.article>
  );
}
function Home() {
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();
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

  useEffect(() => {
    let cancelled = false;
    async function loadLocation() {
      setLocationStatus('loading');
      setLocationError('');
      try {
        const position = await requestCurrentPosition();
        if (!cancelled) {
          setUserLocation(position);
          setLocationStatus('ready');
        }
      } catch (error) {
        if (!cancelled) {
          setLocationStatus('error');
          setLocationError(error?.code === 1 ? 'Location access was denied. You can still search manually.' : error?.message || 'Could not read your location right now.');
        }
      }
    }
    loadLocation();
    return () => { cancelled = true; };
  }, []);

  const shopsQuery = useQuery({ queryKey: ['stores'], queryFn: () => shopApi.getAllShops() });
  const allShops = useMemo(() => shopsQuery.data ?? [], [shopsQuery.data]);

  const nearbyState = useMemo(() => {
    const withDistance = allShops.map((shop) => ({ ...shop, distanceKm: getDistanceKm(userLocation, shop) }));
    const enriched = withDistance.filter((shop) => matchesSearchTerm(shop, deferredSearch)).sort((a, b) => (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY));
    const fallbackShops = (userLocation ? withDistance : enriched).slice().sort((a, b) => (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY));

    if (deferredSearch) {
      if (enriched.length === 0 && allShops.length > 0) return { shops: fallbackShops, usedFallback: true };
      const nearbyShops = enriched.filter((shop) => typeof shop.distanceKm === 'number' && shop.distanceKm <= radiusKm);
      const otherShops = enriched.filter((shop) => !(typeof shop.distanceKm === 'number' && shop.distanceKm <= radiusKm));
      return {
        shops: nearbyShops.length > 0 ? [...nearbyShops, ...otherShops].slice(0, Math.max(nearbyShops.length, RESULTS_PER_PAGE)) : enriched,
        usedFallback: nearbyShops.length === 0 && enriched.length > 0,
      };
    }

    if (!userLocation) return { shops: enriched, usedFallback: false };

    const withinRadius = enriched.filter((shop) => typeof shop.distanceKm === 'number' && shop.distanceKm <= radiusKm);
    if (withinRadius.length > 0) {
      const remainingShops = enriched.filter((shop) => !(typeof shop.distanceKm === 'number' && shop.distanceKm <= radiusKm));
      return {
        shops: [...withinRadius, ...remainingShops],
        usedFallback: withinRadius.length < RESULTS_PER_PAGE && remainingShops.length > 0,
      };
    }

    return { shops: fallbackShops, usedFallback: true };
  }, [allShops, deferredSearch, radiusKm, userLocation]);

  const nearbyShops = nearbyState.shops;
  const totalPages = Math.max(1, Math.ceil(nearbyShops.length / RESULTS_PER_PAGE));

  useEffect(() => { setCurrentPage(1); }, [deferredSearch, radiusKm, userLocation?.latitude, userLocation?.longitude]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  const pagedNearbyShops = useMemo(() => nearbyShops.slice((currentPage - 1) * RESULTS_PER_PAGE, (currentPage - 1) * RESULTS_PER_PAGE + RESULTS_PER_PAGE), [currentPage, nearbyShops]);
  const locationLabel = locationStatus === 'ready' ? 'Live location enabled' : locationStatus === 'loading' ? 'Checking location' : 'Manual search';

  const handleRetryLocation = async () => {
    setLocationStatus('loading');
    setLocationError('');
    try {
      const position = await requestCurrentPosition();
      setUserLocation(position);
      setLocationStatus('ready');
    } catch (error) {
      setLocationStatus('error');
      setLocationError(error?.message || 'Could not read your location right now.');
    }
  };

  const handleFillFormLocation = async () => {
    setIsGettingFormLocation(true);
    setAddShopState({ status: 'idle', message: '' });
    try {
      const position = await requestCurrentPosition();
      setNewShop((current) => ({ ...current, latitude: String(position.latitude), longitude: String(position.longitude) }));
    } catch (error) {
      setAddShopState({ status: 'error', message: error?.message || 'Could not read your location for the form.' });
    } finally {
      setIsGettingFormLocation(false);
    }
  };

  const handleAddShop = async (event) => {
    event.preventDefault();
    setAddShopState({ status: 'idle', message: '' });
    if (!newShop.name.trim() || !newShop.address.trim()) { setAddShopState({ status: 'error', message: 'Shop name and address are required.' }); return; }
    if (!isValidLatitude(newShop.latitude) || !isValidLongitude(newShop.longitude)) { setAddShopState({ status: 'error', message: 'Please enter valid latitude and longitude values.' }); return; }
    setIsSubmittingShop(true);
    try {
      await shopApi.createShop(createFormPayload(newShop));
      await queryClient.invalidateQueries({ queryKey: ['stores'] });
      setNewShop(INITIAL_NEW_SHOP);
      setIsAddShopOpen(false);
      setAddShopState({ status: 'success', message: 'Shop added successfully and synced to the server.' });
    } catch (error) {
      setAddShopState({ status: 'error', message: error?.message || 'Could not add the shop right now.' });
    } finally {
      setIsSubmittingShop(false);
    }
  };

  const totalLoadedLabel = `${allShops.length.toLocaleString()} stores loaded`;

  return (
    <motion.div initial={prefersReducedMotion ? false : 'hidden'} animate={prefersReducedMotion ? undefined : 'visible'} variants={staggerVariants} className="relative space-y-6 lg:space-y-8">
      <motion.section variants={sectionVariants} className="premium-card border-white/80 shadow-premium-lg">
        <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div variants={staggerVariants} className="relative space-y-6 p-6 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -left-8 top-0 h-24 w-24 rounded-full bg-teal-200/50 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 right-14 h-28 w-28 rounded-full bg-blue-200/40 blur-3xl" />
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-teal-200/70 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm"><Sparkles className="h-4 w-4" />Nearby scrap shops based on your location</motion.div>
            <div className="space-y-4">
              <motion.h2 variants={itemVariants} className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">Discover the closest scrap shops with a premium, effortless search flow.</motion.h2>
              <motion.p variants={itemVariants} className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">We use your browser location, fetch the live scrap catalog, and rank the best matches automatically so the most useful stores rise to the top.</motion.p>
            </div>
            <motion.div variants={itemVariants} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm transition focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-100">
                <Search className="h-5 w-5 text-teal-500" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by store, address, category..." className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400" />
              </label>
              <motion.button type="button" onClick={handleRetryLocation} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="premium-button-primary"><RefreshCw className="h-4 w-4" />Use my location</motion.button>
            </motion.div>
            <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-[auto_auto_auto] sm:items-center">
              <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">Radius
                <select value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))} className="bg-transparent font-semibold text-slate-900 outline-none">
                  <option value={10}>10 km</option><option value={25}>25 km</option><option value={50}>50 km</option><option value={100}>100 km</option>
                </select>
              </label>
              <span className="inline-flex w-fit items-center rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700 shadow-sm">Showing page {currentPage} of {totalPages}</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-slate-600 shadow-sm">{locationLabel}</span>
              {userLocation ? <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-teal-700 shadow-sm">Using your live location</span> : null}
              {locationError ? <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700 shadow-sm">{locationError}</span> : null}
            </motion.div>
          </motion.div>
          <motion.div variants={itemVariants} className="relative bg-[linear-gradient(180deg,#041f1d_0%,#0f172a_100%)] p-6 text-white sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute left-8 top-8 h-36 w-36 rounded-full bg-teal-400/15 blur-3xl" /><div className="absolute right-[-2rem] bottom-0 h-40 w-40 rounded-full bg-blue-300/10 blur-3xl" /></div>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-[0_20px_60px_rgba(4,120,87,0.25)]"><img src={newShop.featured_image || shopHero} alt="Shop illustration" className="h-72 w-full object-cover transition duration-700 hover:scale-[1.03]" /></div>
            <div className="relative mt-6 space-y-5 rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-[0_18px_45px_rgba(4,120,87,0.22)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3"><div className="space-y-2"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-200">Add shop</p><h3 className="text-2xl font-semibold text-white">Create a new listing</h3><p className="text-sm leading-6 text-slate-300">Add a shop, fetch nearby results, or drop in a better image URL.</p></div><PlusCircle className="h-5 w-5 text-teal-300" /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <motion.button type="button" onClick={() => setIsAddShopOpen(true)} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="premium-button rounded-2xl bg-white text-slate-900 shadow-lg shadow-black/10"><PlusCircle className="h-4 w-4" />Add shop</motion.button>
                <motion.button type="button" onClick={handleRetryLocation} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="premium-button rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10"><RefreshCw className="h-4 w-4" />Refresh location</motion.button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <HeroMetric label="Catalog" value={allShops.length.toLocaleString()} icon={ShoppingBag} tone="slate" />
                <HeroMetric label="Nearby" value={nearbyShops.length.toLocaleString()} icon={MapPin} tone="teal" />
                <HeroMetric label="Page" value={`${currentPage}/${totalPages}`} icon={Sparkles} tone="blue" />
              </div>
              <p className="text-xs leading-5 text-slate-300">The button opens the full form in a panel so the hero stays clean.</p>
            </div>
          </motion.div>
        </div>
      </motion.section>
      <AnimatePresence>
        {isAddShopOpen ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/65 px-4 py-6 backdrop-blur-md sm:px-6 lg:px-8" onClick={() => setIsAddShopOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="premium-card w-full max-w-5xl border-white/80 bg-white/95 text-slate-900 shadow-premium-lg" role="dialog" aria-modal="true" aria-label="Add shop form" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-5 sm:px-7">
                <div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">Add shop</p><h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Create a new listing</h3></div>
                <motion.button type="button" onClick={() => setIsAddShopOpen(false)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-teal-200 hover:text-slate-950" aria-label="Close add shop form"><X className="h-5 w-5" /></motion.button>
              </div>
              <form onSubmit={handleAddShop} className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-100 shadow-sm"><img src={shopHero} alt="Shop scene" className="h-full min-h-[320px] w-full object-cover" /></div>
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Shop name</span><input value={newShop.name} onChange={(event) => setNewShop((current) => ({ ...current, name: event.target.value }))} className="premium-input" placeholder="e.g. Vijetha Super Market" /></label>
                    <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Address</span><input value={newShop.address} onChange={(event) => setNewShop((current) => ({ ...current, address: event.target.value }))} className="premium-input" placeholder="Full address" /></label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Main category</span><input value={newShop.main_category} onChange={(event) => setNewShop((current) => ({ ...current, main_category: event.target.value }))} className="premium-input" placeholder="Supermarket" /></label>
                    <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Categories</span><input value={newShop.categories} onChange={(event) => setNewShop((current) => ({ ...current, categories: event.target.value }))} className="premium-input" placeholder="Grocery store, supermarket" /></label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Image URL</span><input value={newShop.featured_image} onChange={(event) => setNewShop((current) => ({ ...current, featured_image: event.target.value }))} className="premium-input" placeholder="https://..." /></label>
                    <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Website</span><input value={newShop.website} onChange={(event) => setNewShop((current) => ({ ...current, website: event.target.value }))} className="premium-input" placeholder="https://..." /></label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Phone</span><input value={newShop.phone} onChange={(event) => setNewShop((current) => ({ ...current, phone: event.target.value }))} className="premium-input" placeholder="Phone number" /></label>
                    <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Map link</span><input value={newShop.link} onChange={(event) => setNewShop((current) => ({ ...current, link: event.target.value }))} className="premium-input" placeholder="Google Maps link" /></label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Latitude</span><input value={newShop.latitude} onChange={(event) => setNewShop((current) => ({ ...current, latitude: event.target.value }))} className="premium-input" placeholder="17.123456" /></label>
                    <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Longitude</span><input value={newShop.longitude} onChange={(event) => setNewShop((current) => ({ ...current, longitude: event.target.value }))} className="premium-input" placeholder="78.123456" /></label>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <motion.button type="button" onClick={handleFillFormLocation} whileHover={{ y: -1, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="premium-button-secondary">{isGettingFormLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}Use my location</motion.button>
                    <motion.button type="submit" disabled={isSubmittingShop} whileHover={{ y: -1, scale: isSubmittingShop ? 1 : 1.01 }} whileTap={{ scale: isSubmittingShop ? 1 : 0.98 }} className="premium-button-primary disabled:cursor-not-allowed disabled:opacity-70">{isSubmittingShop ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Add shop to server</motion.button>
                  </div>
                  {addShopState.message ? <div className={["rounded-2xl border p-4 text-sm shadow-sm", addShopState.status === 'success' ? 'border-teal-200 bg-teal-50 text-teal-800' : 'border-amber-200 bg-amber-50 text-amber-800'].join(' ')}>{addShopState.message}</div> : null}
                  <p className="text-xs leading-5 text-slate-500">The server needs coordinates to store a new shop. If you use the button above, the latitude and longitude fields will be filled for you.</p>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.section
        variants={sectionVariants}
        className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.88)_0%,rgba(248,250,252,0.96)_48%,rgba(239,246,255,0.9)_100%)] p-6 shadow-premium sm:p-7 lg:p-8"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-8 top-10 h-44 w-44 rounded-full bg-teal-200/30 blur-3xl" />
          <div className="absolute right-8 top-0 h-52 w-52 rounded-full bg-blue-200/25 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-200/20 blur-3xl" />
        </div>

        <div className="relative mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">Results</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Featured stores
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShoppingBag className="h-4 w-4" />
            {totalLoadedLabel}
          </div>
        </div>
        {shopsQuery.isLoading ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200/80 bg-white/80 p-10 text-center text-slate-500"><Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-600" /><p className="mt-3">Loading store catalog...</p></div>
        ) : shopsQuery.isError ? (
          <div className="rounded-[1.5rem] border border-blue-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6 text-blue-950 shadow-sm">
            <div className="flex items-start gap-3">
              <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="font-semibold">Could not load stores</p>
                <p className="mt-1 text-sm leading-6">
                  {shopsQuery.error?.message || 'The store API is not reachable right now.'}
                </p>
              </div>
            </div>
          </div>
        ) : nearbyState.usedFallback && nearbyShops.length > 0 ? (
          <div className="mb-4 rounded-[1.5rem] border border-teal-200 bg-gradient-to-r from-teal-50 via-white to-blue-50 p-4 text-slate-900 shadow-sm">
            <p className="font-semibold">No exact matches were found for your current filters.</p>
            <p className="mt-1 text-sm leading-6">
              Showing the closest available shops instead.
            </p>
          </div>
        ) : nearbyShops.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200/80 bg-gradient-to-br from-white via-teal-50 to-blue-50 p-10 text-center shadow-sm">
            <AlertTriangle className="mx-auto h-10 w-10 text-teal-600" />
            <p className="mt-4 text-lg font-semibold text-slate-950">No nearby stores found</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Try increasing the radius or changing the search term.
            </p>
          </div>
        ) : (
          <motion.div variants={staggerVariants} className="space-y-6">
            <motion.div variants={staggerVariants} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{pagedNearbyShops.map((shop) => <ShopCard key={shop.id || shop._id || `${shop.name}-${shop.address}`} shop={shop} />)}</motion.div>
            {nearbyShops.length > RESULTS_PER_PAGE ? (
              <motion.div variants={itemVariants} className="flex flex-col gap-3 rounded-[1.5rem] border border-white/70 bg-white/92 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">Page {currentPage} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <motion.button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} whileHover={{ y: -1, scale: currentPage === 1 ? 1 : 1.01 }} whileTap={{ scale: currentPage === 1 ? 1 : 0.98 }} className="premium-button-secondary disabled:cursor-not-allowed disabled:opacity-50">Previous</motion.button>
                  <motion.button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} whileHover={{ y: -1, scale: currentPage === totalPages ? 1 : 1.01 }} whileTap={{ scale: currentPage === totalPages ? 1 : 0.98 }} className="premium-button-primary disabled:cursor-not-allowed disabled:opacity-50">Next</motion.button>
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        )}
      </motion.section>
    </motion.div>
  );
}

export default Home;
