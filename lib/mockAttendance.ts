// Mock attendance data generator
export interface AttendanceRecord {
  date: string;
  id: string;
  login: string | null;
  logout: string | null;
  totalHours: number;
  status: 'Present' | 'Late' | 'Absent';
}

// Generate mock attendance data for testing
export function getMockAttendanceData(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days
  
  const employeeIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  
  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    for (const id of employeeIds) {
      // Generate random attendance data
      const isPresent = Math.random() > 0.1; // 90% attendance rate
      const isLate = isPresent && Math.random() < 0.15; // 15% chance of being late if present
      
      let login: string | null = null;
      let logout: string | null = null;
      let totalHours = 0;
      let status: AttendanceRecord['status'] = 'Absent';
      
      if (isPresent) {
        const baseLoginHour = isLate ? 9 : 8; // 8 AM or 9 AM if late
        const loginMinutes = Math.floor(Math.random() * 60);
        login = `${String(baseLoginHour).padStart(2, '0')}:${String(loginMinutes).padStart(2, '0')}`;
        
        // Generate logout time (usually 8-9 hours after login)
        const workHours = 7 + Math.random() * 2; // 7-9 hours
        const logoutTime = new Date(`${dateStr}T${login}:00`);
        logoutTime.setHours(logoutTime.getHours() + Math.floor(workHours));
        logoutTime.setMinutes(logoutTime.getMinutes() + Math.floor((workHours % 1) * 60));
        
        logout = `${String(logoutTime.getHours()).padStart(2, '0')}:${String(logoutTime.getMinutes()).padStart(2, '0')}`;
        totalHours = Math.round(workHours * 10) / 10; // Round to 1 decimal place
        
        status = isLate ? 'Late' : 'Present';
      }
      
      records.push({
        date: dateStr,
        id,
        login,
        logout,
        totalHours,
        status
      });
    }
  }
  
  return records;
}
