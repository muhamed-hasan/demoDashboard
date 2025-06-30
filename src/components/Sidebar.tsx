'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaTachometerAlt, FaMoon, FaSun, FaDatabase, FaChartBar } from 'react-icons/fa';

const THEME_COOKIE = 'theme';

const Sidebar = () => {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const match = document.cookie.match(/theme=(dark|light)/);
    if (match) setTheme(match[1] as 'light' | 'dark');
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.cookie = `${THEME_COOKIE}=dark; path=/; max-age=31536000`;
    } else {
      document.documentElement.classList.remove('dark');
      document.cookie = `${THEME_COOKIE}=light; path=/; max-age=31536000`;
    }
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Avoid hydration mismatch by not rendering anything until mounted
  if (!mounted) return null;

  return (
    <aside className={`fixed top-0 left-0 h-screen min-h-screen w-64 flex flex-col shadow-xl z-40 sidebar-modern`}>
      {/* Logo & App Name */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-green-500/20">
        <div className="bg-gradient-modern rounded-xl p-3 shadow-lg">
          <FaTachometerAlt className="text-2xl text-white" />
        </div>
        <span className="text-2xl font-extrabold tracking-wide text-white">industry-run</span>
      </div>
      
      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="text-xs font-bold mb-4 mt-2 pl-2 text-green-300 uppercase tracking-wider">Menu</div>
        
        <Link 
          href="/" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group ${
            pathname === '/' 
              ? 'bg-gradient-modern text-white shadow-lg transform scale-105' 
              : 'text-green-100 hover:bg-green-500/20 hover:text-white hover:transform hover:scale-105'
          }`}
        >
          <FaTachometerAlt className="text-lg group-hover:animate-pulse" />
          <span>Dashboard</span>
        </Link>
        
        <Link 
          href="/details" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group ${
            pathname === '/details' 
              ? 'bg-gradient-modern text-white shadow-lg transform scale-105' 
              : 'text-green-100 hover:bg-green-500/20 hover:text-white hover:transform hover:scale-105'
          }`}
        >
          <FaDatabase className="text-lg group-hover:animate-pulse" />
          <span>Details</span>
        </Link>
        
        <Link 
          href="/reports" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group ${
            pathname === '/reports' 
              ? 'bg-gradient-modern text-white shadow-lg transform scale-105' 
              : 'text-green-100 hover:bg-green-500/20 hover:text-white hover:transform hover:scale-105'
          }`}
        >
          <FaChartBar className="text-lg group-hover:animate-pulse" />
          <span>Reports</span>
        </Link>
      </nav>
      
      {/* Theme Toggle */}
      <div className="px-4 pb-4">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 transition-all duration-200 text-green-100 hover:text-white font-medium group"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <FaSun className="text-yellow-400 group-hover:animate-spin" />
          ) : (
            <FaMoon className="text-blue-300 group-hover:animate-pulse" />
          )}
          <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
        </button>
      </div>
      
      {/* Footer */}
      <div className="px-4 pb-4 mt-auto text-xs text-green-300 text-center">
        © 2024 Developed by industry-run
      </div>
    </aside>
  );
};

export default Sidebar;