import Link from 'next/link';
import React from 'react';
import { FaTachometerAlt, FaUsers, FaFileAlt, FaCog, FaBuilding } from 'react-icons/fa';

const Sidebar = () => (
  <aside className="fixed top-0 left-0 h-screen min-h-screen w-64 bg-blue-900 text-white flex flex-col shadow-lg z-40">
    {/* Company Logo & Name */}
    <div className="flex items-center gap-3 px-6 py-6 border-b border-blue-800">
      <FaBuilding className="text-3xl text-white" />
      <span className="text-xl font-bold tracking-wide">Company Name</span>
    </div>
    {/* Navigation */}
    <nav className="flex-1 px-4 py-6 space-y-2">
      <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors">
        <FaTachometerAlt className="text-lg" />
        <span className="font-medium">Dashboard</span>
      </Link>
      <Link href="/data-management" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors">
        <FaUsers className="text-lg" />
        <span className="font-medium">Employees</span>
      </Link>
      <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors">
        <FaFileAlt className="text-lg" />
        <span className="font-medium">Reports</span>
      </Link>
      <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors">
        <FaCog className="text-lg" />
        <span className="font-medium">Settings</span>
      </Link>
    </nav>
  </aside>
);

export default Sidebar;