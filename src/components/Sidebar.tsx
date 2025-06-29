import Link from 'next/link';
import React from 'react';
import { FaTachometerAlt, FaUsers } from 'react-icons/fa';

const Sidebar = () => (
  <aside className="fixed top-0 left-0 h-screen min-h-screen w-64 bg-[#181F32] text-white flex flex-col shadow-lg z-40">
    {/* Logo & App Name */}
    <div className="flex items-center gap-3 px-6 py-6 border-b border-[#232A47]">
      <div className="bg-indigo-600 rounded-lg p-2">
        <FaTachometerAlt className="text-2xl text-white" />
      </div>
      <span className="text-2xl font-extrabold tracking-wide text-white">industry-run</span>
    </div>
    {/* MENU */}
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <div className="text-xs text-gray-400 font-bold mb-2 mt-2 pl-2">MENU</div>
      <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#232A47] transition-colors font-medium bg-[#232A47]">
        <FaTachometerAlt className="text-lg" />
        <span>Dashboard</span>
      </Link>
      <Link href="/data-management" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#232A47] transition-colors font-medium">
        <FaUsers className="text-lg" />
        <span>Employees</span>
      </Link>
    </nav>
    <div className="px-4 pb-4 mt-auto text-xs text-gray-400 text-center">
      © 2024 Developed by industry-run
    </div>
  </aside>
);

export default Sidebar;