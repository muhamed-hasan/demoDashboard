import { useState, useEffect, useCallback } from 'react';
import { AttendanceData } from '@/components/AttendanceTable';

interface UseAttendanceDataProps {
  startDate: string;
  endDate: string;
  departments: string[];
  shift: string;
  search: string;
}

export const useAttendanceData = ({
  startDate,
  endDate,
  departments,
  shift,
  search,
}: UseAttendanceDataProps) => {
  const [data, setData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate || startDate.length < 10 || endDate.length < 10) {
      setData([]);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      // Add filter parameters
      if (departments.length > 0) {
        departments.forEach(dept => params.append('department', dept));
      }
      if (shift && shift !== 'all') {
        params.append('shift', shift);
      }
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/attendance-details?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, departments, shift, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
