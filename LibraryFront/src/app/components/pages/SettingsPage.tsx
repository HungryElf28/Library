import React, { useState, useRef } from 'react';
import { User, Moon, Sun, CreditCard, CheckCircle, Calendar, Camera, Trash2, Loader } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { api } from '../../../services/api';
import { API_BASE } from '../../../config';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [subscribing, setSubscribing] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleSubscription = async (isSubscribed: boolean) => {
    setSubscribing(true);
    try {
      await api.users.updateSubscription(isSubscribed);
      await refreshUser();
    } catch (error) {
      console.error('Error updating subscription:', error);
    } finally {
      setSubscribing(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUpdatingAvatar(true);
    try {
      await api.users.updateAvatar(formData);
      await refreshUser();
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Ошибка при обновлении аватара');
    } finally {
      setIsUpdatingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить аватар?')) return;

    setIsUpdatingAvatar(true);
    try {
      await api.users.deleteAvatar();
      await refreshUser();
    } catch (error) {
      console.error('Error deleting avatar:', error);
      alert('Ошибка при удалении аватара');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  return (
    <div>
      <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div 
              onClick={handleAvatarClick}
              className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center cursor-pointer transition-all border-2 border-white dark:border-stone-800 shadow-lg ${
                isUpdatingAvatar ? 'opacity-50' : 'hover:ring-4 hover:ring-amber-200 dark:hover:ring-stone-600'
              } ${user?.avatarFile ? '' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}
            >
              {user?.avatarFile ? (
                <img 
                  src={user.avatarFile.startsWith('http') ? user.avatarFile : `${API_BASE}${user.avatarFile}`}
                  alt={user.login}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>

              {isUpdatingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader className="w-6 h-6 text-amber-600 animate-spin" />
                </div>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">{user?.login}</h1>
            <p className="text-gray-600 dark:text-stone-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <button 
                onClick={handleAvatarClick}
                className="text-xs font-bold text-amber-600 dark:text-amber-500 hover:underline flex items-center gap-1"
              >
                <Camera className="w-3 h-3" /> Изменить аватар
              </button>
              {user?.avatarFile && (
                <button 
                  onClick={handleDeleteAvatar}
                  className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 ml-2"
                >
                  <Trash2 className="w-3 h-3" /> Удалить
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 p-6 space-y-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 pb-4 border-b border-amber-100 dark:border-stone-800">Настройки аккаунта</h2>

        <div className="space-y-6">
          {/* Subscription Section */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-stone-300 mb-4 uppercase tracking-wider">
              Управление подпиской
            </label>
            <div className="bg-amber-50 dark:bg-stone-900/50 rounded-xl p-6 border border-amber-200 dark:border-stone-800">
              {user?.isSubscribed ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                      <CreditCard className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-stone-100">Ваша подписка активна</h3>
                      <p className="text-sm text-gray-600 dark:text-stone-400">Вам доступны все книги для чтения без ограничений.</p>
                      {user.subscriptionExpiresAt && (
                        <p className="text-xs text-amber-700 dark:text-amber-500 mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Действует до: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      Оплачено
                    </div>
                    <button
                      onClick={() => handleToggleSubscription(false)}
                      disabled={subscribing}
                      className="text-sm text-red-600 hover:text-red-700 font-medium underline underline-offset-4 disabled:opacity-50"
                    >
                      {subscribing ? 'Отмена...' : 'Отменить подписку'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-stone-800 rounded-lg">
                      <CreditCard className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-stone-100">Подписка не оформлена</h3>
                      <p className="text-sm text-gray-600 dark:text-stone-400">Оформите подписку, чтобы получить неограниченный доступ к чтению.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSubscription(true)}
                    disabled={subscribing}
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-50"
                  >
                    {subscribing ? 'Оформление...' : 'Оформить за 299₽/мес'}
                  </button>
                </div>
              )}
            </div>
          </div>

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
