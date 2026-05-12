import React, { useState, useEffect } from 'react';
import { Author, BookListItem, BookQueryParams } from '../../../types';
import { api } from '../../../services/api';
import { BookCard } from '../BookCard';
import { Loader, ArrowLeft, User, Book as BookIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE } from '../../../config';

interface AuthorDetailsPageProps {
  authorId: number;
  onBookClick: (bookId: number) => void;
  onBack: () => void;
}

export function AuthorDetailsPage({ authorId, onBookClick, onBack }: AuthorDetailsPageProps) {
  const { user } = useAuth();
  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    loadAuthor();
    if (user && user.role !== 'guest') {
      loadFavorites();
    }
  }, [authorId, user]);

  useEffect(() => {
    loadBooks();
  }, [authorId, pagination.page]);

  const loadAuthor = async () => {
    try {
      const data = await api.authors.getById(authorId);
      setAuthor(data);
    } catch (error) {
      console.error('Error loading author:', error);
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await api.books.getAll({
        authorId,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      setBooks(response.items);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (error) {
      console.error('Error loading author books:', error);
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

  if (loading && !author) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 dark:text-stone-400">Автор не найден.</p>
        <button onClick={onBack} className="mt-4 text-amber-600 hover:underline">Вернуться назад</button>
      </div>
    );
  }

  const photoUrl = author.photo
    ? (author.photo.startsWith('http') ? author.photo : `${API_BASE}${author.photo.startsWith('/') ? '' : '/'}${author.photo}`)
    : null;

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

      <div className="bg-card rounded-2xl border border-amber-200 dark:border-stone-700 overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 p-6 md:p-8">
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={author.name}
                className="w-48 h-64 object-cover rounded-xl shadow-md border-4 border-white dark:border-stone-800"
              />
            ) : (
              <div className="w-48 h-64 bg-amber-100 dark:bg-stone-800 rounded-xl flex items-center justify-center border-4 border-white dark:border-stone-800 shadow-md">
                <User className="w-20 h-20 text-amber-300 dark:text-stone-600" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-stone-100">{author.name}</h1>
            {author.bio ? (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">{author.bio}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">Биография отсутствует.</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-stone-100 mb-6 flex items-center gap-2">
          <BookIcon className="w-6 h-6 text-amber-600" />
          Книги автора ({pagination.total})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-stone-900/40 rounded-xl border border-dashed border-gray-300 dark:border-stone-800">
            <p className="text-gray-500">Книги этого автора пока не добавлены.</p>
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
                  className="p-2 border border-amber-300 dark:border-stone-600 text-gray-900 dark:text-stone-100 rounded-lg disabled:opacity-50 hover:bg-amber-50 dark:hover:bg-stone-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium">Страница {pagination.page} из {totalPages}</span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                  className="p-2 border border-amber-300 dark:border-stone-600 text-gray-900 dark:text-stone-100 rounded-lg disabled:opacity-50 hover:bg-amber-50 dark:hover:bg-stone-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
