'use client';

import { useEffect, useState, useCallback } from 'react';
import { TableData } from '@/types/table';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FilterProvider } from '@/contexts/FilterContext';
import AttendanceTable, { AttendanceData } from '@/components/AttendanceTable';
import { BarChart3, Home as HomeIcon, Users, Settings } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
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
        // DEBUG: Raw data from API response
        console.log('[Home] Raw result.data (first 10):', JSON.stringify(result.data.slice(0, 10), null, 2));
        const transformedData: TableData[] = result.data.map((item: Record<string, unknown>) => ({
          id: item.id as string,
          time: item.time as string,
          fullName: item.fullName as string,
          shift: item.shift as string,
          department: item.department as string,
          date: item.date as string,
        }));
        
        // DEBUG: Transformed data before enrichment
        console.log('[Home] TransformedData (first 10):', JSON.stringify(transformedData.slice(0, 10), null, 2));
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
              // DEBUG: Begin enrichment of transformedData
              const enrichedData = transformedData.map(item => {
                const employeeDetails = employeeDetailsMap.get(item.id);
                return {
                  ...item,
                  date: item.date, // احتفظ بحقل التاريخ كما هو
                  firstName: employeeDetails?.first_name || '',
                  lastName: employeeDetails?.last_name || '',
                  department: employeeDetails?.department || item.department,
                  shift: employeeDetails?.shift || item.shift,
                };
              });
              
              // DEBUG: EnrichedData before set
               console.log('[Home] EnrichedData (first 10):', JSON.stringify(enrichedData.slice(0, 10), null, 2));
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

  // اطبع البيانات القادمة من الAPI قبل أي معالجة
  if (typeof window !== 'undefined') {
    console.log('raw data from API:', data);
  }

  // Transform data for AttendanceTable component
  const attendanceData: AttendanceData[] = data.map(item => ({
    id: item.id,
    date: item.date || item.time, // Use date field if available, otherwise use time
    name: item.fullName,
    department: item.department,
    shift: item.shift,
    login: item.time,
  }));

  // اطبع البيانات في كونسول المتصفح
  if (typeof window !== 'undefined') {
    console.log('attendanceData to AttendanceTable:', attendanceData);
  }

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
      <div className="min-h-screen" style={{ background: 'var(--background)', fontFamily: 'Cairo, sans-serif' }}>
        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-emerald-800 to-emerald-900 backdrop-blur-xl border-r border-white/10">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">industry-run</h1>
              </div>
            </div>
            <nav className="space-y-2">
              <div className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4">MENU</div>
              <button className="flex items-center w-full gap-3 text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl px-3 py-2">
                <HomeIcon className="w-4 h-4" />
                Dashboard
              </button>
              <button className="flex items-center w-full gap-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-3 py-2">
                <Users className="w-4 h-4" />
                Details
              </button>
            </nav>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Settings className="w-4 h-4" />
                Dark Theme
              </div>
              <div className="text-white/60 text-xs mt-1">AI/X Developed by industry-run</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                لوحة تحكم الحضور والانصراف
              </h1>
              <p style={{ color: 'var(--secondary)' }}>
                عرض إحصائيات الحضور والانصراف للموظفين
              </p>
            </div>

            {/* Filters */}
            <div style={{ background: 'var(--card-background)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }} className="p-6 mb-6">
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

            {/* Stats Cards */}
            {stats && (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div style={{ background: 'var(--info)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }} className="p-6">
                  <div className="flex items-center">
                    <div style={{ background: 'var(--info)', color: 'var(--info-text)' }} className="p-3 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p style={{ color: 'var(--info-text)' }} className="text-sm font-medium">إجمالي الموظفين</p>
                      <p style={{ color: 'var(--info-text)' }} className="text-2xl font-bold">{stats.totalEmployees}</p>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'var(--success)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }} className="p-6">
                  <div className="flex items-center">
                    <div style={{ background: 'var(--success)', color: 'var(--success-text)' }} className="p-3 rounded-lg">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p style={{ color: 'var(--success-text)' }} className="text-sm font-medium">الحضور</p>
                      <p style={{ color: 'var(--success-text)' }} className="text-2xl font-bold">{stats.presentCount}</p>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'var(--danger)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }} className="p-6">
                  <div className="flex items-center">
                    <div style={{ background: 'var(--danger)', color: 'var(--danger-text)' }} className="p-3 rounded-lg">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p style={{ color: 'var(--danger-text)' }} className="text-sm font-medium">الغياب</p>
                      <p style={{ color: 'var(--danger-text)' }} className="text-2xl font-bold">{stats.absentCount}</p>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'var(--accent)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }} className="p-6">
                  <div className="flex items-center">
                    <div style={{ background: 'var(--accent)', color: 'var(--accent-text)' }} className="p-3 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p style={{ color: 'var(--accent-text)' }} className="text-sm font-medium">معدل الحضور</p>
                      <p style={{ color: 'var(--accent-text)' }} className="text-2xl font-bold">{stats.attendanceRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Department Stats */}
            {stats?.heidelbergStats && stats?.naserStats && (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Heidelberg Department */}
                <div style={{ background: 'var(--card-background)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }} className="p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Heidelberg</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <p className="text-sm" style={{ color: 'var(--secondary)' }}>معدل الحضور</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                        {stats.heidelbergStats.totalEmployees > 0 
                          ? ((stats.heidelbergStats.presentCount / stats.heidelbergStats.totalEmployees) * 100).toFixed(1)
                          : '0'}%
                      </p>
                    </div>
                    <div className="w-24 h-24">
                      <Doughnut 
                        data={{
                          labels: ['حاضر', 'غائب'],
                          datasets: [{
                            data: [stats.heidelbergStats.presentCount, stats.heidelbergStats.absentCount],
                            backgroundColor: [
                              '#10b981', // green
                              '#ef4444'  // red
                            ],
                            borderWidth: 0,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* Naser Department */}
                <div style={{ background: 'var(--card-background)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }} className="p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Naser</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <p className="text-sm" style={{ color: 'var(--secondary)' }}>معدل الحضور</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                        {stats.naserStats.totalEmployees > 0 
                          ? ((stats.naserStats.presentCount / stats.naserStats.totalEmployees) * 100).toFixed(1)
                          : '0'}%
                      </p>
                    </div>
                    <div className="w-24 h-24">
                      <Doughnut
                        data={{
                          labels: ['حاضر', 'غائب'],
                          datasets: [{
                            data: [stats.naserStats.presentCount, stats.naserStats.absentCount],
                            backgroundColor: [
                              '#10b981', // green
                              '#ef4444'  // red
                            ],
                            borderWidth: 0,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Table */}
            <div style={{ background: 'var(--card-background)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }} className="p-6">
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
