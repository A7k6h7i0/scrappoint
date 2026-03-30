import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Globe,
  Loader2,
  MapPin,
  Phone,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
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

const DEFAULT_RADIUS_KM = 50;
const RESULTS_PER_PAGE = 24;

const INITIAL_NEW_SHOP = {
  name: '',
  address: '',
  categories: '',
  main_category: '',
  featured_image: '',
  website: '',
  phone: '',
  link: '',
  latitude: '',
  longitude: '',
};

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(userLocation, shop) {
  const coordinates = shop?.location?.coordinates;
  if (!userLocation || !Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  const [shopLng, shopLat] = coordinates;
  const earthRadiusKm = 6371;
  const dLat = toRadians(shopLat - userLocation.latitude);
  const dLng = toRadians(shopLng - userLocation.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(userLocation.latitude)) *
      Math.cos(toRadians(shopLat)) *
      Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatRating(rating, reviews) {
  if (rating == null && reviews == null) return null;

  const ratingText = rating != null ? Number(rating).toFixed(1) : 'N/A';
  const reviewText = reviews != null ? `(${Number(reviews).toLocaleString()} reviews)` : '';
  return `${ratingText} ${reviewText}`.trim();
}

function getPrimaryTags(shop) {
  return String(shop.categories || shop.main_category || '')
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function getShopImage(shop) {
  return shop.featured_image || null;
}

function matchesSearchTerm(shop, search) {
  if (!search) return true;

  const haystack = [
    shop.name,
    shop.shopName,
    shop.address,
    shop.location?.address,
    shop.categories,
    shop.main_category,
    shop.query,
    shop.owner_name,
    shop.review_keywords,
    shop.place_id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
}

function createFormPayload(formState) {
  return {
    name: formState.name.trim(),
    address: formState.address.trim(),
    categories: formState.categories.trim(),
    main_category: formState.main_category.trim(),
    featured_image: formState.featured_image.trim(),
    website: formState.website.trim(),
    phone: formState.phone.trim(),
    link: formState.link.trim(),
    location: {
      address: formState.address.trim(),
      latitude: Number(formState.latitude),
      longitude: Number(formState.longitude),
    },
  };
}

function isValidLatitude(value) {
  const num = Number(value);
  return Number.isFinite(num) && Math.abs(num) <= 90;
}

function isValidLongitude(value) {
  const num = Number(value);
  return Number.isFinite(num) && Math.abs(num) <= 180;
}

function ShopCard({ shop }) {
  const tags = getPrimaryTags(shop);
  const image = getShopImage(shop);
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(image) && !imageFailed;
  const initials = (shop.name || shop.shopName || 'Shop')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className="relative h-40 bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100">
        {hasImage ? (
          <img
            src={image}
            alt={shop.name || shop.shopName || 'Store image'}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-rose-600 shadow-sm">
                <Store className="h-7 w-7" />
              </div>
              <div>
                <p className="max-w-[12rem] truncate px-3 text-sm font-semibold text-slate-700">
                  {shop.name || shop.shopName || 'Shop'}
                </p>
                {initials ? (
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
                    {initials}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex max-w-[calc(100%-7rem)] flex-wrap gap-2">
          {shop.is_temporarily_closed ? (
            <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              Closed
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              Open
            </span>
          )}

        </div>
      </div>

      <div className="flex h-full flex-col p-5">
        <div className="space-y-2">
          <h4 className="text-lg font-semibold leading-6 text-slate-950 line-clamp-2">
            {shop.name || shop.shopName}
          </h4>
          <p className="line-clamp-3 text-sm leading-6 text-slate-500">{shop.address}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {tags.length > 0 ? (
            tags.map((category) => (
              <span
                key={category}
                className="rounded-full bg-slate-100 px-3 py-1 text-slate-600"
              >
                {category}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
              No categories listed
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
          {shop.rating != null || shop.reviews != null ? (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 shrink-0 text-amber-500" />
                <span className="font-medium text-slate-700">{formatRating(shop.rating, shop.reviews)}</span>
              </span>
            </div>
          ) : null}

          {shop.workday_timing ? (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-rose-500" />
                <span className="min-w-0 break-words">{shop.workday_timing}</span>
              </span>
            </div>
          ) : null}

          {shop.phone ? (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-rose-500" />
                <span className="font-medium text-slate-700">{shop.phone}</span>
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          {shop.website ? (
            <a
              href={shop.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 sm:flex-none"
            >
              <Globe className="h-4 w-4" />
              Website
            </a>
          ) : null}

          {shop.link ? (
            <a
              href={shop.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100 sm:flex-none"
            >
              Map listing
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : null}

          {!shop.website && !shop.link ? (
            <span className="text-sm text-slate-400">No external links available</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function requestCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  });
}

function Home() {
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
  const queryClient = useQueryClient();

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
          setLocationError(
            error?.code === 1
              ? 'Location access was denied. You can still search manually.'
              : error?.message || 'Could not read your location right now.',
          );
        }
      }
    }

    loadLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  const shopsQuery = useQuery({
    queryKey: ['stores'],
    queryFn: () => shopApi.getAllShops(),
  });

  const allShops = useMemo(() => shopsQuery.data ?? [], [shopsQuery.data]);

  const nearbyState = useMemo(() => {
    const withDistance = allShops.map((shop) => ({
      ...shop,
      distanceKm: getDistanceKm(userLocation, shop),
    }));

    const enriched = withDistance
      .filter((shop) => matchesSearchTerm(shop, search))
      .sort((a, b) => {
        const aDistance = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const bDistance = b.distanceKm ?? Number.POSITIVE_INFINITY;
        return aDistance - bDistance;
      });

    const getSortedFallback = () =>
      (userLocation ? withDistance : enriched).slice().sort((a, b) => {
        const aDistance = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const bDistance = b.distanceKm ?? Number.POSITIVE_INFINITY;
        return aDistance - bDistance;
      });

    const fallbackShops = getSortedFallback();

    if (search) {
      if (enriched.length === 0 && allShops.length > 0) {
        return {
          shops: fallbackShops,
          usedFallback: true,
        };
      }

      const nearbyShops = enriched.filter(
        (shop) => typeof shop.distanceKm === 'number' && shop.distanceKm <= radiusKm,
      );
      const otherShops = enriched.filter(
        (shop) => !(typeof shop.distanceKm === 'number' && shop.distanceKm <= radiusKm),
      );
      const rankedShops =
        nearbyShops.length > 0
          ? [...nearbyShops, ...otherShops].slice(0, Math.max(nearbyShops.length, RESULTS_PER_PAGE))
          : enriched;

      return {
        shops: rankedShops,
        usedFallback: nearbyShops.length === 0 && enriched.length > 0,
      };
    }

    if (!userLocation) {
      return {
        shops: enriched,
        usedFallback: false,
      };
    }

    const withinRadius = enriched.filter(
      (shop) => typeof shop.distanceKm === 'number' && shop.distanceKm <= radiusKm,
    );

    if (withinRadius.length > 0) {
      const remainingShops = enriched.filter(
        (shop) => !(typeof shop.distanceKm === 'number' && shop.distanceKm <= radiusKm),
      );

      return {
        shops: [...withinRadius, ...remainingShops],
        usedFallback: withinRadius.length < RESULTS_PER_PAGE && remainingShops.length > 0,
      };
    }

    return {
      shops: fallbackShops,
      usedFallback: true,
    };
  }, [allShops, radiusKm, search, userLocation]);

  const nearbyShops = nearbyState.shops;
  const totalPages = Math.max(1, Math.ceil(nearbyShops.length / RESULTS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, radiusKm, userLocation?.latitude, userLocation?.longitude]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedNearbyShops = useMemo(() => {
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    return nearbyShops.slice(startIndex, startIndex + RESULTS_PER_PAGE);
  }, [currentPage, nearbyShops]);

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
      setNewShop((current) => ({
        ...current,
        latitude: String(position.latitude),
        longitude: String(position.longitude),
      }));
    } catch (error) {
      setAddShopState({
        status: 'error',
        message: error?.message || 'Could not read your location for the form.',
      });
    } finally {
      setIsGettingFormLocation(false);
    }
  };

  const handleAddShop = async (event) => {
    event.preventDefault();
    setAddShopState({ status: 'idle', message: '' });

    if (!newShop.name.trim() || !newShop.address.trim()) {
      setAddShopState({
        status: 'error',
        message: 'Shop name and address are required.',
      });
      return;
    }

    if (!isValidLatitude(newShop.latitude) || !isValidLongitude(newShop.longitude)) {
      setAddShopState({
        status: 'error',
        message: 'Please enter valid latitude and longitude values.',
      });
      return;
    }

    setIsSubmittingShop(true);

    try {
      await shopApi.createShop(createFormPayload(newShop));
      await queryClient.invalidateQueries({ queryKey: ['stores'] });
      setNewShop(INITIAL_NEW_SHOP);
      setIsAddShopOpen(false);
      setAddShopState({
        status: 'success',
        message: 'Shop added successfully and synced to the server.',
      });
    } catch (error) {
      setAddShopState({
        status: 'error',
        message: error?.message || 'Could not add the shop right now.',
      });
    } finally {
      setIsSubmittingShop(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 p-5 sm:p-7 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">
              <Sparkles className="h-4 w-4" />
              Nearby scrap shops based on your location
            </div>

            <div className="space-y-3">
              <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">
                Find the closest scrap shops around you, fast.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                We use your browser location, fetch the live scrap catalog, and sort the results by
                distance so the nearest stores rise to the top automatically.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-100">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by store, address, category..."
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>

              <button
                type="button"
                onClick={handleRetryLocation}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
                Use my location
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                Radius
                <select
                  value={radiusKm}
                  onChange={(event) => setRadiusKm(Number(event.target.value))}
                  className="bg-transparent font-medium text-slate-900 outline-none"
                >
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                </select>
              </label>

              <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                Showing page {currentPage} of {totalPages} with{' '}
                {Math.min(RESULTS_PER_PAGE, Math.max(0, nearbyShops.length - (currentPage - 1) * RESULTS_PER_PAGE))}{' '}
                stores
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                Location:{' '}
                {locationStatus === 'ready'
                  ? 'on'
                  : locationStatus === 'loading'
                    ? 'checking'
                    : 'manual'}
              </span>
              {userLocation ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                  Using your live location
                </span>
              ) : null}
              {locationError ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                  {locationError}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 bg-slate-950 p-5 text-white sm:p-7 lg:p-10">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
              <img
                src={newShop.featured_image || shopHero}
                alt="Shop illustration"
                className="h-64 w-full object-cover"
              />
            </div>

            <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-200">
                    Add shop
                  </p>
                  <h3 className="text-xl font-semibold text-white">Create a new listing</h3>
                  <p className="text-sm leading-6 text-slate-300">
                    Add a shop, fetch nearby results, or drop in a better image URL.
                  </p>
                </div>
                <PlusCircle className="h-5 w-5 text-rose-300" />
              </div>

              <button
                type="button"
                onClick={() => setIsAddShopOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
              >
                <PlusCircle className="h-4 w-4" />
                Add shop
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleRetryLocation}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh my location
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewShop((current) => ({
                      ...current,
                      featured_image: shopHero,
                    }));
                    setIsAddShopOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <Camera className="h-4 w-4" />
                  Use featured image
                </button>
              </div>

              <p className="text-xs leading-5 text-slate-300">
                The button opens the full form in a panel so the hero stays clean.
              </p>
            </div>
          </div>
        </div>
      </section>

      {isAddShopOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 px-4 py-6 backdrop-blur-sm sm:px-6 lg:px-8"
          onClick={() => setIsAddShopOpen(false)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-[0_40px_120px_rgba(15,23,42,0.5)]"
            role="dialog"
            aria-modal="true"
            aria-label="Add shop form"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-200">
                  Add shop
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">Create a new listing</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddShopOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                aria-label="Close add shop form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddShop} className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
                <img src={shopHero} alt="Shop scene" className="h-full min-h-[320px] w-full object-cover" />
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Shop name</span>
                    <input
                      value={newShop.name}
                      onChange={(event) => setNewShop((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                      placeholder="e.g. Vijetha Super Market"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Address</span>
                    <input
                      value={newShop.address}
                      onChange={(event) => setNewShop((current) => ({ ...current, address: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                      placeholder="Full address"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Main category</span>
                    <input
                      value={newShop.main_category}
                      onChange={(event) =>
                        setNewShop((current) => ({ ...current, main_category: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                      placeholder="Supermarket"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Categories</span>
                    <input
                      value={newShop.categories}
                      onChange={(event) =>
                        setNewShop((current) => ({ ...current, categories: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                      placeholder="Grocery store, supermarket"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Image URL</span>
                    <input
                      value={newShop.featured_image}
                      onChange={(event) =>
                        setNewShop((current) => ({ ...current, featured_image: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                      placeholder="https://..."
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Website</span>
                    <input
                      value={newShop.website}
                      onChange={(event) =>
                        setNewShop((current) => ({ ...current, website: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                      placeholder="https://..."
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Phone</span>
                    <input
                      value={newShop.phone}
                      onChange={(event) =>
                        setNewShop((current) => ({ ...current, phone: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                      placeholder="Phone number"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Map link</span>
                    <input
                      value={newShop.link}
                      onChange={(event) => setNewShop((current) => ({ ...current, link: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                      placeholder="Google Maps link"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Latitude</span>
                    <input
                      value={newShop.latitude}
                      onChange={(event) =>
                        setNewShop((current) => ({ ...current, latitude: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                      placeholder="17.123456"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Longitude</span>
                    <input
                      value={newShop.longitude}
                      onChange={(event) =>
                        setNewShop((current) => ({ ...current, longitude: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                      placeholder="78.123456"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleFillFormLocation}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    {isGettingFormLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    Use my location
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingShop}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmittingShop ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Add shop to server
                  </button>
                </div>

                {addShopState.message ? (
                  <div
                    className={[
                      'rounded-2xl border p-4 text-sm',
                      addShopState.status === 'success'
                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                        : 'border-amber-400/30 bg-amber-400/10 text-amber-100',
                    ].join(' ')}
                  >
                    {addShopState.message}
                  </div>
                ) : null}

                <p className="text-xs leading-5 text-slate-300">
                  The server needs coordinates to store a new shop. If you use the button above, the
                  latitude and longitude fields will be filled for you.
                </p>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">Results</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-950">Closest stores</h3>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShoppingBag className="h-4 w-4" />
            {allShops.length.toLocaleString()} stores loaded
          </div>
        </div>

        {shopsQuery.isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-rose-500" />
            <p className="mt-3">Loading store catalog...</p>
          </div>
        ) : shopsQuery.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
            <div className="flex items-start gap-3">
              <WifiOff className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Could not load stores</p>
                <p className="mt-1 text-sm leading-6">
                  {shopsQuery.error?.message || 'The store API is not reachable right now.'}
                </p>
              </div>
            </div>
          </div>
        ) : nearbyState.usedFallback && nearbyShops.length > 0 ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <p className="font-semibold">No exact matches were found for your current filters.</p>
            <p className="mt-1 text-sm leading-6">
              Showing the closest available shops instead.
            </p>
          </div>
        ) : nearbyShops.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
            <p className="mt-4 text-lg font-semibold text-slate-950">No nearby stores found</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Try increasing the radius or changing the search term.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {pagedNearbyShops.map((shop) => (
                <ShopCard key={shop.id || shop._id || `${shop.name}-${shop.address}`} shop={shop} />
              ))}
            </div>

            {nearbyShops.length > RESULTS_PER_PAGE ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
