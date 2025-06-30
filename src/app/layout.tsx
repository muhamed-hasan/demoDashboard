import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from '@/components/Sidebar';
import { FaCog } from 'react-icons/fa';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Attendance Dashboard",
  description: "Attendance management system dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // تحديد الثيم من الكوكيز (SSR/CSR)
  let htmlClass = `${inter.variable} antialiased bg-gradient-to-tr from-indigo-100 via-white to-blue-100 min-h-screen`;
  if (typeof window !== 'undefined') {
    if (document.cookie.includes('theme=dark')) {
      htmlClass += ' dark';
    }
  }
  // في SSR دائماً light، لكن عند mount سيعدلها Sidebar
  return (
    <html lang="en" className={htmlClass}>
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen pl-64">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center justify-between px-8 py-4 shadow-sm">
              <div></div>
              <div className="flex items-center gap-6">
                <button className="p-2 rounded-full hover:bg-indigo-100 text-indigo-600">
                  <FaCog className="text-lg" />
                </button>
              </div>
            </header>
            <main className="flex-1 px-8 py-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
