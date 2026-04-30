import React, { useState, useEffect } from 'react';
import { BookListItem, Author, Genre } from '../../../types';
import { api } from '../../../services/api';
import { BookCard } from '../BookCard';
import { Loader, Search, User as UserIcon, Tag } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface SearchResultsPageProps {
  query: string;
  onBookClick: (bookId: number) => void;
  onAuthorClick?: (authorId: number) => void;
  onGenreClick?: (genreId: number) => void;
}

export function SearchResultsPage({ query, onBookClick, onAuthorClick, onGenreClick }: SearchResultsPageProps) {
  const { user } = useAuth();
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performSearch();
    if (user && user.role !== 'guest') {
      loadFavorites();
    }
  }, [query, user]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const results = await api.search.search(query);
      setBooks(results.books);
      setAuthors(results.authors);
      setGenres(results.genres);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const data = await api.users.getFavorites();
      setFavorites(data.map(book => book.id));
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

  const totalResults = books.length + authors.length + genres.length;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-6 h-6 text-gray-400 dark:text-stone-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">
            Результаты поиска: "{query}"
          </h1>
        </div>
        <p className="text-gray-600 dark:text-stone-400">
          Найдено результатов: {totalResults}
        </p>
      </div>

      {totalResults === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-gray-300 dark:text-stone-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-stone-400">По вашему запросу ничего не найдено</p>
          <p className="text-sm text-gray-500 dark:text-stone-500 mt-2">
            Попробуйте изменить поисковый запрос или использовать другие ключевые слова
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {books.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Книги ({books.length})
              </h2>
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
            </div>
          )}

          {authors.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Авторы ({authors.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {authors.map((author) => (
                  <div
                    key={author.id}
                    onClick={() => onAuthorClick?.(author.id)}
                    className="p-4 bg-card border border-amber-200 dark:border-stone-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-stone-100 mb-2">{author.name}</h3>
                    {author.bio && (
                      <p className="text-sm text-gray-600 dark:text-stone-400 line-clamp-2">{author.bio}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {genres.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Жанры ({genres.length})
              </h2>
              <div className="flex flex-wrap gap-3">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => onGenreClick?.(genre.id)}
                    className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
