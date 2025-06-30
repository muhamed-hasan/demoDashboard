'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaDatabase, FaUsers, FaSearch, FaFilter, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';

interface EmployeeDetail {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
  shift: string;
}

interface FormData {
  first_name: string;
  last_name: string;
  department: string;
  shift: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  department?: string;
  shift?: string;
}

export default function DetailsPage() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; employee: EmployeeDetail | null }>({
    show: false,
    employee: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    department: '',
    shift: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Get unique departments and shifts for filters
  const departments = [...new Set(employees.map(emp => emp.department))].sort();
  const shifts = [...new Set(employees.map(emp => emp.shift).filter(shift => shift))].sort();

  // Available departments and shifts for form
  const availableDepartments = ['SDS', 'Heidelberg', 'Abo Kastore', 'Naser', 'All Departments'];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filterEmployees = useCallback(() => {
    let filtered = employees;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toString().includes(searchTerm)
      );
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    // Shift filter
    if (shiftFilter) {
      filtered = filtered.filter(emp => emp.shift === shiftFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, departmentFilter, shiftFilter]);

  useEffect(() => {
    filterEmployees();
  }, [filterEmployees]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/details');
      const result = await response.json();

      if (result.success) {
        setEmployees(result.data);
        setError(null);
      } else {
        setError(result.error || 'حدث خطأ أثناء جلب البيانات');
      }
    } catch {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setShiftFilter('');
  };

  const showDeleteConfirm = (employee: EmployeeDetail) => {
    setDeleteConfirm({ show: true, employee });
  };

  const hideDeleteConfirm = () => {
    setDeleteConfirm({ show: false, employee: null });
  };

  const deleteEmployee = async () => {
    if (!deleteConfirm.employee) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/details/${deleteConfirm.employee.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setEmployees(prev => prev.filter(emp => emp.id !== deleteConfirm.employee!.id));
        hideDeleteConfirm();
      } else {
        alert(result.error || 'حدث خطأ أثناء حذف الموظف');
      }
    } catch {
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsDeleting(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // First name validation
    if (!formData.first_name.trim()) {
      errors.first_name = t('firstNameRequired');
    } else if (formData.first_name.trim().length < 2) {
      errors.first_name = t('firstNameRequired');
    } else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(formData.first_name.trim())) {
      errors.first_name = t('firstNameRequired');
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      errors.last_name = t('lastNameRequired');
    } else if (formData.last_name.trim().length < 2) {
      errors.last_name = t('lastNameRequired');
    } else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(formData.last_name.trim())) {
      errors.last_name = t('lastNameRequired');
    }

    // Department validation
    if (!formData.department) {
      errors.department = t('departmentRequired');
    }

    // Shift validation (optional)
    if (formData.shift && !['Day', 'Night', ''].includes(formData.shift)) {
      errors.shift = 'قيمة الشيفت غير صحيحة';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addEmployee = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch('/api/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Add to local state
        setEmployees(prev => [...prev, result.data]);
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          department: '',
          shift: ''
        });
        setFormErrors({});
        setShowAddForm(false);
      } else {
        alert(result.error || 'حدث خطأ أثناء إضافة الموظف');
      }
    } catch {
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchEmployees}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                تفاصيل الموظفين
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                عرض بيانات الموظفين من قاعدة البيانات
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus />
              إضافة موظف جديد
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FaUsers className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الموظفين</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FaDatabase className="text-2xl text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الأقسام</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{departments.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FaUsers className="text-2xl text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">شيفت صباحي</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {employees.filter(emp => emp.shift === 'Day').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <FaUsers className="text-2xl text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">شيفت مسائي</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {employees.filter(emp => emp.shift === 'Night').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <FaFilter className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">الفلاتر</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البحث
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="البحث بالاسم أو الرقم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  القسم
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">كل الأقسام</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Shift Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الشيفت
                </label>
                <select
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">كل الشيفتات</option>
                  {shifts.map(shift => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  مسح الفلاتر
                </button>
              </div>
            </div>
          </div>

          {/* Employees Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الرقم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الاسم الأول
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الاسم الأخير
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      القسم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الشيفت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {employee.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {employee.first_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {employee.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {employee.shift || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => showDeleteConfirm(employee)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* No Results */}
          {filteredEmployees.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">لا توجد نتائج</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                جرب تغيير الفلاتر أو البحث عن شيء آخر.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">إضافة موظف جديد</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addEmployee(); }}>
              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الاسم الأول *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="أدخل الاسم الأول"
                  />
                  {formErrors.first_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.first_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الاسم الأخير *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="أدخل الاسم الأخير"
                  />
                  {formErrors.last_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.last_name}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    القسم *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.department ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">اختر القسم</option>
                    {availableDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {formErrors.department && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.department}</p>
                  )}
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الشيفت
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => handleInputChange('shift', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.shift ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">اختر الشيفت</option>
                    <option value="Day">صباحي</option>
                    <option value="Night">مسائي</option>
                  </select>
                  {formErrors.shift && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.shift}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isAdding ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <FaTrash className="mx-auto h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">تأكيد الحذف</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                هل أنت متأكد من حذف الموظف{' '}
                <span className="font-semibold">
                  {deleteConfirm.employee?.first_name} {deleteConfirm.employee?.last_name}
                </span>
                ؟
              </p>
              <div className="flex gap-3">
                <button
                  onClick={deleteEmployee}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isDeleting ? 'جاري الحذف...' : 'حذف'}
                </button>
                <button
                  onClick={hideDeleteConfirm}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 