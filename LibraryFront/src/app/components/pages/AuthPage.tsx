import React, { useState } from 'react';
import { BookOpen, Loader } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface AuthPageProps {
  onSuccess: () => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({
    login: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginForm);
      onSuccess();
    } catch (err) {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      await register({
        login: registerForm.login,
        email: registerForm.email,
        password: registerForm.password,
      });
      onSuccess();
    } catch (err) {
      setError('Пользователь с таким логином уже существует');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-stone-900 dark:to-stone-800 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-12 h-12 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-stone-100">Библиотека</h1>
          </div>
          <p className="text-gray-600 dark:text-stone-400">
            {mode === 'login' ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 dark:bg-stone-700 text-gray-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 dark:bg-stone-700 text-gray-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
              }`}
            >
              Регистрация
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-1">
                  Логин
                </label>
                <input
                  id="login"
                  type="text"
                  value={loginForm.login}
                  onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Введите логин"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Введите пароль"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                Войти
              </button>

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg text-sm text-amber-900 dark:text-amber-200">
                <p className="font-medium mb-1">Тестовые аккаунты:</p>
                <p>Админ: <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">admin / password</code></p>
                <p>Клиент: <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">reader1 / password</code></p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="reg-login" className="block text-sm font-medium text-gray-700 mb-1">
                  Логин
                </label>
                <input
                  id="reg-login"
                  type="text"
                  value={registerForm.login}
                  onChange={(e) => setRegisterForm({ ...registerForm, login: e.target.value })}
                  required
                  minLength={3}
                  className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Придумайте логин"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Минимум 6 символов"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Подтвердите пароль
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Повторите пароль"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                Зарегистрироваться
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
