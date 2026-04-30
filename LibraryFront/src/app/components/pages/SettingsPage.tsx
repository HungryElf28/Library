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
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">{user?.login}</h1>
            <p className="text-gray-600 dark:text-stone-400">{user?.email}</p>
            <p className="text-sm text-gray-500 dark:text-stone-500 mt-1">
              {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 mb-6">Настройки</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-3">
              Тема оформления
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-3 px-4 py-3 border rounded-lg transition-colors ${
                  theme === 'light'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100'
                    : 'border-gray-300 dark:border-stone-600 hover:bg-gray-50 dark:hover:bg-stone-700 text-gray-700 dark:text-stone-300'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="font-medium">Светлая</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-3 px-4 py-3 border rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100'
                    : 'border-gray-300 dark:border-stone-600 hover:bg-gray-50 dark:hover:bg-stone-700 text-gray-700 dark:text-stone-300'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="font-medium">Темная</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-stone-500 mt-2">
              Выберите цветовую схему приложения
            </p>
          </div>

          <div className="pt-6 border-t border-amber-200 dark:border-stone-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-stone-300 mb-2">
              Информация об аккаунте
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-stone-400">
              <p>Логин: {user?.login}</p>
              <p>Email: {user?.email}</p>
              <p>Роль: {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
