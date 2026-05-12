import React, { useState, useEffect } from 'react';
import { BookListItem } from '../../../types';
import { api } from '../../../services/api';
import { BookCard } from '../BookCard';
import { Loader, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface RecommendationsPageProps {
  onBookClick: (bookId: number) => void;
}

export function RecommendationsPage({ onBookClick }: RecommendationsPageProps) {
  const { user } = useAuth();
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
    if (user && user.role !== 'guest') {
      loadFavorites();
    }
  }, [user]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await api.books.getRecommendations();
      setBooks(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const data = await api.users.getFavorites();
      setFavorites(data.items.map(book => book.id));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleFavoriteToggle = async (bookId: number) => {
    if (!user || user.role === 'guest') return;

    try {
      if (favorites.includes(bookId)) {
        await api.users.removeFromFavorites(bookId);
        setFavorites(favorites.filter(id => id !== bookId));
      } else {
        await api.users.addToFavorites(bookId);
        setFavorites([...favorites, bookId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-200 dark:border-amber-900/30">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-stone-100">Персональные рекомендации</h1>
        </div>
        <p className="text-gray-600 dark:text-stone-400">
          Мы подобрали эти книги специально для вас, основываясь на ваших интересах, любимых авторах и жанрах.
        </p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-gray-300 dark:border-stone-700">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-stone-400 font-medium text-lg">Пока недостаточно данных для рекомендаций</p>
          <p className="text-sm text-gray-500 dark:text-stone-500 mt-2 max-w-md mx-auto">
            Читайте больше книг, добавляйте их в избранное и ставьте оценки, чтобы мы могли лучше узнать ваши предпочтения.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => onBookClick(book.id)}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={favorites.includes(book.id)}
              showFavoriteButton={user?.role !== 'guest'}
            />
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center">
        <p className="text-blue-800 dark:text-blue-300 text-sm">
          Рекомендации обновляются в реальном времени по мере того, как вы взаимодействуете с библиотекой.
        </p>
      </div>
    </div>
  );
}
