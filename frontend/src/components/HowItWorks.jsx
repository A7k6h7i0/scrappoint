import { motion } from 'framer-motion';
import { MapPin, Search, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: MapPin,
    number: '01',
    title: 'Share your location',
    description:
      'Allow browser location or search manually — we adapt to your preference.',
    color: 'from-primary-500 to-emerald-500',
    glow: 'shadow-primary-500/20',
  },
  {
    icon: Search,
    number: '02',
    title: 'We find the best shops',
    description:
      'Our engine ranks stores by proximity, ratings, and relevance in real-time.',
    color: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'Visit or connect',
    description:
      'See details, check timings, call directly, or navigate via map links.',
    color: 'from-violet-500 to-purple-500',
    glow: 'shadow-violet-500/20',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary-200/15 blur-[100px] dark:bg-primary-400/5" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-200/12 blur-[100px] dark:bg-blue-400/4" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 text-center"
        >
          <p className="section-label mb-3">How it works</p>
          <h3 className="section-title text-3xl sm:text-4xl">
            Three simple steps to{' '}
            <span className="text-gradient">discover shops</span>
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-base text-[var(--color-text-secondary)]">
            Finding the nearest scrap shop has never been easier.
            No sign-up required — just open and search.
          </p>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-3"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="group relative glass-card overflow-hidden p-6 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]"
            >
              {/* Step number watermark */}
              <span className="absolute right-4 top-2 font-display text-[5rem] font-bold leading-none text-[var(--color-border)] transition-colors group-hover:text-primary-100/60 dark:group-hover:text-primary-400/8">
                {step.number}
              </span>

              {/* Icon */}
              <div className={`relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg ${step.glow}`}>
                <step.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h4 className="font-display text-lg font-bold text-[var(--color-text)]">
                {step.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
