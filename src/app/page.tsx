import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Hello, World!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Welcome to Next.js
        </p>
      </main>
    </div>
  );
}
