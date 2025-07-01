'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaTachometerAlt, FaMoon, FaSun, FaDatabase } from 'react-icons/fa';

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
    <aside
      className={`fixed top-0 left-0 h-screen min-h-screen w-64 flex flex-col z-40`
        + ` bg-[var(--sidebar)] text-[var(--sidebar-text)]`
        + ` shadow-lg`}
      style={{ borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)', fontFamily: 'Cairo, sans-serif' }}
    >
      {/* Logo & App Name */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[var(--sidebar-active-bg)]">
        <div className="bg-[var(--primary)] rounded-lg p-2">
          <FaTachometerAlt className="text-2xl text-white" />
        </div>
        <span className="text-2xl font-extrabold tracking-wide text-[var(--sidebar-text)]">industry-run</span>
      </div>
      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="text-xs font-bold mb-2 mt-2 pl-2 text-[var(--secondary)]">MENU</div>
        <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium `
          + `${pathname === '/' ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]' : 'hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-active-text)]'}`
        }>
          <FaTachometerAlt className="text-lg" />
          <span>Dashboard</span>
        </Link>
        <Link href="/details" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium `
          + `${pathname === '/details' ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]' : 'hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-active-text)]'}`
        }>
          <FaDatabase className="text-lg" />
          <span>Details</span>
        </Link>
      </nav>
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center gap-2 mx-4 mb-2 px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--sidebar-active-bg)] transition-colors text-xs font-medium text-[var(--sidebar-text)]"
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-300" />}
        {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
      </button>
      <div className="px-4 pb-4 mt-auto text-xs text-[var(--secondary)] text-center">
        © 2024 Developed by industry-run
      </div>
    </aside>
  );
};

export default Sidebar;