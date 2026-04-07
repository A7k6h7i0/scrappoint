import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  MapPin,
  PlusCircle,
  Send,
  X,
} from 'lucide-react';
import shopHero from '../assets/shop-hero.svg';

export default function AddShopModal({
  isOpen,
  onClose,
  newShop,
  onNewShopChange,
  addShopState,
  isGettingFormLocation,
  isSubmittingShop,
  onFillFormLocation,
  onSubmit,
}) {
  if (!isOpen) return null;

  const updateField = (field) => (e) =>
    onNewShopChange((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1b1410]/65 px-4 py-8 backdrop-blur-lg sm:px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card-elevated w-full max-w-5xl overflow-hidden border border-[var(--page-border)] bg-[rgba(255,250,244,0.95)] text-[var(--page-text)]"
            role="dialog"
            aria-modal="true"
            aria-label="Add shop form"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--page-border)] px-6 py-5 sm:px-7">
              <div>
                <p className="section-label">Add shop</p>
                <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-[var(--page-text)]">
                  Create a new listing
                </h3>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--page-border-strong)] bg-[rgba(255,255,255,0.72)] text-[var(--page-muted)] transition-colors hover:text-[var(--page-text)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Body */}
            <form onSubmit={onSubmit} className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[0.9fr_1.1fr]">
              {/* Left: illustration */}
              <div className="overflow-hidden rounded-3xl border border-[var(--page-border)] bg-[rgba(255,245,232,0.8)]">
                <img
                  src={newShop.featured_image || shopHero}
                  alt="Shop scene"
                  className="h-full min-h-[280px] w-full object-cover"
                />
              </div>

              {/* Right: form fields */}
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-[var(--page-muted)]">Shop name *</span>
                    <input value={newShop.name} onChange={updateField('name')} className="premium-input" placeholder="e.g. Vijetha Super Market" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-[var(--page-muted)]">Address *</span>
                    <input value={newShop.address} onChange={updateField('address')} className="premium-input" placeholder="Full address" />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-[var(--page-muted)]">Main category</span>
                    <input value={newShop.main_category} onChange={updateField('main_category')} className="premium-input" placeholder="Supermarket" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-[var(--page-muted)]">Categories</span>
                    <input value={newShop.categories} onChange={updateField('categories')} className="premium-input" placeholder="Grocery, supermarket" />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-[var(--page-muted)]">Image URL</span>
                    <input value={newShop.featured_image} onChange={updateField('featured_image')} className="premium-input" placeholder="https://..." />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-[var(--page-muted)]">Website</span>
                    <input value={newShop.website} onChange={updateField('website')} className="premium-input" placeholder="https://..." />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-[var(--page-muted)]">Phone</span>
                    <input value={newShop.phone} onChange={updateField('phone')} className="premium-input" placeholder="Phone number" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-[var(--page-muted)]">Map link</span>
                    <input value={newShop.link} onChange={updateField('link')} className="premium-input" placeholder="Google Maps URL" />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-[var(--page-muted)]">Latitude *</span>
                    <input value={newShop.latitude} onChange={updateField('latitude')} className="premium-input" placeholder="17.123456" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-[var(--page-muted)]">Longitude *</span>
                    <input value={newShop.longitude} onChange={updateField('longitude')} className="premium-input" placeholder="78.123456" />
                  </label>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={onFillFormLocation}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-secondary"
                  >
                    {isGettingFormLocation
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <MapPin className="h-4 w-4" />}
                    Use my location
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isSubmittingShop}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary"
                  >
                    {isSubmittingShop
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Send className="h-4 w-4" />}
                    Add shop to server
                  </motion.button>
                </div>

                {/* Status message */}
                {addShopState.message && (
                  <div
                    className={[
                      'rounded-xl border p-4 text-sm',
                      addShopState.status === 'success'
                      ? 'border-[rgba(138,67,29,0.2)] bg-[rgba(138,67,29,0.08)] text-[var(--page-text)]'
                        : 'border-amber-200 bg-amber-50 text-amber-800',
                    ].join(' ')}
                  >
                    {addShopState.message}
                  </div>
                )}

                <p className="text-xs leading-relaxed text-[var(--page-muted)]">
                  Coordinates are needed for location-based search. Click "Use my location" to auto-fill them.
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
