'use client';

import { useState, useEffect } from 'react';
import { FaDatabase, FaUsers, FaSearch, FaFilter } from 'react-icons/fa';

interface EmployeeDetail {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
  shift: string;
}

export default function DetailsPage() {
  const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');

  // Get unique departments and shifts for filters
  const departments = [...new Set(employees.map(emp => emp.department))].sort();
  const shifts = [...new Set(employees.map(emp => emp.shift).filter(shift => shift))].sort();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, departmentFilter, shiftFilter]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/details');
      const result = await response.json();

      if (result.success) {
        setEmployees(result.data);
        setError(null);
      } else {
        setError(result.error || 'حدث خطأ أثناء جلب البيانات');
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toString().includes(searchTerm)
      );
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    // Shift filter
    if (shiftFilter) {
      filtered = filtered.filter(emp => emp.shift === shiftFilter);
    }

    setFilteredEmployees(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setShiftFilter('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchEmployees}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              تفاصيل الموظفين
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              عرض بيانات الموظفين من قاعدة البيانات
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FaUsers className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الموظفين</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FaDatabase className="text-2xl text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الأقسام</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{departments.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FaUsers className="text-2xl text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">شيفت صباحي</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {employees.filter(emp => emp.shift === 'Day').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <FaUsers className="text-2xl text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">شيفت مسائي</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {employees.filter(emp => emp.shift === 'Night').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <FaFilter className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">الفلاتر</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البحث
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="البحث بالاسم أو الرقم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  القسم
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">كل الأقسام</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Shift Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الشيفت
                </label>
                <select
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">كل الشيفتات</option>
                  {shifts.map(shift => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  مسح الفلاتر
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              تم العثور على <span className="font-semibold text-gray-900 dark:text-white">{filteredEmployees.length}</span> موظف
            </p>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الرقم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الاسم الأول
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الاسم الأخير
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      القسم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الشيفت
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {employee.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {employee.first_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {employee.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {employee.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {employee.shift ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.shift === 'Day' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          }`}>
                            {employee.shift}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            غير محدد
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">لا توجد نتائج</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  جرب تغيير الفلاتر أو البحث عن شيء آخر.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 