import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { MobileNav } from './MobileNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Primary gradient blob */}
        <div
          className="absolute top-[-30%] right-[-20%] w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, hsla(250, 84%, 60%, 0.3) 0%, transparent 70%)',
            animation: 'float-slow 20s ease-in-out infinite',
          }}
        />

        {/* Accent gradient blob */}
        <div
          className="absolute bottom-[-20%] left-[-15%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, hsla(172, 66%, 50%, 0.3) 0%, transparent 70%)',
            animation: 'float-slow 25s ease-in-out infinite reverse',
          }}
        />

        {/* Subtle purple accent */}
        <div
          className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsla(280, 80%, 55%, 0.2) 0%, transparent 70%)',
            animation: 'float-slow 30s ease-in-out infinite',
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <AppHeader />
        <main className="pb-24 pt-4 container max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
          <Outlet />
        </main>
        <MobileNav />
      </div>

      {/* Bottom Gradient Fade for Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
    </div>
  );
}
