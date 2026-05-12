import React, { useState, useEffect } from 'react';
import { BookListItem, ReadingBook } from '../../../types';
import { api } from '../../../services/api';
import { BookCard } from '../BookCard';
import { Heart, BookOpen, User, LogOut, Clock, Loader } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE } from '../../../config';


interface ProfilePageProps {
  onBookClick: (bookId: number) => void;
  onStartReading: (bookId: number) => void;
  initialTab?: 'favorites' | 'reading';
}

export function ProfilePage({ onBookClick, onStartReading, initialTab = 'favorites' }: ProfilePageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'reading'>(initialTab);
  const [favorites, setFavorites] = useState<BookListItem[]>([]);
  const [reading, setReading] = useState<ReadingBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'favorites') {
        const data = await api.users.getFavorites();
        setFavorites(data.items);
      } else {
        const data = await api.users.getReading();
        setReading(data.items);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastOpened = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Только что';
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} ${getPlural(diffInMinutes, ['минуту', 'минуты', 'минут'])} назад`;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} ${getPlural(diffInHours, ['час', 'часа', 'часов'])} назад`;
      }

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        if (diffInDays === 1) return 'Вчера';
        return `${diffInDays} ${getPlural(diffInDays, ['день', 'дня', 'дней'])} назад`;
      }

      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getPlural = (n: number, forms: [string, string, string]) => {
    const n1 = Math.abs(n) % 100;
    const n2 = n1 % 10;
    if (n1 > 10 && n1 < 20) return forms[2];
    if (n2 > 1 && n2 < 5) return forms[1];
    if (n2 === 1) return forms[0];
    return forms[2];
  };

  const handleRemoveFavorite = async (bookId: number) => {
    try {
      await api.users.removeFromFavorites(bookId);
      setFavorites(favorites.filter(b => b.id !== bookId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

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

      <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700">
        <div className="border-b border-amber-200 dark:border-stone-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'text-amber-600 dark:text-amber-500 border-b-2 border-amber-600 dark:border-amber-500'
                  : 'text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-200'
              }`}
            >
              <Heart className="w-5 h-5" />
              Избранное
              <span className="ml-1 px-2 py-0.5 bg-gray-100 dark:bg-stone-700 rounded-full text-sm">
                {favorites.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('reading')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'reading'
                  ? 'text-amber-600 dark:text-amber-500 border-b-2 border-amber-600 dark:border-amber-500'
                  : 'text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Читаю сейчас
              <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-sm">
                {reading.length}
              </span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 text-amber-600 animate-spin" />
            </div>
          ) : activeTab === 'favorites' ? (
            favorites.length === 0 ? (
              <div className="text-center py-20">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">У вас пока нет избранных книг</p>
                <p className="text-sm text-gray-500 mt-2">
                  Добавляйте понравившиеся книги в избранное для быстрого доступа
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {favorites.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => onBookClick(book.id)}
                    onFavoriteToggle={handleRemoveFavorite}
                    isFavorite={true}
                    showFavoriteButton={true}
                  />
                ))}
              </div>
            )
          ) : reading.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Вы пока ничего не читаете</p>
              <p className="text-sm text-gray-500 mt-2">
                Начните читать книги, и они появятся здесь
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reading.map((item) => (
                <div
                  key={item.bookId}
                  onClick={() => onBookClick(item.bookId)}
                  className="flex gap-4 p-4 bg-card border border-amber-200 dark:border-stone-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="w-24 h-36 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    {item.coverFile ? (
                      <img
                        src={item.coverFile.startsWith('http') ? item.coverFile : `${API_BASE}${item.coverFile.startsWith('/') ? '' : '/'}${item.coverFile}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-stone-700 dark:to-stone-600">
                        <span className="text-2xl font-bold text-amber-300 dark:text-amber-400">{item.title[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-stone-100 mb-2">{item.title}</h3>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-stone-400 mb-1">
                        <span>Прогресс</span>
                        <span>{item.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-stone-700 rounded-full h-2">
                        <div
                          className="bg-amber-600 h-2 rounded-full transition-all"
                          style={{ width: `${item.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-stone-400">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>Страница {item.page}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatLastOpened(item.lastOpened)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartReading(item.bookId);
                      }}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      Продолжить чтение
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
