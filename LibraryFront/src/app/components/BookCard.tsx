import React from 'react';
import { Star, Heart } from 'lucide-react';
import { BookListItem } from '../../types';

interface BookCardProps {
  book: BookListItem;
  onClick: () => void;
  onFavoriteToggle?: (bookId: number) => void;
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
}

export function BookCard({ book, onClick, onFavoriteToggle, isFavorite, showFavoriteButton }: BookCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(book.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-amber-200 dark:border-stone-700"
    >
      <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
        {book.coverFile ? (
          <img
            src={book.coverFile}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-stone-700 dark:to-stone-600">
            <span className="text-4xl font-bold text-amber-300 dark:text-amber-400">{book.title[0]}</span>
          </div>
        )}

        {showFavoriteButton && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        )}

        {book.averageRating && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-full text-xs font-medium">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-900 dark:text-stone-100">{book.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-stone-100 line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-sm text-gray-600 dark:text-stone-400 line-clamp-1">{book.authors?.join(', ') || 'Unknown author'}</p>
      </div>
    </div>
  );
}
