import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { Notification, supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sun, BarChart3, Trophy, FileText,
  Menu, X, LogOut, Shield, User, Bell
} from 'lucide-react';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => Notification.listMine(),
    enabled: !!user?.email,
    staleTime: 30_000,
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (id) => Notification.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => Notification.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email] });
    },
  });

  const unreadCount = notifications.filter((item) => !item.read_at).length;

  useEffect(() => {
    if (!user?.email) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_email=eq.${user.email}`,
        },
        (payload) => {
          toast.success(payload.new.title, {
            description: payload.new.message,
          });
          queryClient.invalidateQueries({ queryKey: ['notifications', user.email] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email, queryClient]);

  const publicNavItems = [
    { name: 'Home', path: 'Home', icon: Sun },
    { name: 'Analytics', path: 'Analytics', icon: BarChart3 },
    { name: 'Leaderboard', path: 'Leaderboard', icon: Trophy },
  ];
  const authenticatedNavItems = user
    ? [
        ...(user.role === 'admin' ? [] : [{ name: 'Submit Installation', path: 'SubmitInstallation', icon: FileText }]),
        { name: 'Profile', path: 'InstallerSignup', icon: User },
      ]
    : [];
  const navItems = [...publicNavItems, ...authenticatedNavItems];

  const isActive = (path) => {
    const pageUrl = createPageUrl(path);
    return location.pathname === pageUrl || location.pathname === pageUrl + '/';
  };

  const handleLogout = async () => {
    await logout();
    navigate(createPageUrl('Home'));
  };

  const handleSignIn = () => {
    navigate(createPageUrl('Login'));
  };

  const handleNotificationSelect = (notification) => {
    if (!notification.read_at) {
      markNotificationReadMutation.mutate(notification.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <img src="/logo.svg" alt="CoSolar Logo" className="h-12 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-96">
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={() => markAllNotificationsReadMutation.mutate()}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      {notifications.length === 0 ? (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className="items-start whitespace-normal py-3"
                            onSelect={() => handleNotificationSelect(notification)}
                          >
                            <div className="flex w-full gap-3">
                              <div className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.read_at ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-foreground">{notification.title}</div>
                                <div className="mt-1 text-xs leading-5 text-muted-foreground">
                                  {notification.message}
                                </div>
                                <div className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {user.role === 'admin' && (
                    <Link to={createPageUrl('Admin')}>
                      <Button variant="ghost" size="sm">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link to={createPageUrl('InstallerSignup')}>
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={handleSignIn}>
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <nav className="container mx-auto px-6 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (unreadCount > 0) {
                          markAllNotificationsReadMutation.mutate();
                        }
                      }}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-muted-foreground w-full"
                    >
                      <span className="flex items-center gap-3">
                        <Bell className="w-5 h-5" />
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {user.role === 'admin' && (
                      <Link
                        to={createPageUrl('Admin')}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground"
                      >
                        <Shield className="w-5 h-5" />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { handleSignIn(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground w-full"
                    >
                      <User className="w-5 h-5" />
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="CoSolar Logo" className="h-12 w-auto grayscale opacity-80" />
              </div>
              <p className="text-muted-foreground max-w-md">
                Africa's Solar Intelligence & Registry Platform. Tracking solar installations,
                capacity, and contributors across the continent.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to={createPageUrl('Analytics')} className="hover:text-foreground">Analytics</Link></li>
                <li><Link to={createPageUrl('Leaderboard')} className="hover:text-foreground">Leaderboard</Link></li>
                {user && user.role !== 'admin' && (
                  <li><Link to={createPageUrl('SubmitInstallation')} className="hover:text-foreground">Submit Installation</Link></li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Installers</h4>
              <ul className="space-y-2 text-muted-foreground">
                {user && (
                  <li><Link to={createPageUrl('InstallerSignup')} className="hover:text-foreground">Profile</Link></li>
                )}
                <li><Link to={createPageUrl('Contact')} className="hover:text-foreground">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} CoSolar. Powering Africa's solar future.
          </div>
        </div>
      </footer>
    </div>
  );
}
