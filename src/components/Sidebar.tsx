import Link from 'next/link';
import React from 'react';
import { FaTachometerAlt, FaUsers, FaFileAlt, FaCog, FaBuilding } from 'react-icons/fa';

const Sidebar = () => (
  <aside className="h-screen bg-[#255B5C] text-white flex flex-col w-64 shadow-lg">
    {/* Company Logo & Name */}
    <div className="flex items-center gap-3 px-6 py-6 border-b border-[#1e4748]">
      <FaBuilding className="text-3xl text-white" />
      <span className="text-xl font-bold tracking-wide">Company Name</span>
    </div>
    {/* Navigation */}
    <nav className="flex-1 px-4 py-6 space-y-2">
      <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#1e4748] transition-colors">
        <FaTachometerAlt className="text-lg" />
        <span className="font-medium">Dashboard</span>
      </Link>
      <Link href="/data-management" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#1e4748] transition-colors">
        <FaUsers className="text-lg" />
        <span className="font-medium">Employees</span>
      </Link>
      <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#1e4748] transition-colors">
        <FaFileAlt className="text-lg" />
        <span className="font-medium">Reports</span>
      </Link>
      <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#1e4748] transition-colors">
        <FaCog className="text-lg" />
        <span className="font-medium">Settings</span>
      </Link>
    </nav>
  </aside>
);

export default Sidebar;