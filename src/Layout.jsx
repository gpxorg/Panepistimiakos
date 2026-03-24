import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { auth } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Calendar, CalendarPlus, LogOut, Menu, X, 
  GraduationCap, ChevronDown, Moon, Sun 
} from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.me(),
  });

  const navigation = [
    { name: 'Home', page: 'Home', icon: Home },
    { name: 'My Events', page: 'MyEvents', icon: Calendar, requiresAuth: true },
    { name: 'Create Event', page: 'CreateEvent', icon: CalendarPlus, requiresAuth: true },
  ];

  const filteredNav = navigation.filter(item => !item.requiresAuth || user);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-neutral-950' : 'bg-slate-50'}`}>
      <style>{`
        :root {
          --primary: 45 93% 47%;
          --primary-foreground: 0 0% 100%;
        }
        .dark {
          --background: 0 0% 4%;
          --foreground: 0 0% 98%;
          --card: 0 0% 7%;
          --card-foreground: 0 0% 98%;
          --muted: 0 0% 12%;
          --muted-foreground: 0 0% 65%;
          --border: 0 0% 18%;
        }
      `}</style>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-lg border-b ${
        darkMode 
          ? 'bg-neutral-950/90 border-neutral-800' 
          : 'bg-white/80 border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to={createPageUrl('Home')} 
              className="flex items-center gap-2.5"
            >
              <div className="p-2 bg-amber-500 rounded-xl">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-amber-500">
                Panepistimiakos
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {filteredNav.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                    ${currentPageName === item.page 
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                      : darkMode 
                        ? 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu / Auth */}
            <div className="hidden md:flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className={`rounded-xl ${darkMode ? 'text-amber-400 hover:bg-neutral-800' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={`flex items-center gap-2 h-10 px-3 rounded-xl ${darkMode ? 'hover:bg-neutral-800' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold text-sm">
                        {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className={`text-sm font-medium max-w-[120px] truncate ${darkMode ? 'text-neutral-200' : 'text-slate-700'}`}>
                        {user.full_name || user.email}
                      </span>
                      <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-neutral-400' : 'text-slate-400'}`} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={`w-56 ${darkMode ? 'bg-neutral-900 border-neutral-800' : ''}`}>
                    <div className="px-3 py-2">
                      <p className={`text-sm font-medium ${darkMode ? 'text-neutral-100' : 'text-slate-900'}`}>{user.full_name}</p>
                      <p className={`text-xs truncate ${darkMode ? 'text-neutral-400' : 'text-slate-500'}`}>{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className={darkMode ? 'bg-neutral-800' : ''} />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('MyEvents')} className={`cursor-pointer ${darkMode ? 'text-neutral-200 focus:bg-neutral-800' : ''}`}>
                        <Calendar className="w-4 h-4 mr-2" />
                        My Events
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className={darkMode ? 'bg-neutral-800' : ''} />
                    <DropdownMenuItem 
                      onClick={() => auth.logout()}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => auth.redirectToLogin()}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className={`rounded-lg ${darkMode ? 'text-amber-400' : 'text-slate-600'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-slate-100'}`}
              >
                {mobileMenuOpen ? (
                  <X className={`w-6 h-6 ${darkMode ? 'text-neutral-300' : 'text-slate-600'}`} />
                ) : (
                  <Menu className={`w-6 h-6 ${darkMode ? 'text-neutral-300' : 'text-slate-600'}`} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden border-t ${darkMode ? 'border-neutral-800 bg-neutral-950' : 'border-slate-100 bg-white'}`}
            >
              <div className="px-4 py-4 space-y-2">
                {filteredNav.map((item) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                      ${currentPageName === item.page 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                        : darkMode
                          ? 'text-neutral-300 hover:bg-neutral-800'
                          : 'text-slate-600 hover:bg-slate-50'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
                
                <div className={`pt-4 border-t ${darkMode ? 'border-neutral-800' : 'border-slate-100'}`}>
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold">
                          {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-neutral-100' : 'text-slate-900'}`}>{user.full_name}</p>
                          <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-slate-500'}`}>{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          auth.logout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        auth.redirectToLogin();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className={`border-t py-8 mt-auto ${darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500 rounded-lg">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className={`font-semibold ${darkMode ? 'text-neutral-200' : 'text-slate-700'}`}>Panepistimiakos</span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
              © {new Date().getFullYear()} Panepistimiakos. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
