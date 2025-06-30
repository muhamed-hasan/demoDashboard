'use client';

import { useEffect, useState, useCallback } from 'react';
import { TableData } from '@/types/table';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
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
import { FilterProvider, FilterContextType } from '@/contexts/FilterContext';
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

  const columnHelper = createColumnHelper<TableData>();

  const columns = [
    columnHelper.accessor('id', { header: 'ID' }),
    columnHelper.accessor('time', { header: 'Time' }),
    columnHelper.accessor('fullName', { header: 'Full Name' }),
    columnHelper.accessor('shift', { header: 'Shift' }),
    columnHelper.accessor('department', { header: 'Department' }),
  ];

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // حساب البيانات المعروضة في الصفحة الحالية
  const totalPages = paginationInfo.totalPages;

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
        
        console.log('API Response:', result);
        
        // Handle new pagination response format
        if (result.data && result.pagination) {
          setData(result.data);
          setPaginationInfo(result.pagination);
          console.log('Set pagination info:', result.pagination);
        } else {
          // Fallback for old format
        setData(result);
          setPaginationInfo({
            currentPage: page,
            totalPages: Math.ceil(result.length / rowsPerPage),
            totalCount: result.length,
            hasNextPage: page < Math.ceil(result.length / rowsPerPage),
            hasPrevPage: page > 1,
            limit: rowsPerPage
          });
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchStats();
  }, [startDate, endDate, selectedDepartments, selectedShift, searchQuery, refreshTrigger, fetchStats, page, rowsPerPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, selectedDepartments, selectedShift, searchQuery]);

  // Fetch initial data for departments and shifts on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch all departments from details table
        const detailsResponse = await fetch('/api/details');
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          if (detailsData.success && detailsData.data) {
          const departments = new Set<string>();
            const shifts = new Set<string>();
          
            // Extract all unique departments and shifts from details table
            detailsData.data.forEach((employee: any) => {
              if (employee.department) {
                departments.add(employee.department);
              }
              if (employee.shift) {
                shifts.add(employee.shift);
            }
          });
          
            // Convert Sets to Arrays and set available departments and shifts
            setAvailableDepartments(Array.from(departments).sort());
            setAvailableShifts(Array.from(shifts).sort());
          }
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };

    fetchInitialData();
  }, []);

  // Handle search button click
  const handleSearch = () => {
    setSearchQuery(searchText);
  };

  // Convert TableData to AttendanceData for the table component
  const attendanceData: AttendanceData[] = data.map(item => {
    const attendanceItem = {
      date: item.date || item.time, // Use date field if available, fallback to time
      id: item.id,
      name: item.fullName,
      department: item.department,
      shift: item.shift,
      login: item.time
    };
    
    // Debug log for first few items
    if (data.indexOf(item) < 3) {
      console.log('Attendance item:', {
        originalItem: item,
        convertedItem: attendanceItem,
        dateField: item.date,
        timeField: item.time
      });
    }
    
    return attendanceItem;
  });

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error</p>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Please check your database connection and try again.
          </p>
        </div>
      </div>
    );
  }

  // Chart data configurations
  const doughnutData = {
    labels: stats ? Object.keys(stats.deptDistribution) : [],
    datasets: [
      {
        data: stats ? Object.values(stats.deptDistribution) : [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  const barData = {
    labels: stats ? Object.keys(stats.shiftDistribution) : [],
    datasets: [
      {
        label: 'Employees by Shift',
        data: stats ? Object.values(stats.shiftDistribution) : [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const filterContextValue: FilterContextType = {
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
  };

  return (
    <div className="flex">
      <main className="flex-1 p-4">
    <FilterProvider value={filterContextValue}>
      <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-screen-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Attendance Dashboard</h1>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalEmployees || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.presentCount || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.absentCount || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {stats?.attendanceRate ? `${stats.attendanceRate.toFixed(1)}%` : '0%'}
                      </p>
                </div>
              </div>
            </div>
          </div>

          {/* Department Specific Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Heidelberg Department */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Heidelberg Department
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto w-12 h-12 flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.heidelbergStats?.totalEmployees || 0}</p>
                </div>
                <div className="text-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mx-auto w-12 h-12 flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats?.heidelbergStats?.presentCount || 0}</p>
                </div>
                <div className="text-center">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 mx-auto w-12 h-12 flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats?.heidelbergStats?.absentCount || 0}</p>
                </div>
              </div>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {stats?.heidelbergStats?.totalEmployees && stats.heidelbergStats.totalEmployees > 0 
                    ? `${((stats.heidelbergStats.presentCount / stats.heidelbergStats.totalEmployees) * 100).toFixed(1)}%`
                    : '0%'}
                </p>
              </div>
              {/* Heidelberg Pie Chart */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-2">Attendance Distribution</h4>
                <div className="h-48">
                  <Doughnut 
                    data={{
                      labels: ['Present', 'Absent'],
                      datasets: [{
                        data: [
                          stats?.heidelbergStats?.presentCount || 0,
                          stats?.heidelbergStats?.absentCount || 0
                        ],
                        backgroundColor: ['#10B981', '#EF4444'],
                        hoverBackgroundColor: ['#059669', '#DC2626'],
                        borderWidth: 0
                      }]
                    }} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#6B7280',
                            font: {
                              size: 12
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#FFFFFF',
                          titleColor: document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#111827',
                          bodyColor: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#6B7280',
                          borderColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#E5E7EB',
                          borderWidth: 1,
                          callbacks: {
                            label: function(context) {
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0';
                              return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Naser Department */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                Naser Department
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto w-12 h-12 flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.naserStats?.totalEmployees || 0}</p>
                </div>
                <div className="text-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mx-auto w-12 h-12 flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats?.naserStats?.presentCount || 0}</p>
                </div>
                <div className="text-center">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 mx-auto w-12 h-12 flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats?.naserStats?.absentCount || 0}</p>
                </div>
              </div>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {stats?.naserStats?.totalEmployees && stats.naserStats.totalEmployees > 0 
                    ? `${((stats.naserStats.presentCount / stats.naserStats.totalEmployees) * 100).toFixed(1)}%`
                    : '0%'}
                </p>
              </div>
              {/* Naser Pie Chart */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-2">Attendance Distribution</h4>
                <div className="h-48">
                  <Doughnut 
                    data={{
                      labels: ['Present', 'Absent'],
                      datasets: [{
                        data: [
                          stats?.naserStats?.presentCount || 0,
                          stats?.naserStats?.absentCount || 0
                        ],
                        backgroundColor: ['#10B981', '#EF4444'],
                        hoverBackgroundColor: ['#059669', '#DC2626'],
                        borderWidth: 0
                      }]
                    }} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#6B7280',
                            font: {
                              size: 12
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#FFFFFF',
                          titleColor: document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#111827',
                          bodyColor: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#6B7280',
                          borderColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#E5E7EB',
                          borderWidth: 1,
                          callbacks: {
                            label: function(context) {
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0';
                              return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Department Distribution</h3>
              <div className="h-64">
                  <Doughnut data={doughnutData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shift Distribution</h3>
              <div className="h-64">
                  <Bar data={barData} options={chartOptions} />
              </div>
            </div>
          </div>

              {/* Filters Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Range
                    </label>
                <select
                  value={dateRange}
                      onChange={(e) => handleDateRangeChange(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                      <option value="custom">Custom Range</option>
                </select>
              </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Department Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                <select
                  value={selectedDepartments.length > 0 ? selectedDepartments[0] : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedDepartments(value ? [value] : []);
                  }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Departments</option>
                      {availableDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                </select>
              </div>

                  {/* Shift Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Shift
                    </label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Shifts</option>
                      {availableShifts.map((shift) => (
                        <option key={shift} value={shift}>
                          {shift}
                        </option>
                  ))}
                </select>
              </div>

                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search
                    </label>
                <div className="flex">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search by name, department..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    onClick={handleSearch}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                        Search
                  </button>
                </div>
              </div>
            </div>
          </div>
          
              {/* Pagination Controls */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, paginationInfo.totalCount)} of {paginationInfo.totalCount} results
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        Rows per page:
                      </label>
                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          console.log('Changing rows per page to:', e.target.value);
                          setRowsPerPage(Number(e.target.value));
                          setPage(1);
                        }}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {[10, 20, 30, 40, 50].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        console.log('Going to first page');
                        setPage(1);
                      }}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      First
                    </button>
                    <button
                      onClick={() => {
                        console.log('Going to previous page, current page:', page);
                        setPage(page - 1);
                      }}
                      disabled={!paginationInfo.hasPrevPage}
                      className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Page {page} of {paginationInfo.totalPages}
                    </span>
                    <button
                      onClick={() => {
                        console.log('Going to next page, current page:', page, 'hasNextPage:', paginationInfo.hasNextPage);
                        setPage(page + 1);
                      }}
                      disabled={!paginationInfo.hasNextPage}
                      className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => {
                        console.log('Going to last page, total pages:', paginationInfo.totalPages);
                        setPage(paginationInfo.totalPages);
                      }}
                      disabled={page === paginationInfo.totalPages}
                      className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Last
                    </button>
                  </div>
                </div>
                
                {/* Debug info */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Debug: Page={page}, TotalPages={paginationInfo.totalPages}, TotalCount={paginationInfo.totalCount}, HasNext={paginationInfo.hasNextPage}, HasPrev={paginationInfo.hasPrevPage}
                </div>
              </div>
            
              {/* Attendance Table */}
            <AttendanceTable 
              data={attendanceData} 
                loading={loading} 
            />
          </div>
        </div>
        </FilterProvider>
      </main>
      </div>
  );
}
