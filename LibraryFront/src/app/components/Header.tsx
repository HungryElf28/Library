import React, { useState } from 'react';
import { Search, BookOpen, User, LogOut, Heart, BookMarked, Settings, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../config';
import { api } from '../../services/api';

interface HeaderProps {
  onSearch: (query: string) => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onSearch, onNavigate, currentPage }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<any>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length >= 1) {
      timeoutRef.current = setTimeout(async () => {
        try {
          const data = await api.search.getSuggestions(query);
          setSuggestions(data);
          setShowSuggestions(Object.keys(data).length > 0);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }, 300);
    } else {
      setSuggestions({});
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(searchQuery);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('catalog');
    setShowUserMenu(false);
  };

  const hasSuggestions = Object.keys(suggestions).length > 0;

  return (
    <header className="bg-card border-b border-amber-200 dark:border-stone-700 sticky top-0 z-50 transition-colors backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-500" />
              <span className="text-xl font-semibold text-gray-900 dark:text-stone-100">Библиотека</span>
            </button>

            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => onNavigate('home')}
                className={`text-sm transition-colors ${
                  currentPage === 'home' ? 'text-amber-600 dark:text-amber-500 font-medium' : 'text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-200'
                }`}
              >
                Главная
              </button>
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
                  <button
                    onClick={() => onNavigate('recommendations')}
                    className={`text-sm flex items-center gap-1 transition-colors ${
                      currentPage === 'recommendations' ? 'text-amber-600 dark:text-amber-500 font-medium' : 'text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Рекомендации
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
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-stone-700 transition-colors text-gray-600 dark:text-stone-400"
              title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <form onSubmit={handleSearch} className="hidden sm:block relative" ref={suggestionsRef}>
              <div className="flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-stone-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onFocus={() => searchQuery.length >= 1 && hasSuggestions && setShowSuggestions(true)}
                    placeholder="Поиск..."
                    className="pl-10 pr-4 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-48 lg:w-64 border-r-0"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-r-lg text-sm font-medium transition-colors border border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  Найти
                </button>
              </div>

              {showSuggestions && hasSuggestions && (
                <div className="absolute top-full left-0 w-full mt-1 bg-card rounded-lg shadow-xl border border-amber-200 dark:border-stone-700 py-2 z-50 overflow-hidden min-w-[300px]">
                  {Object.entries(suggestions).map(([category, items]) => (
                    <div key={category} className="mb-2 last:mb-0">
                      <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 bg-amber-50/50 dark:bg-amber-900/10">
                        {category}
                      </div>
                      {items.map((suggestion, index) => (
                        <button
                          key={`${category}-${index}`}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-700 flex items-center gap-2 transition-colors group"
                        >
                          <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-500" />
                          <span className="truncate">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </form>

            {user && user.role !== 'guest' ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-stone-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-stone-800 flex items-center justify-center overflow-hidden border border-amber-200 dark:border-stone-600">
                    {user.avatarFile ? (
                      <img 
                        src={user.avatarFile.startsWith('http') ? user.avatarFile : `${API_BASE}${user.avatarFile}`}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-600 dark:text-stone-400" />
                    )}
                  </div>
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
