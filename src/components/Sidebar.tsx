import Link from 'next/link';
import React from 'react';
import { FaTachometerAlt, FaUsers, FaFileAlt, FaCog, FaBuilding, FaCalendarAlt, FaUser, FaTasks, FaWpforms, FaTable, FaEnvelope, FaInbox, FaFileInvoice } from 'react-icons/fa';

const Sidebar = () => (
  <aside className="fixed top-0 left-0 h-screen min-h-screen w-64 bg-[#181F32] text-white flex flex-col shadow-lg z-40">
    {/* Logo & App Name */}
    <div className="flex items-center gap-3 px-6 py-6 border-b border-[#232A47]">
      <div className="bg-indigo-600 rounded-lg p-2">
        <FaBuilding className="text-2xl text-white" />
      </div>
      <span className="text-2xl font-extrabold tracking-wide text-white">TailAdmin</span>
    </div>
    {/* MENU */}
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <div className="text-xs text-gray-400 font-bold mb-2 mt-2 pl-2">MENU</div>
      <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#232A47] transition-colors font-medium bg-[#232A47]">
        <FaTachometerAlt className="text-lg" />
        <span>Dashboard</span>
      </Link>
      <div className="text-xs text-gray-400 font-bold mb-2 mt-4 pl-2">eCommerce</div>
      <div className="space-y-1">
        <button className="flex items-center gap-3 px-4 py-2 rounded-lg w-full hover:bg-[#232A47] transition-colors">
          <FaUsers className="text-lg" />
          <span>Analytics</span>
          <span className="ml-auto bg-indigo-500 text-xs px-2 py-0.5 rounded text-white">Pro</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-2 rounded-lg w-full hover:bg-[#232A47] transition-colors">
          <FaFileAlt className="text-lg" />
          <span>Marketing</span>
          <span className="ml-auto bg-indigo-500 text-xs px-2 py-0.5 rounded text-white">Pro</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-2 rounded-lg w-full hover:bg-[#232A47] transition-colors">
          <FaCog className="text-lg" />
          <span>CRM</span>
          <span className="ml-auto bg-indigo-500 text-xs px-2 py-0.5 rounded text-white">Pro</span>
        </button>
      </div>
      <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#232A47] transition-colors font-medium">
        <FaCalendarAlt className="text-lg" />
        <span>Calendar</span>
      </Link>
      <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#232A47] transition-colors font-medium">
        <FaUser className="text-lg" />
        <span>Profile</span>
      </Link>
      <div className="text-xs text-gray-400 font-bold mb-2 mt-4 pl-2">Task</div>
      <button className="flex items-center gap-3 px-4 py-2 rounded-lg w-full hover:bg-[#232A47] transition-colors">
        <FaTasks className="text-lg" />
        <span>Task</span>
      </button>
      <div className="text-xs text-gray-400 font-bold mb-2 mt-4 pl-2">Forms</div>
      <button className="flex items-center gap-3 px-4 py-2 rounded-lg w-full hover:bg-[#232A47] transition-colors">
        <FaWpforms className="text-lg" />
        <span>Forms</span>
      </button>
      <div className="text-xs text-gray-400 font-bold mb-2 mt-4 pl-2">Tables</div>
      <button className="flex items-center gap-3 px-4 py-2 rounded-lg w-full hover:bg-[#232A47] transition-colors">
        <FaTable className="text-lg" />
        <span>Tables</span>
      </button>
      <div className="text-xs text-gray-400 font-bold mb-2 mt-4 pl-2">Pages</div>
      <button className="flex items-center gap-3 px-4 py-2 rounded-lg w-full hover:bg-[#232A47] transition-colors">
        <FaFileAlt className="text-lg" />
        <span>Pages</span>
      </button>
      <div className="text-xs text-gray-400 font-bold mb-2 mt-4 pl-2">SUPPORT</div>
      <button className="flex items-center gap-3 px-4 py-2 rounded-lg w-full hover:bg-[#232A47] transition-colors">
        <FaEnvelope className="text-lg" />
        <span>Messages</span>
        <span className="ml-auto bg-indigo-500 text-xs px-2 py-0.5 rounded text-white">5</span>
        <span className="ml-2 bg-indigo-500 text-xs px-2 py-0.5 rounded text-white">Pro</span>
      </button>
      <button className="flex items-center gap-3 px-4 py-2 rounded-lg w-full hover:bg-[#232A47] transition-colors">
        <FaInbox className="text-lg" />
        <span>Inbox</span>
        <span className="ml-auto bg-indigo-500 text-xs px-2 py-0.5 rounded text-white">Pro</span>
      </button>
      <button className="flex items-center gap-3 px-4 py-2 rounded-lg w-full hover:bg-[#232A47] transition-colors">
        <FaFileInvoice className="text-lg" />
        <span>Invoice</span>
      </button>
    </nav>
  </aside>
);

export default Sidebar;