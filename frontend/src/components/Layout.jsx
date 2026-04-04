import { NavLink, Outlet } from 'react-router-dom';

const navLinkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25' : 'text-slate-600 hover:bg-emerald-50',
  ].join(' ');

function Layout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0,_#d1fae5_35%,_#f8fafc_72%)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
              Scrap Point
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-950">Find nearby stores fast</h1>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
