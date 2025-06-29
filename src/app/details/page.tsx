'use client';

import { useState } from 'react';
import { FaDatabase, FaUsers, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function DetailsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const createDetailsTable = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `تم إنشاء الجدول بنجاح! تم إدخال ${result.insertedCount} سجل.`
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'حدث خطأ أثناء إنشاء الجدول'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'حدث خطأ في الاتصال بالخادم'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              إدارة تفاصيل الموظفين
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إنشاء جدول تفاصيل الموظفين في قاعدة البيانات
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FaDatabase className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  إنشاء جدول التفاصيل
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  سيتم إنشاء جدول جديد باسم "details" وإدخال بيانات الموظفين من ملف data.json
                </p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <FaUsers className="text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-blue-900 dark:text-blue-100">البيانات المطلوبة</span>
                </div>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• معرف الموظف (ID)</li>
                  <li>• الاسم الأول</li>
                  <li>• الاسم الأخير</li>
                  <li>• القسم</li>
                  <li>• الشيفت</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheckCircle className="text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-900 dark:text-green-100">المصدر</span>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  سيتم استخراج البيانات من ملف data.json الموجود في مجلد public
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <FaDatabase className="text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-purple-900 dark:text-purple-100">الجدول الجديد</span>
                </div>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  سيتم إنشاء جدول "details" في قاعدة البيانات PostgreSQL
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={createDetailsTable}
                disabled={isLoading}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <FaDatabase />
                    إنشاء جدول التفاصيل
                  </>
                )}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <FaCheckCircle className="text-green-600 dark:text-green-400" />
                  ) : (
                    <FaExclamationTriangle className="text-red-600 dark:text-red-400" />
                  )}
                  <span className={`font-medium ${
                    message.type === 'success'
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {message.text}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 