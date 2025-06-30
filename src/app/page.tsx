'use client';

import { useEffect, useState, useCallback } from 'react';
import { TableData } from '@/types/table';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FilterProvider } from '@/contexts/FilterContext';
import AttendanceTable, { AttendanceData } from '@/components/AttendanceTable';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Types for stats
interface AttendanceStats {
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  deptDistribution: { [key: string]: number };
  shiftDistribution: { [key: string]: number };
  heidelbergStats?: {
    totalEmployees: number;
    presentCount: number;
    absentCount: number;
  };
  naserStats?: {
    totalEmployees: number;
    presentCount: number;
    absentCount: number;
  };
}

export default function Home() {
  const [data, setData] = useState<TableData[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('today');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshTrigger] = useState(0);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [availableShifts, setAvailableShifts] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });

  const handleDateRangeChange = (range: 'today' | 'week' | 'month' | 'year' | 'custom') => {
    const today = new Date();
    let start = new Date();
    const end = new Date();

    switch (range) {
      case 'today':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'week':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start = new Date(today);
        start.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        start = new Date(today);
        start.setFullYear(today.getFullYear() - 1);
        break;
      case 'custom':
        // Don't change the dates for custom range
        setDateRange(range);
        return;
    }

    setDateRange(range);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };


  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
      });
      
      // Add filter parameters to stats API
      if (selectedDepartments.length > 0) {
        selectedDepartments.forEach(dept => params.append('department', dept));
      }
      if (selectedShift && selectedShift !== 'all') {
        params.append('shift', selectedShift);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/stats?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const result = await response.json();
      setStats(result);
      
      // Update available departments and shifts only when no filters are applied
      if (selectedDepartments.length === 0 && selectedShift === 'all' && !searchQuery) {
        if (result.deptDistribution) {
          setAvailableDepartments(Object.keys(result.deptDistribution));
        }
        if (result.shiftDistribution) {
          setAvailableShifts(Object.keys(result.shiftDistribution));
        }
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [startDate, endDate, selectedDepartments, selectedShift, searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          startDate,
          endDate,
          page: page.toString(),
          limit: rowsPerPage.toString(),
        });
        
        // Add filter parameters
        if (selectedDepartments.length > 0) {
          selectedDepartments.forEach(dept => params.append('department', dept));
        }
        if (selectedShift && selectedShift !== 'all') {
          params.append('shift', selectedShift);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        console.log('Fetching data with params:', params.toString());
        
        const response = await fetch(`/api/table-data?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Transform the data to match the expected format
        const transformedData: TableData[] = result.data.map((item: Record<string, unknown>) => ({
          id: item.id as string,
          time: item.time as string,
          fullName: item.fullName as string,
          shift: item.shift as string,
          department: item.department as string,
        }));
        
        setData(transformedData);
          setPaginationInfo(result.pagination);
        
        // Fetch employee details for additional data
        try {
          const detailsResponse = await fetch('/api/details');
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            if (detailsData.success && detailsData.data) {
              // Create a map of employee details by ID
              const employeeDetailsMap = new Map();
              detailsData.data.forEach((employee: Record<string, unknown>) => {
                employeeDetailsMap.set(employee.id?.toString(), employee);
              });
              
              // Enrich the attendance data with employee details
              const enrichedData = transformedData.map(item => {
                const employeeDetails = employeeDetailsMap.get(item.id);
                return {
                  ...item,
                  firstName: employeeDetails?.first_name || '',
                  lastName: employeeDetails?.last_name || '',
                  department: employeeDetails?.department || item.department,
                  shift: employeeDetails?.shift || item.shift,
                };
              });
              
              setData(enrichedData);
            }
          }
        } catch (detailsError) {
          console.error('Error fetching employee details:', detailsError);
          // Continue with the original data if details fetch fails
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, selectedDepartments, selectedShift, searchQuery, page, rowsPerPage, refreshTrigger]);

  // Fetch initial data and stats
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchStats(),
          // Initial data fetch will be handled by the other useEffect
        ]);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchStats]);

  const handleSearch = () => {
    setSearchQuery(searchText);
    setPage(1); // Reset to first page when searching
  };

  const handleClearFilters = () => {
    setSelectedDepartments([]);
    setSelectedShift('all');
    setSearchText('');
    setSearchQuery('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when changing rows per page
  };

  // Transform data for AttendanceTable component
  const attendanceData: AttendanceData[] = data.map(item => ({
    id: item.id,
    date: item.time, // Using time as date for display
    name: item.fullName,
    department: item.department,
    shift: item.shift,
    login: item.time,
  }));

  if (loading) {
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
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <FilterProvider value={{
    dateRange,
    startDate,
    endDate,
    selectedDepartments,
    selectedShift,
    searchText,
    setDateRange,
    setStartDate,
    setEndDate,
    setSelectedDepartments,
    setSelectedShift,
    setSearchText,
    }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                لوحة تحكم الحضور والانصراف
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                عرض إحصائيات الحضور والانصراف للموظفين
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نطاق التاريخ
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => handleDateRangeChange(e.target.value as 'today' | 'week' | 'month' | 'year' | 'custom')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="today">اليوم</option>
                    <option value="week">آخر أسبوع</option>
                    <option value="month">آخر شهر</option>
                    <option value="year">آخر سنة</option>
                    <option value="custom">مخصص</option>
                  </select>
                </div>

                {/* Custom Date Range */}
                {dateRange === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        من تاريخ
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        إلى تاريخ
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </>
                )}

                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    القسم
                  </label>
                  <select
                    value={selectedDepartments[0] || ''}
                    onChange={(e) => setSelectedDepartments(e.target.value ? [e.target.value] : [])}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">كل الأقسام</option>
                    {availableDepartments.map(dept => (
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
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">كل الشيفتات</option>
                    {availableShifts.map(shift => (
                      <option key={shift} value={shift}>{shift}</option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    البحث
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="البحث بالاسم..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      بحث
                    </button>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    مسح الفلاتر
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">جدول الحضور والانصراف</h2>
                <div className="flex items-center gap-4">
                  {/* Rows per page */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">صفوف في الصفحة:</label>
                <select
                      value={rowsPerPage}
                      onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                </select>
                  </div>
                  </div>
              </div>

              <AttendanceTable data={attendanceData} />

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  عرض {((paginationInfo.currentPage - 1) * paginationInfo.limit) + 1} إلى{' '}
                  {Math.min(paginationInfo.currentPage * paginationInfo.limit, paginationInfo.totalCount)} من{' '}
                  {paginationInfo.totalCount} نتيجة
              </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                    disabled={!paginationInfo.hasPrevPage}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    السابق
                  </button>
                  
                  <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                    صفحة {paginationInfo.currentPage} من {paginationInfo.totalPages}
                    </span>
                    
                    <button
                    onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                      disabled={!paginationInfo.hasNextPage}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    التالي
                    </button>
                  </div>
                </div>
                
              {/* Debug Info */}
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Debug: Page={page}, TotalPages={paginationInfo.totalPages}, TotalCount={paginationInfo.totalCount}, HasNext={paginationInfo.hasNextPage}, HasPrev={paginationInfo.hasPrevPage}
                </div>
              </div>
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}
