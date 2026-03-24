import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sun, BarChart3, Trophy, FileText, UserPlus,
  Menu, X, LogOut, Shield, User
} from 'lucide-react';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Home', path: 'Home', icon: Sun },
    { name: 'Dashboard', path: 'Dashboard', icon: BarChart3 },
    { name: 'Leaderboard', path: 'Leaderboard', icon: Trophy },
    { name: 'Submit', path: 'SubmitInstallation', icon: FileText },
  ];

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <span className="text-xl font-semibold tracking-tight text-foreground">
                CoSolar
              </span>
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
                  <Link to={createPageUrl('InstallerSignup')}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register
                    </Button>
                  </Link>
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
                      Sign In
                    </button>
                    <Link
                      to={createPageUrl('InstallerSignup')}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
                    >
                      <UserPlus className="w-5 h-5" />
                      Register
                    </Link>
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
                <span className="text-xl font-semibold tracking-tight text-foreground">
                  CoSolar
                </span>
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
                <li><Link to={createPageUrl('Dashboard')} className="hover:text-foreground">Analytics</Link></li>
                <li><Link to={createPageUrl('Leaderboard')} className="hover:text-foreground">Leaderboard</Link></li>
                <li><Link to={createPageUrl('SubmitInstallation')} className="hover:text-foreground">Submit Data</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Installers</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to={createPageUrl('InstallerSignup')} className="hover:text-foreground">Register</Link></li>
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
