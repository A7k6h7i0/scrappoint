import { motion } from 'framer-motion';

function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden">
      {/* Image placeholder */}
      <div className="shimmer h-52 w-full" />

      <div className="space-y-4 p-6">
        {/* Title */}
        <div className="space-y-2">
          <div className="shimmer h-5 w-3/4" />
          <div className="shimmer h-4 w-full" />
          <div className="shimmer h-4 w-2/3" />
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <div className="shimmer h-7 w-20 rounded-full" />
          <div className="shimmer h-7 w-16 rounded-full" />
        </div>

        {/* Info block */}
        <div className="space-y-3 rounded-xl bg-[var(--color-bg-deep)] p-4">
          <div className="shimmer h-4 w-1/2" />
          <div className="shimmer h-4 w-3/4" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <div className="shimmer h-11 flex-1 rounded-xl" />
          <div className="shimmer h-11 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function SkeletonLoader({ count = 6 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </motion.div>
  );
}
