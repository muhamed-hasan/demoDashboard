"use client";
import React, { useState, useEffect } from "react";

interface AttendanceRecord {
  id: string;
  name: string;
  department: string;
  shift: string;
  login: string | null;
  logout: string | null;
  hours: number;
  date: string;
  status: string;
}

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);
    
    const params = new URLSearchParams({
      startDate: selectedDate,
      endDate: selectedDate
    });
    
    if (selectedDepartment !== "All") {
      params.append('department', selectedDepartment);
    }
    
    fetch(`/api/reports?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then(errorData => {
            throw new Error(errorData.error || errorData.details || "Failed to fetch data");
          });
        }
        return res.json();
      })
      .then((data) => {
        setRecords(data);
      })
      .catch((err) => {
        console.error('Error fetching reports:', err);
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      })
      .finally(() => setLoading(false));
  }, [selectedDate, selectedDepartment]);

  const exportToCSV = () => {
    if (records.length === 0) return;
    
    const headers = [
      'الرقم الوظيفي',
      'اسم الموظف', 
      'القسم',
      'الشيفت',
      'التاريخ',
      'أول تسجيل دخول',
      'آخر تسجيل خروج',
      'ساعات العمل',
      'الحالة'
    ];
    
    const csvContent = [
      headers.join(','),
      ...records.map(rec => [
        rec.id,
        `"${rec.name}"`,
        `"${rec.department}"`,
        `"${rec.shift}"`,
        rec.date,
        rec.login || '-',
        rec.logout || '-',
        rec.hours,
        `"${rec.status}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">تقارير الحضور والانصراف</h1>
      
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700 dark:text-gray-300">التاريخ:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700 dark:text-gray-300">القسم:</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="rounded border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="All">جميع الأقسام</option>
            <option value="Heidelberg">Heidelberg</option>
            <option value="Naser">Naser</option>
            <option value="Abo Kastore">Abo Kastore</option>
            <option value="SDS">SDS</option>
            <option value="All Departments">All Departments</option>
          </select>
        </div>
        
        {records.length > 0 && (
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            تصدير CSV
          </button>
        )}
      </div>
      
      {loading && (
        <div className="flex justify-center my-8">
          <div className="text-gray-500 dark:text-gray-400">جاري تحميل البيانات...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي الموظفين</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{records.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">الحضور</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {records.filter(r => r.status === 'Present').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">الغياب</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {records.filter(r => r.status === 'Absent').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">نسبة الحضور</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {records.length > 0 ? `${((records.filter(r => r.status === 'Present').length / records.length) * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <thead className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-gray-700 dark:to-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الرقم الوظيفي</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">اسم الموظف</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">القسم</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الشيفت</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">التاريخ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">أول تسجيل دخول</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">آخر تسجيل خروج</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ساعات العمل</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الحالة</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {records.length === 0 && !loading ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400 dark:text-gray-500">
                  لا توجد بيانات لهذا التاريخ
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={`${rec.id}-${rec.date}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">{rec.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{rec.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{rec.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{rec.shift}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {rec.date ? (() => {
                      try {
                        // If date is already in YYYY-MM-DD format, format it nicely
                        if (typeof rec.date === 'string' && rec.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                          const [year, month, day] = rec.date.split('-');
                          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                          return date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });
                        }
                        
                        // Otherwise, try to parse as full date string
                        const date = new Date(rec.date);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });
                        }
                      } catch (error) {
                        console.error('Error formatting date:', rec.date, error);
                      }
                      return rec.date;
                    })() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {rec.login ? (() => {
                      try {
                        const time = new Date(rec.login);
                        if (!isNaN(time.getTime())) {
                          return time.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          });
                        }
                      } catch (error) {
                        console.error('Error formatting login time:', rec.login, error);
                      }
                      return rec.login;
                    })() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {rec.logout ? (() => {
                      try {
                        const time = new Date(rec.logout);
                        if (!isNaN(time.getTime())) {
                          return time.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          });
                        }
                      } catch (error) {
                        console.error('Error formatting logout time:', rec.logout, error);
                      }
                      return rec.logout;
                    })() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {rec.hours > 0 ? `${rec.hours.toFixed(2)} ساعة` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      rec.status === 'Present' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      rec.status === 'Late' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      rec.status === 'Partial Day' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {rec.status === 'Present' ? 'حاضر' :
                       rec.status === 'Late' ? 'متأخر' :
                       rec.status === 'Partial Day' ? 'يوم جزئي' :
                       rec.status === 'Early Leave' ? 'مغادرة مبكرة' :
                       'غائب'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 