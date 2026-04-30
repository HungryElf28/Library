import React from 'react';
import { Genre } from '../../types';
import { X } from 'lucide-react';

interface FilterSidebarProps {
  genres: Genre[];
  selectedGenre?: number;
  sortBy: 'Title' | 'Rate';
  sortOrder: 'Asc' | 'Desc';
  onGenreChange: (genreId?: number) => void;
  onSortChange: (sortBy: 'Title' | 'Rate', sortOrder: 'Asc' | 'Desc') => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function FilterSidebar({
  genres,
  selectedGenre,
  sortBy,
  sortOrder,
  onGenreChange,
  onSortChange,
  onClose,
  isMobile,
}: FilterSidebarProps) {
  return (
    <div className={`bg-card ${isMobile ? 'fixed inset-0 z-40 overflow-y-auto' : 'rounded-lg border border-amber-200 dark:border-stone-700'} p-6`}>
      {isMobile && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-stone-100">Фильтры</h2>
          <button onClick={onClose} className="p-2 hover:bg-amber-50 dark:hover:bg-stone-700 rounded-lg">
            <X className="w-5 h-5 text-gray-600 dark:text-stone-400" />
          </button>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-stone-100 mb-3">Жанры</h3>
          <div className="space-y-2">
            <button
              onClick={() => onGenreChange(undefined)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !selectedGenre ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200' : 'text-gray-700 dark:text-stone-300 hover:bg-amber-50/50 dark:hover:bg-stone-700'
              }`}
            >
              Все жанры
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => onGenreChange(genre.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedGenre === genre.id ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200' : 'text-gray-700 dark:text-stone-300 hover:bg-amber-50/50 dark:hover:bg-stone-700'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-amber-200 dark:border-stone-700">
          <h3 className="font-medium text-gray-900 dark:text-stone-100 mb-3">Сортировка</h3>
          <div className="space-y-2">
            <button
              onClick={() => onSortChange('Title', sortOrder)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                sortBy === 'Title' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200' : 'text-gray-700 dark:text-stone-300 hover:bg-amber-50/50 dark:hover:bg-stone-700'
              }`}
            >
              По названию
            </button>
            <button
              onClick={() => onSortChange('Rate', sortOrder)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                sortBy === 'Rate' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200' : 'text-gray-700 dark:text-stone-300 hover:bg-amber-50/50 dark:hover:bg-stone-700'
              }`}
            >
              По рейтингу
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <button
              onClick={() => onSortChange(sortBy, 'Asc')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                sortOrder === 'Asc' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200' : 'text-gray-700 dark:text-stone-300 hover:bg-amber-50/50 dark:hover:bg-stone-700'
              }`}
            >
              По возрастанию
            </button>
            <button
              onClick={() => onSortChange(sortBy, 'Desc')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                sortOrder === 'Desc' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200' : 'text-gray-700 dark:text-stone-300 hover:bg-amber-50/50 dark:hover:bg-stone-700'
              }`}
            >
              По убыванию
            </button>
          </div>
        </div>
      </div>

      {isMobile && (
        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
        >
          Применить
        </button>
      )}
    </div>
  );
}
