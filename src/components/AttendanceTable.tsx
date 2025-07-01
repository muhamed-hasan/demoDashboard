'use client';

import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';

// Helper function to fix date parsing issues
function fixDateString(dateString: string): Date {
  try {
    // If the string is empty or null, return current date
    if (!dateString) {
      return new Date();
    }
    
    let date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return new Date();
    }
    
    // Only fix if the year is clearly wrong (like 2001, 1970, etc.)
    if (date.getFullYear() < 2020 && date.getFullYear() > 1900) {
      // Try different parsing approaches
      if (typeof dateString === 'string') {
        // Approach 1: If it contains space, split date and time
        if (dateString.includes(' ')) {
          const parts = dateString.split(' ');
          if (parts.length >= 2) {
            const datePart = parts[0];
            const timePart = parts[1];
            
            const dateParts = datePart.split('-');
            if (dateParts.length === 3) {
              const year = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
              const day = parseInt(dateParts[2]);
              
              // If year is wrong, use 2025
              const correctYear = year < 2020 ? 2025 : year;
              date = new Date(correctYear, month, day);
              
              // Add time if available
              if (timePart) {
                const timeParts = timePart.split(':');
                if (timeParts.length >= 2) {
                  const hours = parseInt(timeParts[0]);
                  const minutes = parseInt(timeParts[1]);
                  const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;
                  date.setHours(hours, minutes, seconds);
                }
              }
            }
          }
        } else {
          // Approach 2: If it's just a date string, try to extract year and fix
          const dateParts = dateString.split('-');
          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);
            
            if (year < 2020) {
              const correctYear = 2025;
              date = new Date(correctYear, month, day);
            }
          }
        }
      }
    }
    
    return date;
  } catch (error) {
    console.error('Error fixing date string:', dateString, error);
    return new Date();
  }
}

// Attendance data interface
export interface AttendanceData {
  date: string;
  id: string;
  name: string;
  department: string;
  shift: string;
  login: string | null;
}

interface AttendanceTableProps {
  data: AttendanceData[];
  loading?: boolean;
}

const columnHelper = createColumnHelper<AttendanceData>();

export default function AttendanceTable({ data, loading = false }: AttendanceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Define columns
  const columns = useMemo(() => [
    columnHelper.accessor('date', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 text-left font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Date</span>
          <span className="text-xs">
            {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}
          </span>
        </button>
      ),
      cell: ({ getValue }) => {
        const dateValue = getValue();
        let date: Date;
        
        try {
          // Handle different date formats
          if (typeof dateValue === 'string') {
            // First try to parse normally
            date = new Date(dateValue);
            
            // Only use fixDateString if the date is clearly wrong
            if (isNaN(date.getTime()) || (date.getFullYear() < 2020 && date.getFullYear() > 1900)) {
              date = fixDateString(dateValue);
            }
          } else {
            date = dateValue;
          }
          
          // Check if date is valid
          if (isNaN(date.getTime())) {
            return <span className="text-red-500">Invalid Date</span>;
          }
          
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          );
        } catch (error) {
          console.error('Error parsing date:', dateValue, error);
          return <span className="text-red-500">Date Error</span>;
        }
      },
    }),
    columnHelper.accessor('id', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 text-left font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>ID</span>
          <span className="text-xs">
            {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}
          </span>
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue()}</span>
      ),
    }),
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 text-left font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Name</span>
          <span className="text-xs">
            {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}
          </span>
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue()}</span>
      ),
    }),
    columnHelper.accessor('department', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 text-left font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Department</span>
          <span className="text-xs">
            {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}
          </span>
        </button>
      ),
    }),
    columnHelper.accessor('shift', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 text-left font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Shift</span>
          <span className="text-xs">
            {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}
          </span>
        </button>
      ),
      cell: ({ getValue }) => {
        const shift = getValue();
        const normalizedShift = shift?.toLowerCase() || '';
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            normalizedShift === 'night' 
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
          }`}>
            {shift || 'Day'}
          </span>
        );
      },
    }),
    columnHelper.accessor('login', {
      header: 'Login Time',
      cell: ({ getValue }) => {
        const login = getValue();
        return login ? (
          <span className="font-mono text-sm">{login}</span>
        ) : (
          <span className="text-gray-400 text-sm">--</span>
        );
      },
    }),
  ] as ColumnDef<AttendanceData>[], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-500 dark:text-gray-400">Loading attendance data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No attendance records found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
            There are no attendance records matching your current filters.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-center text-sm" dir="rtl">
            لا توجد سجلات حضور تطابق المرشحات الحالية
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Attendance Records
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {data.length} records
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
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
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
