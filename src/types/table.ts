export interface TableData {
  id: string;
  time: string; // سيحتوي على اليوم والساعة فقط
  date?: string; // حقل التاريخ المنفصل
  fullName: string;
  shift: string;
  department: string;
}
