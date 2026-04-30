import React, { useState, useEffect } from 'react';
import { BookListItem, Genre, BookQueryParams } from '../../../types';
import { api } from '../../../services/api';
import { BookCard } from '../BookCard';
import { FilterSidebar } from '../FilterSidebar';
import { Filter, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface CatalogPageProps {
  onBookClick: (bookId: number) => void;
}

export function CatalogPage({ onBookClick }: CatalogPageProps) {
  const { user } = useAuth();
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [filters, setFilters] = useState<BookQueryParams>({
    page: 1,
    pageSize: 12,
    sortBy: 'Title',
    sortOrder: 'Asc',
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 12,
  });

  useEffect(() => {
    loadGenres();
    if (user && user.role !== 'guest') {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    loadBooks();
  }, [filters]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await api.books.getAll(filters);
      setBooks(response.items);
      setPagination({
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
      });
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      const data = await api.genres.getAll();
      setGenres(data);
    } catch (error) {
      console.error('Error loading genres:', error);
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
    if (!user || user.role === 'guest') {
      return;
    }

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
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="flex gap-6 relative">
      <aside className={`hidden lg:block flex-shrink-0 transition-all duration-300 relative ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
        <div className="sticky top-20">
          <FilterSidebar
            genres={genres}
            selectedGenre={filters.genreId}
            sortBy={filters.sortBy || 'Title'}
            sortOrder={filters.sortOrder || 'Asc'}
            onGenreChange={(genreId) => setFilters({ ...filters, genreId, page: 1 })}
            onSortChange={(sortBy, sortOrder) => setFilters({ ...filters, sortBy, sortOrder, page: 1 })}
          />
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="absolute -right-4 top-0 w-8 h-8 bg-card border border-amber-200 dark:border-stone-600 rounded-lg hover:bg-amber-100 dark:hover:bg-stone-600 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4 mx-auto text-gray-600 dark:text-stone-400" />
            </button>
          )}
        </div>
      </aside>

      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="hidden lg:flex items-center justify-center w-8 h-8 bg-card border border-amber-200 dark:border-stone-600 rounded-lg hover:bg-amber-100 dark:hover:bg-stone-600 transition-colors shadow-sm sticky top-20 left-0 z-10"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-stone-400" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">
            Каталог книг
          </h1>

          <button
            onClick={() => setShowFilters(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-card border border-amber-300 dark:border-stone-600 text-gray-900 dark:text-stone-100 rounded-lg text-sm font-medium hover:bg-amber-50 dark:hover:bg-stone-700"
          >
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-stone-400">
              Книги не найдены.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-amber-300 dark:border-stone-600 text-gray-900 dark:text-stone-100 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 dark:hover:bg-stone-700"
                >
                  Предыдущая
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (pagination.page <= 3) {
                      page = i + 1;
                    } else if (pagination.page >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          pagination.page === page
                            ? 'bg-amber-600 text-white'
                            : 'border border-amber-300 dark:border-stone-600 text-gray-900 dark:text-stone-100 hover:bg-amber-50 dark:hover:bg-stone-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                  className="px-4 py-2 border border-amber-300 dark:border-stone-600 text-gray-900 dark:text-stone-100 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 dark:hover:bg-stone-700"
                >
                  Следующая
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <FilterSidebar
              genres={genres}
              selectedGenre={filters.genreId}
              sortBy={filters.sortBy || 'Title'}
              sortOrder={filters.sortOrder || 'Asc'}
              onGenreChange={(genreId) => setFilters({ ...filters, genreId, page: 1 })}
              onSortChange={(sortBy, sortOrder) => setFilters({ ...filters, sortBy, sortOrder, page: 1 })}
              onClose={() => setShowFilters(false)}
              isMobile
            />
          </div>
        </div>
      )}
    </div>
  );
}
