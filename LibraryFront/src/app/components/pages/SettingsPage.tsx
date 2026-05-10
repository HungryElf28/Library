import React from 'react';
import { User, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-stone-800">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">{user?.login}</h1>
            <p className="text-gray-600 dark:text-stone-400">{user?.email}</p>
            <p className="text-sm text-gray-500 dark:text-stone-500 mt-1 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-amber-500' : 'bg-green-500'}`} />
              {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 p-6 space-y-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 pb-4 border-b border-amber-100 dark:border-stone-800">Настройки приложения</h2>

        <div className="space-y-6">
          {/* Theme Section */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-stone-300 mb-4 uppercase tracking-wider">
              Тема оформления
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-3 px-4 py-4 border-2 rounded-xl transition-all ${
                  theme === 'light'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-100 shadow-md'
                    : 'border-gray-200 dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-800 text-gray-700 dark:text-stone-300'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="font-bold">Светлая</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-3 px-4 py-4 border-2 rounded-xl transition-all ${
                  theme === 'dark'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-100 shadow-md'
                    : 'border-gray-200 dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-800 text-gray-700 dark:text-stone-300'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="font-bold">Темная</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-amber-200 dark:border-stone-700">
            <h3 className="text-sm font-bold text-gray-700 dark:text-stone-300 mb-4 uppercase tracking-wider">
              Информация об аккаунте
            </h3>
            <div className="bg-gray-50 dark:bg-stone-900/50 p-4 rounded-xl space-y-3 border border-amber-50 dark:border-stone-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-stone-500">Логин</span>
                <span className="font-medium text-gray-900 dark:text-stone-100">{user?.login}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-stone-500">Email</span>
                <span className="font-medium text-gray-900 dark:text-stone-100">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-stone-500">Роль</span>
                <span className={`font-bold ${user?.role === 'admin' ? 'text-amber-600' : 'text-gray-900 dark:text-stone-100'}`}>
                    {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
