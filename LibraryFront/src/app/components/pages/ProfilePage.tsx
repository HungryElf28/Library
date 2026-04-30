import React, { useState, useEffect } from 'react';
import { BookListItem, ReadingBook } from '../../../types';
import { api } from '../../../services/api';
import { BookCard } from '../BookCard';
import { Heart, BookOpen, User, Loader, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface ProfilePageProps {
  onBookClick: (bookId: number) => void;
  initialTab?: 'favorites' | 'reading';
}

export function ProfilePage({ onBookClick, initialTab = 'favorites' }: ProfilePageProps) {
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
        setFavorites(data);
      } else {
        const data = await api.users.getReading();
        setReading(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-900">{user?.login}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
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
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-5 h-5" />
              Избранное
              <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-sm">
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
                        src={item.coverFile}
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
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Прогресс</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-600 h-2 rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>Страница {item.page}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{item.lastOpened}</span>
                      </div>
                    </div>
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
