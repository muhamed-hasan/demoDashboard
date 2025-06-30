// Employee interface
export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  employeeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Attendance record interface
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employee?: Employee;
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'partial_day';
  notes?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Statistics response interface
export interface StatsResponse {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageHoursWorked: number;
  attendanceRate: number;
  departmentStats: {
    department: string;
    totalEmployees: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: number;
  }[];
  weeklyStats: {
    date: string;
    presentCount: number;
    absentCount: number;
    totalHours: number;
  }[];
  monthlyTrends: {
    month: string;
    attendanceRate: number;
    averageHours: number;
  }[];
}

// Additional utility types
export type AttendanceStatus = AttendanceRecord['status'];

export interface AttendanceFilter {
  employeeId?: string;
  department?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus;
}

export interface AttendanceSummary {
  employeeId: string;
  employeeName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalHours: number;
  attendanceRate: number;
}
