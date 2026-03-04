import { NavLink, useLocation } from 'react-router-dom';
import { Home, Syringe, Bell, MapPin, User, Stethoscope, Search, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const parentNavItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/vaccinations', icon: Syringe, label: 'Vaccines' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
  { to: '/centers', icon: MapPin, label: 'Centers' },
  { to: '/doctor-visits', icon: Stethoscope, label: 'Visits' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const providerNavItems = [
  { to: '/provider-dashboard', icon: Search, label: 'Search' },
  { to: '/centers', icon: MapPin, label: 'Centers' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const superAdminNavItems = [
  { to: '/super-admin', icon: ShieldCheck, label: 'Admin' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();

  let navItems = parentNavItems;
  if (user?.role === 'provider') {
    navItems = providerNavItems;
  } else if (user?.role === 'super_admin') {
    navItems = superAdminNavItems;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Solid Background */}
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around py-2 px-1 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 min-w-[3.5rem] relative',
                  isActive
                    ? 'text-violet-600'
                    : 'text-black active:text-gray-800'
                )}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                )}

                {/* Icon */}
                <div className={cn(
                  'p-1.5 rounded-xl transition-all duration-200',
                  isActive && 'bg-violet-100'
                )}>
                  <item.icon
                    className={cn(
                      'h-6 w-6',
                      isActive ? 'stroke-[2.5] text-violet-600' : 'stroke-[2] text-black'
                    )}
                  />
                </div>

                {/* Label */}
                <span className={cn(
                  'text-[11px] font-semibold',
                  isActive ? 'text-violet-600' : 'text-black'
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
