"use client";
import React, { useState, useEffect } from "react";

interface AttendanceRecord {
  id: string;
  name: string;
  login: string | null;
  logout: string | null;
  hours: number;
}

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);
    fetch(`/api/attendance-details?startDate=${selectedDate}&endDate=${selectedDate}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        // لكل موظف، نأخذ أول تسجيل دخول وآخر تسجيل خروج
        const grouped: Record<string, AttendanceRecord> = {};
        data.forEach((rec: any) => {
          if (!grouped[rec.id]) {
            grouped[rec.id] = {
              id: rec.id,
              name: rec.name,
              login: rec.login,
              logout: rec.logout,
              hours: rec.hours,
            };
          } else {
            // تحديث أول تسجيل دخول إذا كان أقدم
            if (
              rec.login &&
              (!grouped[rec.id].login || rec.login < grouped[rec.id].login)
            ) {
              grouped[rec.id].login = rec.login;
            }
            // تحديث آخر تسجيل خروج إذا كان أحدث
            if (
              rec.logout &&
              (!grouped[rec.id].logout || rec.logout > grouped[rec.id].logout)
            ) {
              grouped[rec.id].logout = rec.logout;
            }
          }
        });
        // حساب عدد الساعات بين أول دخول وآخر خروج
        const result = Object.values(grouped).map((rec) => {
          let hours = 0;
          if (rec.login && rec.logout) {
            const [h1, m1] = rec.login.split(":").map(Number);
            const [h2, m2] = rec.logout.split(":").map(Number);
            let t1 = h1 * 60 + m1;
            let t2 = h2 * 60 + m2;
            if (t2 < t1) t2 += 24 * 60; // دعم الورديات الليلية
            hours = Math.round(((t2 - t1) / 60) * 100) / 100;
          } else {
            hours = 0;
          }
          return { ...rec, hours };
        });
        setRecords(result);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Attendance Reports</h1>
      <div className="mb-6 flex items-center gap-4">
        <label className="font-medium">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded shadow">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">First Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Logout</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hours</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {records.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-400">
                  No records found for this date
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{rec.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{rec.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{rec.login || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{rec.logout || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{rec.hours}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 