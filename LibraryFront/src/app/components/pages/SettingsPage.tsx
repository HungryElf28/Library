import React, { useState, useRef, useEffect } from 'react';
import { User, Moon, Sun, CreditCard, CheckCircle, Calendar, Camera, Trash2, Loader, Save, Lock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { api } from '../../../services/api';
import { API_BASE } from '../../../config';
import { calculateAge } from '../../utils';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [subscribing, setSubscribing] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  
  const [updatingAccount, setUpdatingAccount] = useState(false);
  const [accountError, setUpdatingAccountError] = useState('');
  const [accountSuccess, setUpdatingAccountSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ login: user?.login || '' });
  const [emailForm, setEmailForm] = useState({ email: user?.email || '' });
  const [birthDateForm, setBirthDateForm] = useState({ birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setLoginForm({ login: user.login });
      setEmailForm({ email: user.email });
      setBirthDateForm({ birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '' });
    }
  }, [user]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingAccount(true);
    setUpdatingAccountError('');
    setUpdatingAccountSuccess('');
    try {
      await api.auth.updateAccount({ login: loginForm.login });
      await refreshUser();
      setUpdatingAccountSuccess('Логин успешно изменен');
    } catch (err: any) {
      setUpdatingAccountError(err.message || 'Ошибка при обновлении логина');
    } finally {
      setUpdatingAccount(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingAccount(true);
    setUpdatingAccountError('');
    setUpdatingAccountSuccess('');
    try {
      await api.auth.updateAccount({ email: emailForm.email });
      await refreshUser();
      setUpdatingAccountSuccess('Email успешно изменен');
    } catch (err: any) {
      setUpdatingAccountError(err.message || 'Ошибка при обновлении email');
    } finally {
      setUpdatingAccount(false);
    }
  };

  const handleUpdateBirthDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingAccount(true);
    setUpdatingAccountError('');
    setUpdatingAccountSuccess('');
    try {
      await api.auth.updateAccount({ birthDate: birthDateForm.birthDate });
      await refreshUser();
      setUpdatingAccountSuccess('Дата рождения успешно изменена');
    } catch (err: any) {
      setUpdatingAccountError(err.message || 'Ошибка при обновлении даты рождения');
    } finally {
      setUpdatingAccount(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setUpdatingAccountError('Пароли не совпадают');
      return;
    }
    setUpdatingAccount(true);
    setUpdatingAccountError('');
    setUpdatingAccountSuccess('');
    try {
      await api.auth.updateAccount({ 
        currentPassword: passwordForm.currentPassword, 
        newPassword: passwordForm.newPassword 
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setUpdatingAccountSuccess('Пароль успешно изменен');
    } catch (err: any) {
      setUpdatingAccountError(err.message || 'Ошибка при обновлении пароля');
    } finally {
      setUpdatingAccount(false);
    }
  };

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
    <div className="max-w-4xl mx-auto">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 p-6 space-y-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 pb-4 border-b border-amber-100 dark:border-stone-800">Управление аккаунтом</h2>

            {accountError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {accountError}
              </div>
            )}
            {accountSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {accountSuccess}
              </div>
            )}

            <div className="space-y-8">
              {/* Login Form */}
              <form onSubmit={handleUpdateLogin} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-stone-300 mb-2 uppercase tracking-wider">
                      Логин
                    </label>
                    <input
                      type="text"
                      value={loginForm.login}
                      onChange={(e) => setLoginForm({ login: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatingAccount || loginForm.login === user?.login}
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Сохранить
                  </button>
                </div>
              </form>

              {/* Email Form */}
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-stone-300 mb-2 uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ email: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatingAccount || emailForm.email === user?.email}
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Сохранить
                  </button>
                </div>
              </form>

              {/* Birth Date Form */}
              <form onSubmit={handleUpdateBirthDate} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-stone-300 mb-2 uppercase tracking-wider">
                      Дата рождения
                    </label>
                    <input
                      type="date"
                      value={birthDateForm.birthDate}
                      onChange={(e) => setBirthDateForm({ birthDate: e.target.value })}
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatingAccount || (user?.birthDate && birthDateForm.birthDate === new Date(user.birthDate).toISOString().split('T')[0])}
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Сохранить
                  </button>
                </div>
              </form>

              {/* Password Form */}
              <div className="pt-6 border-t border-amber-100 dark:border-stone-800">
                <label className="block text-sm font-bold text-gray-700 dark:text-stone-300 mb-4 uppercase tracking-wider">
                  Смена пароля
                </label>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Текущий пароль</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Новый пароль</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        minLength={6}
                        className="w-full px-4 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Подтвердите новый пароль</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={updatingAccount || !passwordForm.currentPassword || !passwordForm.newPassword}
                    className="w-full sm:w-auto px-8 py-2.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Обновить пароль
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 p-6">
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
        </div>

        <div className="space-y-6">
          {/* Theme Section */}
          <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 p-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-stone-300 mb-4 uppercase tracking-wider">
              Тема оформления
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-3 px-4 py-3 border-2 rounded-xl transition-all ${
                  theme === 'light'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-100 shadow-sm'
                    : 'border-gray-200 dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-800 text-gray-700 dark:text-stone-300'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="font-bold">Светлая</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-3 px-4 py-3 border-2 rounded-xl transition-all ${
                  theme === 'dark'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-100 shadow-sm'
                    : 'border-gray-200 dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-800 text-gray-700 dark:text-stone-300'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="font-bold">Темная</span>
              </button>
            </div>
          </div>

          {/* Account Info Section */}
          <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 p-6">
            <h3 className="text-sm font-bold text-gray-700 dark:text-stone-300 mb-4 uppercase tracking-wider">
              Информация
            </h3>
            <div className="space-y-4">
              {user?.birthDate && (
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-bold tracking-tighter mb-1">Дата рождения</span>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-stone-900/50 p-3 rounded-lg border border-amber-50 dark:border-stone-800">
                    <span className="font-medium text-gray-900 dark:text-stone-100">{new Date(user.birthDate).toLocaleDateString()}</span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">{calculateAge(user.birthDate)} лет</span>
                  </div>
                </div>
              )}
              <div>
                <span className="block text-xs text-gray-500 uppercase font-bold tracking-tighter mb-1">Роль</span>
                <div className="bg-gray-50 dark:bg-stone-900/50 p-3 rounded-lg border border-amber-50 dark:border-stone-800">
                  <span className={`font-bold ${user?.role === 'admin' ? 'text-amber-600' : 'text-gray-900 dark:text-stone-100'}`}>
                      {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
