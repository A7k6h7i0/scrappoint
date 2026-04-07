import { motion } from 'framer-motion';

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/50 bg-[#d8d9d2] shadow-[0_24px_70px_rgba(15,18,12,0.12)]">
      <div className="shimmer h-56 w-full" />

      <div className="space-y-3 bg-[#6e7368] p-5">
        <div className="flex justify-between gap-3">
          <div className="shimmer h-8 w-24 rounded-full" />
          <div className="shimmer h-8 w-14 rounded-full" />
        </div>

        <div className="space-y-2">
          <div className="shimmer h-9 w-3/4 rounded-xl" />
          <div className="shimmer h-4 w-full rounded-xl" />
          <div className="shimmer h-4 w-5/6 rounded-xl" />
          <div className="shimmer h-4 w-2/3 rounded-xl" />
        </div>

        <div className="flex gap-2">
          <div className="shimmer h-9 w-20 rounded-full" />
          <div className="shimmer h-9 w-24 rounded-full" />
        </div>

        <div className="flex gap-2">
          <div className="shimmer h-8 w-32 rounded-full" />
          <div className="shimmer h-8 w-24 rounded-full" />
        </div>

        <div className="pt-2">
          <div className="shimmer h-14 w-full rounded-full" />
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
