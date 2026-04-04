import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

void motion;

const navLinkClass = ({ isActive }) =>
  [
    'rounded-full border px-4 py-2 text-sm font-medium backdrop-blur transition-all duration-300',
    isActive
      ? 'border-teal-500/20 bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg shadow-teal-600/20'
      : 'border-white/70 bg-white/75 text-slate-600 hover:border-teal-200 hover:bg-white hover:text-slate-900',
  ].join(' ');

function Layout() {
  return (
    <div className="premium-shell min-h-screen text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-teal-200/35 blur-3xl" />
        <div className="absolute right-0 top-36 h-80 w-80 rounded-full bg-blue-200/25 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/3 h-96 w-96 rounded-full bg-cyan-200/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-blue-600 text-white shadow-lg shadow-teal-600/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-600">
                Scrap Point
              </p>
              <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                Premium local store discovery
              </h1>
            </div>
          </motion.div>

          <nav className="flex items-center gap-2">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="relative z-10 w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
