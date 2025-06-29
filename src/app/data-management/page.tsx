'use client';

import React, { useState, useEffect } from 'react';

// Types
interface EmployeeData {
  id: string;
  'First Name': string;
  'Last Name': string;
  Department: string;
}

// Simple UI Components (since we don't have the actual components)
const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <table className="min-w-full divide-y divide-gray-200">
    {children}
  </table>
);

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr className="hover:bg-gray-50">
    {children}
  </tr>
);

const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
    {children}
  </td>
);

const Button: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    {children}
  </button>
);

const DataForm: React.FC<{
  initialData: EmployeeData | null;
  onSubmit: (values: EmployeeData) => void;
}> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<EmployeeData>({
    id: initialData?.id || '',
    'First Name': initialData?.['First Name'] || '',
    'Last Name': initialData?.['Last Name'] || '',
    Department: initialData?.Department || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ id: '', 'First Name': '', 'Last Name': '', Department: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">ID</label>
        <input
          type="text"
          value={formData.id}
          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">First Name</label>
        <input
          type="text"
          value={formData['First Name']}
          onChange={(e) => setFormData({ ...formData, 'First Name': e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Last Name</label>
        <input
          type="text"
          value={formData['Last Name']}
          onChange={(e) => setFormData({ ...formData, 'Last Name': e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Department</label>
        <input
          type="text"
          value={formData.Department}
          onChange={(e) => setFormData({ ...formData, Department: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {initialData ? 'Update' : 'Add'} Employee
      </button>
    </form>
  );
};

export default function DataManagementPage() {
  const [data, setData] = useState<EmployeeData[]>([]);
  const [editItem, setEditItem] = useState<EmployeeData | null>(null);

  // جلب البيانات الأولية
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(obj => setData(Object.entries(obj).map(([id, v]) => ({ ...((({ id, ...rest }) => rest)(v as EmployeeData)), id }))))
      .catch(error => {
        console.error('Error fetching data:', error);
        // Set some mock data for demonstration
        setData([
          { id: '1', 'First Name': 'John', 'Last Name': 'Doe', Department: 'IT' },
          { id: '2', 'First Name': 'Jane', 'Last Name': 'Smith', Department: 'HR' },
        ]);
      });
  }, []);

  // معالجة عمليات الحذف
  const handleDelete = (id: string) => {
    fetch(`/api/data?id=${id}`, { method: 'DELETE' })
      .then(() => setData(data.filter(item => item.id !== id)))
      .catch(error => {
        console.error('Error deleting item:', error);
        // Remove from local state even if API fails
        setData(data.filter(item => item.id !== id));
      });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">إدارة البيانات</h1>
      <Table>
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <TableBody>
          {data.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item['First Name']}</TableCell>
              <TableCell>{item['Last Name']}</TableCell>
              <TableCell>{item.Department}</TableCell>
              <TableCell>
                <Button onClick={() => setEditItem(item)}>تعديل</Button>
                <Button onClick={() => handleDelete(item.id)}>حذف</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* نموذج الإضافة/التعديل */}
      <DataForm 
        initialData={editItem}
        onSubmit={(values) => {
          const method = editItem ? 'PUT' : 'POST';
          fetch('/api/data', {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(values)
          }).then(() => {
            // تحديث الحالة المحلية
            if (editItem) {
              setData(data.map(d => d.id === values.id ? values : d));
            } else {
              setData([...data, values]);
            }
            setEditItem(null);
          }).catch(error => {
            console.error('Error saving data:', error);
            // Update local state even if API fails
            if (editItem) {
              setData(data.map(d => d.id === values.id ? values : d));
            } else {
              setData([...data, values]);
            }
            setEditItem(null);
          });
        }}
      />
    </div>
  );
}