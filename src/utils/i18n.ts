// Simple i18n utility for bilingual (EN/AR) support
export const t = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    details: "Details",
    reports: "Reports",
    
    // Theme
    lightTheme: "Light Theme",
    darkTheme: "Dark Theme",
    
    // Header & Title
    attendanceDashboard: "Attendance Dashboard",
    attendanceManagement: "Attendance management system dashboard",
    attendanceTable: "Attendance Table",
    detailedAttendanceRecords: "Detailed Attendance Records",
    completeAttendanceInfo: "Complete attendance information with sorting and pagination",
    
    // Stats Cards
    totalEmployees: "Total Employees",
    present: "Present",
    absent: "Absent",
    attendanceRate: "Attendance Rate",
    
    // Department Stats
    heidelbergDept: "Heidelberg Department",
    naserDept: "Naser Department",
    
    // Filters
    dateRange: "Date Range",
    today: "Today",
    lastWeek: "Last Week",
    lastMonth: "Last Month",
    lastYear: "Last Year",
    custom: "Custom",
    fromDate: "From Date",
    toDate: "To Date",
    department: "Department",
    allDepartments: "All Departments",
    shift: "Shift",
    allShifts: "All Shifts",
    search: "Search",
    searchByName: "Search by name...",
    clearFilters: "Clear Filters",
    
    // Table Headers
    name: "Name",
    date: "Date",
    loginTime: "Login Time",
    logoutTime: "Logout Time",
    hours: "Hours",
    status: "Status",
    
    // Pagination
    rowsPerPage: "Rows per page:",
    showing: "Showing",
    to: "to",
    of: "of",
    results: "results",
    previous: "Previous",
    next: "Next",
    page: "Page",
    
    // Status
    loading: "Loading data...",
    errorLoadingData: "Error loading data",
    errorLoadingAttendance: "Error loading attendance data:",
    retry: "Retry",
    
    // Company
    companyName: "industry-run",
    copyright: "© 2024 Developed by industry-run",
    
    // Language
    language: "Language",
    english: "English",
    arabic: "العربية",
    
    // Details Page
    employeeDetails: "Employee Details",
    viewEmployeeData: "View employee data from database",
    addEmployee: "Add Employee",
    filters: "Filters",
    searchByNameOrId: "Search by name or ID...",
    departments: "Departments",
    dayShift: "Day Shift",
    nightShift: "Night Shift",
    id: "ID",
    firstName: "First Name",
    lastName: "Last Name",
    actions: "Actions",
    noResults: "No Results",
    changeFiltersOrSearch: "Try changing filters or searching for something else.",
    addNewEmployee: "Add New Employee",
    firstNameRequired: "First Name Required",
    lastNameRequired: "Last Name Required",
    departmentRequired: "Department Required",
    enterFirstName: "Enter first name",
    enterLastName: "Enter last name",
    selectDepartment: "Select department",
    selectShift: "Select shift",
    morning: "Morning",
    evening: "Evening",
    adding: "Adding...",
    add: "Add",
    cancel: "Cancel",
    confirmDelete: "Confirm Delete",
    areYouSureDelete: "Are you sure you want to delete employee",
    deleting: "Deleting...",
    delete: "Delete",
    connectionError: "Connection error occurred",
    errorFetchingData: "Error occurred while fetching data",
    errorAddingEmployee: "Error occurred while adding employee",
    errorDeletingEmployee: "Error occurred while deleting employee"
  },
  ar: {
    // Navigation
    dashboard: "لوحة التحكم",
    details: "التفاصيل",
    reports: "التقارير",
    
    // Theme
    lightTheme: "الوضع النهاري",
    darkTheme: "الوضع الليلي",
    
    // Header & Title
    attendanceDashboard: "لوحة تحكم الحضور والانصراف",
    attendanceManagement: "عرض إحصائيات الحضور والانصراف للموظفين",
    attendanceTable: "جدول الحضور والانصراف",
    detailedAttendanceRecords: "سجلات الحضور التفصيلية",
    completeAttendanceInfo: "معلومات الحضور الكاملة مع الترتيب والتصفح",
    
    // Stats Cards
    totalEmployees: "إجمالي الموظفين",
    present: "الحضور",
    absent: "الغياب",
    attendanceRate: "معدل الحضور",
    
    // Department Stats
    heidelbergDept: "قسم Heidelberg",
    naserDept: "قسم Naser",
    
    // Filters
    dateRange: "نطاق التاريخ",
    today: "اليوم",
    lastWeek: "آخر أسبوع",
    lastMonth: "آخر شهر",
    lastYear: "آخر سنة",
    custom: "مخصص",
    fromDate: "من تاريخ",
    toDate: "إلى تاريخ",
    department: "القسم",
    allDepartments: "كل الأقسام",
    shift: "الشيفت",
    allShifts: "كل الشيفتات",
    search: "بحث",
    searchByName: "البحث بالاسم...",
    clearFilters: "مسح الفلاتر",
    
    // Table Headers
    name: "الاسم",
    date: "التاريخ",
    loginTime: "وقت الدخول",
    logoutTime: "وقت الخروج",
    hours: "الساعات",
    status: "الحالة",
    
    // Pagination
    rowsPerPage: "صفوف في الصفحة:",
    showing: "عرض",
    to: "إلى",
    of: "من",
    results: "نتيجة",
    previous: "السابق",
    next: "التالي",
    page: "صفحة",
    
    // Status
    loading: "جاري تحميل البيانات...",
    errorLoadingData: "خطأ في تحميل البيانات",
    errorLoadingAttendance: "خطأ في تحميل بيانات الحضور:",
    retry: "إعادة المحاولة",
    
    // Company
    companyName: "industry-run",
    copyright: "© 2024 تم التطوير بواسطة industry-run",
    
    // Language
    language: "اللغة",
    english: "English",
    arabic: "العربية",
    
    // Details Page
    employeeDetails: "تفاصيل الموظفين",
    viewEmployeeData: "عرض بيانات الموظفين من قاعدة البيانات",
    addEmployee: "إضافة موظف",
    filters: "الفلاتر",
    searchByNameOrId: "البحث بالاسم أو الرقم...",
    departments: "الأقسام",
    dayShift: "شيفت صباحي",
    nightShift: "شيفت مسائي",
    id: "الرقم",
    firstName: "الاسم الأول",
    lastName: "الاسم الأخير",
    actions: "الإجراءات",
    noResults: "لا توجد نتائج",
    changeFiltersOrSearch: "جرب تغيير الفلاتر أو البحث عن شيء آخر.",
    addNewEmployee: "إضافة موظف جديد",
    firstNameRequired: "الاسم الأول مطلوب",
    lastNameRequired: "الاسم الأخير مطلوب",
    departmentRequired: "القسم مطلوب",
    enterFirstName: "أدخل الاسم الأول",
    enterLastName: "أدخل الاسم الأخير",
    selectDepartment: "اختر القسم",
    selectShift: "اختر الشيفت",
    morning: "صباحي",
    evening: "مسائي",
    adding: "جاري الإضافة...",
    add: "إضافة",
    cancel: "إلغاء",
    confirmDelete: "تأكيد الحذف",
    areYouSureDelete: "هل أنت متأكد من حذف الموظف",
    deleting: "جاري الحذف...",
    delete: "حذف",
    connectionError: "حدث خطأ في الاتصال بالخادم",
    errorFetchingData: "حدث خطأ أثناء جلب البيانات",
    errorAddingEmployee: "حدث خطأ أثناء إضافة الموظف",
    errorDeletingEmployee: "حدث خطأ أثناء حذف الموظف"
  }
};

export type Language = 'en' | 'ar';
export type TranslationKey = keyof typeof t.en;

// Get translation function
export const getTranslation = (lang: Language, key: TranslationKey): string => {
  return t[lang][key] || t.en[key] || key;
};

// Direction helper
export const getDirection = (lang: Language): 'ltr' | 'rtl' => {
  return lang === 'ar' ? 'rtl' : 'ltr';
};

// Language helper
export const getLanguageDirection = (lang: Language) => {
  return {
    direction: getDirection(lang),
    isRTL: lang === 'ar',
    className: lang === 'ar' ? 'rtl' : 'ltr'
  };
};
