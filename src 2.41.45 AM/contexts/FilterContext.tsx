'use client';

import { createContext, useContext, ReactNode } from 'react';

// Filter Context
export interface FilterContextType {
  dateRange: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate: string;
  endDate: string;
  selectedDepartments: string[];
  selectedShift: string;
  searchText: string;
  setDateRange: (range: 'today' | 'week' | 'month' | 'year' | 'custom') => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setSelectedDepartments: (departments: string[]) => void;
  setSelectedShift: (shift: string) => void;
  setSearchText: (text: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
  value: FilterContextType;
}

export const FilterProvider = ({ children, value }: FilterProviderProps) => {
  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;
