import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, ShoppingBag, Zap } from 'lucide-react';

function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatItem({ icon: Icon, value, suffix, label }) {
  const { count, ref } = useCountUp(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-4"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/10 to-blue-500/10 text-[var(--color-accent)] dark:from-primary-400/10 dark:to-blue-400/8">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-2xl font-bold tracking-tight text-[var(--color-text)]">
          {count.toLocaleString()}{suffix}
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      </div>
    </motion.div>
  );
}

export default function StatsBar({ allShopsCount }) {
  return (
    <section className="relative overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-surface)] py-8 backdrop-blur-lg">
      {/* Subtle gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-50/40 via-transparent to-blue-50/30 dark:from-primary-950/20 dark:to-blue-950/15" />

      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-10 px-6 sm:gap-16">
        <StatItem icon={ShoppingBag} value={allShopsCount || 1000} suffix="+" label="Stores in catalog" />
        <div className="hidden h-10 w-px bg-[var(--color-border-strong)] sm:block" />
        <StatItem icon={Search} value={50} suffix="+" label="Categories indexed" />
        <div className="hidden h-10 w-px bg-[var(--color-border-strong)] sm:block" />
        <StatItem icon={MapPin} value={100} suffix="+" label="Cities covered" />
        <div className="hidden h-10 w-px bg-[var(--color-border-strong)] sm:block" />
        <StatItem icon={Zap} value={99} suffix="%" label="Uptime guarantee" />
      </div>
    </section>
  );
}
