import React, { useState } from 'react';
import { Search, BookOpen, User, LogOut, Heart, BookMarked, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onSearch: (query: string) => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onSearch, onNavigate, currentPage }: HeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('catalog');
    setShowUserMenu(false);
  };

  return (
    <header className="bg-card border-b border-amber-200 dark:border-stone-700 sticky top-0 z-50 transition-colors backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-500" />
              <span className="text-xl font-semibold text-gray-900 dark:text-stone-100">Библиотека</span>
            </button>

            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => onNavigate('catalog')}
                className={`text-sm transition-colors ${
                  currentPage === 'catalog' ? 'text-amber-600 dark:text-amber-500 font-medium' : 'text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-200'
                }`}
              >
                Каталог
              </button>
              {user && user.role !== 'guest' && (
                <>
                  <button
                    onClick={() => onNavigate('reading')}
                    className={`text-sm transition-colors ${
                      currentPage === 'reading' ? 'text-amber-600 dark:text-amber-500 font-medium' : 'text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-200'
                    }`}
                  >
                    Читаю сейчас
                  </button>
                  <button
                    onClick={() => onNavigate('favorites')}
                    className={`text-sm transition-colors ${
                      currentPage === 'favorites' ? 'text-amber-600 dark:text-amber-500 font-medium' : 'text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-200'
                    }`}
                  >
                    Избранное
                  </button>
                  <button
                    onClick={() => onNavigate('collections')}
                    className={`text-sm transition-colors ${
                      currentPage === 'collections' ? 'text-amber-600 dark:text-amber-500 font-medium' : 'text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-200'
                    }`}
                  >
                    Подборки
                  </button>
                </>
              )}
              {user?.role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`text-sm transition-colors ${
                    currentPage === 'admin' ? 'text-amber-600 dark:text-amber-500 font-medium' : 'text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-200'
                  }`}
                >
                  Управление
                </button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-stone-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск книг..."
                  className="pl-10 pr-4 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
                />
              </div>
            </form>

            {user && user.role !== 'guest' ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-stone-700 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600 dark:text-stone-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-stone-300 hidden md:block">{user.login}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-amber-200 dark:border-stone-700 py-2">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-700 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Настройки
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
