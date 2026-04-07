import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  RefreshCw,
  Search,
  ShoppingBag,
  WifiOff,
} from 'lucide-react';
import { shopApi } from '../services/api';
import HeroSection from '../components/HeroSection';
import ShopCard from '../components/ShopCard';
import AddShopModal from '../components/AddShopModal';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const DEFAULT_RADIUS_KM = 50;
const RESULTS_PER_PAGE = 12;

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

function toRadians(v) {
  return (v * Math.PI) / 180;
}

function getDistanceKm(userLocation, shop) {
  const coords = shop?.location?.coordinates;
  if (!userLocation || !Array.isArray(coords) || coords.length < 2) return null;
  const [lng, lat] = coords;
  const dLat = toRadians(lat - userLocation.latitude);
  const dLng = toRadians(lng - userLocation.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(userLocation.latitude)) *
      Math.cos(toRadians(lat)) *
      Math.sin(dLng / 2) ** 2;
  return 6371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
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

function createFormPayload(f) {
  return {
    name: f.name.trim(),
    address: f.address.trim(),
    categories: f.categories.trim(),
    main_category: f.main_category.trim(),
    featured_image: f.featured_image.trim(),
    website: f.website.trim(),
    phone: f.phone.trim(),
    link: f.link.trim(),
    location: {
      address: f.address.trim(),
      latitude: Number(f.latitude),
      longitude: Number(f.longitude),
    },
  };
}

function isValidLatitude(v) {
  const n = Number(v);
  return Number.isFinite(n) && Math.abs(n) <= 90;
}

function isValidLongitude(v) {
  const n = Number(v);
  return Number.isFinite(n) && Math.abs(n) <= 180;
}

function requestCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

export default function Home() {
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
    async function load() {
      setLocationStatus('loading');
      setLocationError('');
      try {
        const pos = await requestCurrentPosition();
        if (!cancelled) {
          setUserLocation(pos);
          setLocationStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          setLocationStatus('error');
          setLocationError(
            err?.code === 1
              ? 'Location access denied. You can still search manually.'
              : err?.message || 'Could not read your location.',
          );
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const shopsQuery = useQuery({
    queryKey: ['stores'],
    queryFn: () => shopApi.getAllShops(),
  });

  const allShops = useMemo(() => shopsQuery.data ?? [], [shopsQuery.data]);

  const nearbyShops = useMemo(() => {
    const withDist = allShops.map((s) => ({
      ...s,
      distanceKm: getDistanceKm(userLocation, s),
    }));

    const filtered = withDist.filter((s) => matchesSearchTerm(s, deferredSearch));
    const withinRadius = filtered.filter(
      (s) => typeof s.distanceKm === 'number' && s.distanceKm <= radiusKm,
    );
    const sorted = filtered
      .slice()
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

    if (!deferredSearch && userLocation) {
      if (withinRadius.length > 0) return withinRadius.concat(sorted.filter((s) => !withinRadius.includes(s)));
      return sorted;
    }

    return withinRadius.length > 0 ? withinRadius : sorted;
  }, [allShops, deferredSearch, radiusKm, userLocation]);

  const totalPages = Math.max(1, Math.ceil(nearbyShops.length / RESULTS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, radiusKm, userLocation?.latitude, userLocation?.longitude]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedShops = useMemo(
    () => nearbyShops.slice((currentPage - 1) * RESULTS_PER_PAGE, currentPage * RESULTS_PER_PAGE),
    [currentPage, nearbyShops],
  );

  const handleRetryLocation = async () => {
    setLocationStatus('loading');
    setLocationError('');
    try {
      const pos = await requestCurrentPosition();
      setUserLocation(pos);
      setLocationStatus('ready');
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
      setNewShop((c) => ({
        ...c,
        latitude: String(pos.latitude),
        longitude: String(pos.longitude),
      }));
    } catch (err) {
      setAddShopState({ status: 'error', message: err?.message || 'Could not get location.' });
    } finally {
      setIsGettingFormLocation(false);
    }
  };

  const handleAddShop = async (e) => {
    e.preventDefault();
    setAddShopState({ status: 'idle', message: '' });
    if (!newShop.name.trim() || !newShop.address.trim()) {
      setAddShopState({ status: 'error', message: 'Shop name and address are required.' });
      return;
    }
    if (!isValidLatitude(newShop.latitude) || !isValidLongitude(newShop.longitude)) {
      setAddShopState({
        status: 'error',
        message: 'Please enter valid latitude and longitude.',
      });
      return;
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
    } finally {
      setIsSubmittingShop(false);
    }
  };

  return (
    <div className="min-h-screen">
      <HeroSection
        onUseLocation={handleRetryLocation}
        onAddShop={() => setIsAddShopOpen(true)}
      />

      <section id="results" className="results-shell">
        <div className="results-panel">
          <div className="results-header">
            <div className="results-heading-block">
              <p className="results-kicker">Results</p>
              <h2 className="results-title">Featured scrap shops</h2>
            </div>
          </div>

          <div className="results-toolbar">
            <div className="results-controls">
              <label className="results-search">
                <Search className="h-5 w-5 shrink-0 text-[var(--accent)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by shop, address, category..."
                />
              </label>

              <button type="button" className="hero-button hero-button-primary" onClick={handleRetryLocation}>
                <RefreshCw className="h-4 w-4" />
                Use my location
              </button>

              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="results-select"
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>

            <div className="results-status-row">
              {locationError && <span className="results-badge">{locationError}</span>}
            </div>
          </div>

          <div className="results-content">
            {shopsQuery.isLoading ? (
              <SkeletonLoader count={6} />
            ) : shopsQuery.isError ? (
              <div className="results-badge w-full justify-start rounded-3xl p-5">
                <WifiOff className="h-5 w-5 text-[var(--accent)]" />
                <div>
                  <p className="font-semibold text-[var(--page-text)]">Could not load stores</p>
                  <p className="mt-1 text-sm text-[var(--page-muted)]">
                    {shopsQuery.error?.message || 'The store API is not reachable right now.'}
                  </p>
                </div>
              </div>
            ) : nearbyShops.length === 0 ? (
              <div className="results-badge w-full justify-start rounded-3xl p-6">
                <AlertTriangle className="h-5 w-5 text-[var(--accent)]" />
                <div>
                  <p className="font-semibold text-[var(--page-text)]">No nearby stores found</p>
                  <p className="mt-1 text-sm text-[var(--page-muted)]">
                    Try increasing the radius or changing your search query.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="results-grid">
                  <AnimatePresence mode="wait">
                    {pagedShops.map((shop) => (
                      <motion.div
                        key={shop.id || shop._id || `${shop.name}-${shop.address}`}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ShopCard shop={shop} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {nearbyShops.length > RESULTS_PER_PAGE && (
                  <div className="results-pagination">
                    <div className="results-pagination-copy">
                      <p className="results-pagination-label">Navigation</p>
                      <p className="results-pagination-text">
                        Showing page {currentPage} of {totalPages} for nearby verified stores.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="hero-button hero-button-primary"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="hero-button hero-button-primary"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

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
    </div>
  );
}
