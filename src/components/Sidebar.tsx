'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaTachometerAlt, FaUsers, FaMoon, FaSun } from 'react-icons/fa';

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
    <aside className={`fixed top-0 left-0 h-screen min-h-screen w-64 flex flex-col shadow-lg z-40 ${theme === 'dark' ? 'bg-[#111827] text-gray-200 border-r border-[#232A47]' : 'bg-[#181F32] text-white'}`}>
      {/* Logo & App Name */}
      <div className={`flex items-center gap-3 px-6 py-6 border-b ${theme === 'dark' ? 'border-[#232A47]' : 'border-[#232A47]'}`}>
        <div className="bg-blue-600 rounded-lg p-2">
          <FaTachometerAlt className="text-2xl text-white" />
        </div>
        <span className="text-2xl font-extrabold tracking-wide text-white">industry-run</span>
      </div>
      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="text-xs font-bold mb-2 mt-2 pl-2 text-gray-400">MENU</div>
        <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${pathname === '/' ? 'bg-[#2563eb] text-white' : 'hover:bg-[#232A47]'} ${theme === 'dark' ? 'hover:bg-[#1e293b]' : ''}`}>
          <FaTachometerAlt className="text-lg" />
          <span>Dashboard</span>
        </Link>
        <Link href="/data-management" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${pathname === '/data-management' ? 'bg-[#2563eb] text-white' : 'hover:bg-[#232A47]'} ${theme === 'dark' ? 'hover:bg-[#1e293b]' : ''}`}>
          <FaUsers className="text-lg" />
          <span>Employees</span>
        </Link>
        <Link href="/reports" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${pathname === '/reports' ? 'bg-[#2563eb] text-white' : 'hover:bg-[#232A47]'} ${theme === 'dark' ? 'hover:bg-[#1e293b]' : ''}`}>
          <FaUsers className="text-lg" />
          <span>Reports</span>
        </Link>
      </nav>
      <button
        onClick={toggleTheme}
        className={`flex items-center justify-center gap-2 mx-4 mb-2 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-[#232A47] hover:bg-blue-700' : 'bg-[#232A47] hover:bg-indigo-700'} transition-colors text-xs font-medium`}
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-300" />}
        {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
      </button>
      <div className="px-4 pb-4 mt-auto text-xs text-gray-400 text-center">
        © 2024 Developed by industry-run
      </div>
    </aside>
  );
};

export default Sidebar;