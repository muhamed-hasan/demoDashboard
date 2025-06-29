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
  const [refreshTrigger] = useState(0);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [availableShifts, setAvailableShifts] = useState<string[]>([]);

  const columnHelper = createColumnHelper<TableData>();

  const columns = [
    columnHelper.accessor('id', { header: 'ID' }),
    columnHelper.accessor('time', { header: 'Time' }),
    columnHelper.accessor('fullName', { header: 'Full Name' }),
    columnHelper.accessor('shift', { header: 'Shift' }),
    columnHelper.accessor('department', { header: 'Department' }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
      const response = await fetch(`/api/stats?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const result = await response.json();
      setStats(result);
      
      // Update available departments and shifts
      if (result.deptDistribution) {
        setAvailableDepartments(Object.keys(result.deptDistribution));
      }
      if (result.shiftDistribution) {
        setAvailableShifts(Object.keys(result.shiftDistribution));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          startDate,
          endDate,
        });
        
        // Add filter parameters
        if (selectedDepartments.length > 0) {
          selectedDepartments.forEach(dept => params.append('department', dept));
        }
        if (selectedShift && selectedShift !== 'all') {
          params.append('shift', selectedShift);
        }
        if (searchText) {
          params.append('search', searchText);
        }
        
        const response = await fetch(`/api/table-data?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchStats();
  }, [startDate, endDate, selectedDepartments, selectedShift, searchText, refreshTrigger, fetchStats]);

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.attendanceRate.toFixed(1) || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Department Distribution</h3>
              <div className="h-64">
                {stats && Object.keys(stats.deptDistribution).length > 0 ? (
                  <Doughnut data={doughnutData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Shift Distribution</h3>
              <div className="h-64">
                {stats && Object.keys(stats.shiftDistribution).length > 0 ? (
                  <Bar data={barData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters Toolbar */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value as 'today' | 'week' | 'month' | 'year' | 'custom')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Custom Date Inputs */}
              {dateRange === 'custom' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </>
              )}

              {/* Department Multi-Select */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Departments</label>
                <select
                  multiple
                  value={selectedDepartments}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedDepartments(values);
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  size={3}
                >
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Shift Select */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shift</label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Shifts</option>
                  {availableShifts.map(shift => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="flex justify-center my-4">
              <p className="text-gray-500 dark:text-gray-400">Loading data...</p>
            </div>
          )}
          
          {/* Table */}
          <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={columns.length} 
                      className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No records found for the selected filters
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}
