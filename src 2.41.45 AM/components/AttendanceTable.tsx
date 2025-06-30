'use client';

import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
} from '@tanstack/react-table';

// Attendance data interface
export interface AttendanceData {
  date: string;
  id: string;
  name: string;
  department: string;
  shift: string;
  login: string | null;
  logout: string | null;
  hours: number;
  status: 'Present' | 'Late' | 'Absent' | 'Early Leave' | 'Partial Day';
}

interface AttendanceTableProps {
  data: AttendanceData[];
  loading?: boolean;
}

const columnHelper = createColumnHelper<AttendanceData>();

export default function AttendanceTable({ data, loading = false }: AttendanceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Status badge styling with modern design
  const getStatusBadge = (status: AttendanceData['status']) => {
    const baseClasses = 'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm';
    
    switch (status) {
      case 'Present':
        return `${baseClasses} bg-[#65b12a] text-white`;
      case 'Late':
        return `${baseClasses} bg-amber-500 text-white`;
      case 'Absent':
        return `${baseClasses} bg-red-500 text-white`;
      case 'Early Leave':
        return `${baseClasses} bg-orange-500 text-white`;
      case 'Partial Day':
        return `${baseClasses} bg-[#264847] text-white`;
      default:
        return `${baseClasses} bg-gray-500 text-white`;
    }
  };

  // Define columns
  const columns = useMemo(() => [
    columnHelper.accessor('date', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 text-left font-semibold text-[#264847] hover:text-[#65b12a] transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Date</span>
          <span className="text-xs">
            {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}
          </span>
        </button>
      ),
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return (
          <div className="flex flex-col">
            <span className="font-medium">{date.toLocaleDateString()}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor('id', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 text-left font-semibold text-[#264847] hover:text-[#65b12a] transition-colors"
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
          className="flex items-center space-x-1 text-left font-semibold text-[#264847] hover:text-[#65b12a] transition-colors"
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
          className="flex items-center space-x-1 text-left font-semibold text-[#264847] hover:text-[#65b12a] transition-colors"
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
          className="flex items-center space-x-1 text-left font-semibold text-[#264847] hover:text-[#65b12a] transition-colors"
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
        return (
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
            shift === 'Night' 
              ? 'bg-[#264847] text-white'
              : 'bg-[#65b12a] text-white'
          }`}>
            {shift || 'Day'}
          </span>
        );
      },
    }),
    columnHelper.accessor('login', {
      header: 'Login',
      cell: ({ getValue }) => {
        const login = getValue();
        return login ? (
          <span className="font-mono text-sm">{login}</span>
        ) : (
          <span className="text-gray-400 text-sm">--</span>
        );
      },
    }),
    columnHelper.accessor('logout', {
      header: 'Logout',
      cell: ({ getValue }) => {
        const logout = getValue();
        return logout ? (
          <span className="font-mono text-sm">{logout}</span>
        ) : (
          <span className="text-gray-400 text-sm">--</span>
        );
      },
    }),
    columnHelper.accessor('hours', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 text-left font-semibold text-[#264847] hover:text-[#65b12a] transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Hours</span>
          <span className="text-xs">
            {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}
          </span>
        </button>
      ),
      cell: ({ getValue }) => {
        const hours = getValue();
        return (
          <span className="font-mono text-sm">
            {hours > 0 ? `${hours.toFixed(2)}h` : '--'}
          </span>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 text-left font-semibold text-[#264847] hover:text-[#65b12a] transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Status</span>
          <span className="text-xs">
            {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}
          </span>
        </button>
      ),
      cell: ({ getValue }) => {
        const status = getValue();
        return (
          <span className={getStatusBadge(status)}>
            {status}
          </span>
        );
      },
    }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(data.length / pagination.pageSize),
  });

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#264847] rounded-xl shadow-lg border border-gray-100 dark:border-[#264847]/20">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#65b12a]"></div>
            <span className="text-gray-600 dark:text-white font-medium">Loading attendance data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#264847] rounded-xl shadow-lg border border-gray-100 dark:border-[#264847]/20">
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="w-20 h-20 mb-6 bg-gradient-to-br from-[#65b12a]/10 to-[#264847]/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#65b12a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            No attendance records found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-3 max-w-md">
            There are no attendance records matching your current filters.
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-center text-sm" dir="rtl">
            لا توجد سجلات حضور تطابق المرشحات الحالية
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#264847] rounded-xl shadow-lg border border-gray-100 dark:border-[#264847]/20 overflow-hidden">
      {/* Table Header */}
      <div className="px-8 py-6 border-b border-gray-200 dark:border-[#264847]/30 bg-gradient-to-r from-[#65b12a]/5 to-[#264847]/5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#264847] dark:text-white">
            Attendance Records
          </h2>
          <div className="text-sm font-medium text-[#65b12a] bg-[#65b12a]/10 px-3 py-1 rounded-full">
            Total: {data.length} records
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-[#264847]/30">
          <thead className="bg-gradient-to-r from-[#65b12a]/10 to-[#264847]/10 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-bold text-[#264847] dark:text-white uppercase tracking-wider cursor-pointer hover:bg-[#65b12a]/10 transition-colors"
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
          <tbody className="bg-white dark:bg-[#264847] divide-y divide-gray-200 dark:divide-[#264847]/30">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gradient-to-r hover:from-[#65b12a]/5 hover:to-[#264847]/5 transition-all duration-200"
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

      {/* Pagination */}
      <div className="px-8 py-6 border-t border-gray-200 dark:border-[#264847]/30 bg-gradient-to-r from-[#65b12a]/5 to-[#264847]/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#264847] dark:text-gray-200 font-medium">
              Showing{' '}
              <span className="font-bold text-[#65b12a]">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-bold text-[#65b12a]">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  data.length
                )}
              </span>{' '}
              of{' '}
              <span className="font-bold text-[#65b12a]">{data.length}</span> results
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Page size selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-[#264847] dark:text-gray-200 font-medium">
                Rows per page:
              </label>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="rounded-lg border-gray-300 shadow-sm focus:border-[#65b12a] focus:ring-[#65b12a] sm:text-sm dark:bg-[#264847] dark:border-[#264847]/30 dark:text-white font-medium"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-4 py-2 text-sm font-semibold text-[#264847] bg-white border border-[#264847]/20 rounded-lg hover:bg-[#65b12a] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#264847] dark:border-[#264847]/30 dark:text-white dark:hover:bg-[#65b12a] transition-all shadow-sm"
              >
                First
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-4 py-2 text-sm font-semibold text-[#264847] bg-white border border-[#264847]/20 rounded-lg hover:bg-[#65b12a] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#264847] dark:border-[#264847]/30 dark:text-white dark:hover:bg-[#65b12a] transition-all shadow-sm"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-bold text-[#264847] dark:text-white bg-[#65b12a]/10 rounded-lg">
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-4 py-2 text-sm font-semibold text-[#264847] bg-white border border-[#264847]/20 rounded-lg hover:bg-[#65b12a] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#264847] dark:border-[#264847]/30 dark:text-white dark:hover:bg-[#65b12a] transition-all shadow-sm"
              >
                Next
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-4 py-2 text-sm font-semibold text-[#264847] bg-white border border-[#264847]/20 rounded-lg hover:bg-[#65b12a] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#264847] dark:border-[#264847]/30 dark:text-white dark:hover:bg-[#65b12a] transition-all shadow-sm"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
