import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileCheck, Moon, Sun, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const user = localStorage.getItem('role');

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const citizenLinks = [
    { to: '/dashboard', label: 'Home' },
    { to: '/apply', label: 'Apply' },
    { to: '/my-certificates', label: 'My Certificates' },
    { to: '/profile', label: 'Profile' },
  ];

  const officialLinks = [
    { to: '/official-dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'Profile' },
  ];

  const links = user === 'citizen' ? citizenLinks : officialLinks;

  return (
    <nav className="sticky top-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
              <FileCheck className="h-6 w-6" />
            </div>
            <div className="hidden md:block">
              <h1 className="font-heading font-bold text-lg leading-none text-primary">
                CertifyGov
              </h1>
              <p className="text-xs text-muted-foreground">Digital Certificate System</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link key={link.to} to={link.to}>
                  <Button
                    variant={location.pathname === link.to ? 'default' : 'ghost'}
                    size="sm"
                    className="transition-all"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={
                    () => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('role');
                      navigate('/');
                  }
                }
                  className="hidden md:flex rounded-full"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && user && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden mt-4 space-y-2 overflow-hidden"
            >
              {links.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={location.pathname === link.to ? 'default' : 'ghost'}
                    className="w-full justify-start"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive"
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('role');
                      navigate('/login/officer');  
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
