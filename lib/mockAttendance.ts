import employeeData from '../public/data.json';

// Types
export interface AttendanceRecord {
  date: string;
  id: string;
  login: string | null;
  logout: string | null;
  totalHours: number;
  status: 'Present' | 'Late' | 'Absent';
}

interface Employee {
  'First Name': string;
  'Last Name': string;
  Department: string;
  Shift: string;
}

// Configuration
const ABSENTEEISM_RATE = 0.05; // 5% chance of being absent
const LATE_RATE = 0.10; // 10% chance of being late (when present)
const DAYS_TO_GENERATE = 30;

// Helper functions
function getRandomMinutes(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  return formatTime(newHours, newMinutes);
}

function calculateHoursDifference(loginTime: string, logoutTime: string): number {
  const [loginHours, loginMinutes] = loginTime.split(':').map(Number);
  const [logoutHours, logoutMinutes] = logoutTime.split(':').map(Number);
  
  const loginTotalMinutes = loginHours * 60 + loginMinutes;
  let logoutTotalMinutes = logoutHours * 60 + logoutMinutes;
  
  // Handle overnight shifts (night shift logout next day)
  if (logoutTotalMinutes < loginTotalMinutes) {
    logoutTotalMinutes += 24 * 60; // Add 24 hours
  }
  
  const diffMinutes = logoutTotalMinutes - loginTotalMinutes;
  return Number((diffMinutes / 60).toFixed(2));
}

function generateLoginTime(shift: string, isLate: boolean): string {
  let baseHour: number;
  let baseMinute: number;
  let varianceMinutes: number;
  
  // Normalize shift values
  const normalizedShift = shift.toLowerCase().trim();
  
  if (normalizedShift === 'night') {
    // Night shift: 19:45–20:15
    baseHour = 19;
    baseMinute = 45;
    varianceMinutes = 30; // 30 minutes variance
  } else {
    // Day shift (default): 07:45–08:15
    baseHour = 7;
    baseMinute = 45;
    varianceMinutes = 30; // 30 minutes variance
  }
  
  let loginMinute = baseMinute + getRandomMinutes(0, varianceMinutes);
  let loginHour = baseHour;
  
  // Handle minute overflow
  if (loginMinute >= 60) {
    loginHour += Math.floor(loginMinute / 60);
    loginMinute = loginMinute % 60;
  }
  
  // If late, add additional 5-45 minutes
  if (isLate) {
    const lateMinutes = getRandomMinutes(5, 45);
    loginMinute += lateMinutes;
    
    if (loginMinute >= 60) {
      loginHour += Math.floor(loginMinute / 60);
      loginMinute = loginMinute % 60;
    }
  }
  
  return formatTime(loginHour, loginMinute);
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday and Saturday (assuming Friday-Saturday weekend)
}

function generateAttendanceRecord(
  employeeId: string,
  employee: Employee,
  date: Date
): AttendanceRecord {
  const dateStr = date.toISOString().split('T')[0];
  
  // Skip weekends - mark as absent
  if (isWeekend(date)) {
    return {
      date: dateStr,
      id: employeeId,
      login: null,
      logout: null,
      totalHours: 0,
      status: 'Absent'
    };
  }
  
  // Random absence
  if (Math.random() < ABSENTEEISM_RATE) {
    return {
      date: dateStr,
      id: employeeId,
      login: null,
      logout: null,
      totalHours: 0,
      status: 'Absent'
    };
  }
  
  // Employee is present - determine if late
  const isLate = Math.random() < LATE_RATE;
  const loginTime = generateLoginTime(employee.Shift, isLate);
  
  // Calculate logout time (8 hours later with small variance)
  const workHours = 8;
  const workMinutes = workHours * 60 + getRandomMinutes(-15, 30); // ±15-30 minutes variance
  const logoutTime = addMinutesToTime(loginTime, workMinutes);
  
  const totalHours = calculateHoursDifference(loginTime, logoutTime);
  
  return {
    date: dateStr,
    id: employeeId,
    login: loginTime,
    logout: logoutTime,
    totalHours,
    status: isLate ? 'Late' : 'Present'
  };
}

// Generate mock attendance data
export function generateMockAttendance(): AttendanceRecord[] {
  const attendanceRecords: AttendanceRecord[] = [];
  const employees = employeeData as Record<string, Employee>;
  
  // Generate records for the last 30 days
  for (let dayOffset = 0; dayOffset < DAYS_TO_GENERATE; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    
    // Generate records for each employee
    Object.entries(employees).forEach(([employeeId, employee]) => {
      const record = generateAttendanceRecord(employeeId, employee, date);
      attendanceRecords.push(record);
    });
  }
  
  // Sort by date (newest first) and then by employee ID
  attendanceRecords.sort((a, b) => {
    const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    return parseInt(a.id) - parseInt(b.id);
  });
  
  return attendanceRecords;
}

// In-memory storage for development
let mockAttendanceData: AttendanceRecord[] | null = null;

export function getMockAttendanceData(): AttendanceRecord[] {
  if (!mockAttendanceData) {
    mockAttendanceData = generateMockAttendance();
  }
  return mockAttendanceData;
}

// Get attendance for specific employee
export function getEmployeeAttendance(employeeId: string): AttendanceRecord[] {
  const allRecords = getMockAttendanceData();
  return allRecords.filter(record => record.id === employeeId);
}

// Get attendance for specific date
export function getDateAttendance(date: string): AttendanceRecord[] {
  const allRecords = getMockAttendanceData();
  return allRecords.filter(record => record.date === date);
}

// Get attendance statistics
export function getAttendanceStats() {
  const allRecords = getMockAttendanceData();
  const totalRecords = allRecords.length;
  
  const presentCount = allRecords.filter(r => r.status === 'Present').length;
  const lateCount = allRecords.filter(r => r.status === 'Late').length;
  const absentCount = allRecords.filter(r => r.status === 'Absent').length;
  
  return {
    total: totalRecords,
    present: presentCount,
    late: lateCount,
    absent: absentCount,
    presentPercentage: ((presentCount / totalRecords) * 100).toFixed(2),
    latePercentage: ((lateCount / totalRecords) * 100).toFixed(2),
    absentPercentage: ((absentCount / totalRecords) * 100).toFixed(2)
  };
}

// Export for development/debugging - save to JSON file
export function saveMockDataToFile(): void {
  if (typeof window === 'undefined') {
    // Node.js environment
    const fs = require('fs');
    const path = require('path');
    
    const data = getMockAttendanceData();
    const filePath = path.join(process.cwd(), 'public', 'mock-attendance.json');
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Mock attendance data saved to ${filePath}`);
    } catch (error) {
      console.error('Error saving mock data:', error);
    }
  }
}

// Default export
export default {
  generateMockAttendance,
  getMockAttendanceData,
  getEmployeeAttendance,
  getDateAttendance,
  getAttendanceStats,
  saveMockDataToFile
};
