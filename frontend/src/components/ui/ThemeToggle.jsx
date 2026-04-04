import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-solid)] text-[var(--color-text-secondary)] shadow-sm transition-colors hover:text-[var(--color-accent)]"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -45, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 45, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {isDark ? <Moon className="h-[1.15rem] w-[1.15rem]" /> : <Sun className="h-[1.15rem] w-[1.15rem]" />}
      </motion.div>
    </motion.button>
  );
}
