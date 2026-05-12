import React, { useState, useEffect } from 'react';
import { Tag, BookListItem } from '../../../types';
import { api } from '../../../services/api';
import { BookCard } from '../BookCard';
import { Loader, ArrowLeft, Hash, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface TagDetailsPageProps {
  tagId: number;
  onBookClick: (bookId: number) => void;
  onBack: () => void;
}

export function TagDetailsPage({ tagId, onBookClick, onBack }: TagDetailsPageProps) {
  const { user } = useAuth();
  const [tag, setTag] = useState<Tag | null>(null);
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 12,
  });

  useEffect(() => {
    loadTag();
    if (user && user.role !== 'guest') {
      loadFavorites();
    }
  }, [tagId, user]);

  useEffect(() => {
    loadBooks();
  }, [tagId, pagination.page]);

  const loadTag = async () => {
    try {
      const data = await api.tags.getById(tagId);
      setTag(data);
    } catch (error) {
      console.error('Error loading tag:', error);
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await api.books.getAll({
        tagId,
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: 'Title',
        sortOrder: 'Asc'
      });
      setBooks(response.items);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (error) {
      console.error('Error loading tag books:', error);
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

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !tag) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 dark:text-stone-400">Тег не найден.</p>
        <button onClick={onBack} className="mt-4 text-amber-600 hover:underline">Вернуться назад</button>
      </div>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Назад
      </button>

      <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl p-8 border border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-700 dark:bg-stone-600 rounded-2xl shadow-lg">
            <Hash className="w-10 h-10 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-stone-500 uppercase tracking-widest">Тег</span>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-stone-100">#{tag.name}</h1>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-stone-100 mb-6 flex items-center gap-2 uppercase tracking-wider">
          Книги с тегом ({pagination.total})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-xl border border-dashed border-gray-300 dark:border-stone-800">
            <p className="text-gray-500">С этим тегом пока нет книг.</p>
          </div>
        ) : (
          <>
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

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-amber-300 dark:border-stone-600 text-gray-900 dark:text-stone-100 rounded-lg disabled:opacity-50 hover:bg-amber-50 dark:hover:bg-stone-700"
                >
                  Предыдущая
                </button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                pagination.page === p
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                                    : 'border border-amber-200 dark:border-stone-700 text-gray-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                  className="px-4 py-2 border border-amber-300 dark:border-stone-600 text-gray-900 dark:text-stone-100 rounded-lg disabled:opacity-50 hover:bg-amber-50 dark:hover:bg-stone-700"
                >
                  Следующая
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
