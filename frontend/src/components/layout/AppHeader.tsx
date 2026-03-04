import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Sparkles } from 'lucide-react';

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40">
      {/* Glass Background */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]" />

      <div className="relative flex items-center justify-between px-4 py-3 container max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform duration-300">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              Kavach
            </span>
            <span className="text-[10px] text-muted-foreground font-medium -mt-0.5 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              Health Shield
            </span>
          </div>
        </div>

        {/* User Section */}
        {user && (
          <div className="flex items-center gap-3">
            {/* User Info (Hidden on mobile) */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize flex items-center justify-end gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {user.role}
              </p>
            </div>

            {/* Avatar */}
            <Avatar className="h-10 w-10 border-2 border-violet-200 ring-2 ring-violet-100 shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
