import React, { useState, useEffect } from 'react';
import { BookListItem, Genre, Author } from '../../../types';
import { api } from '../../../services/api';
import { BookCard } from '../BookCard';
import { Loader, TrendingUp, Award, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface HomePageProps {
  onBookClick: (bookId: number) => void;
}

export function HomePage({ onBookClick }: HomePageProps) {
  const { user } = useAuth();
  const [mostReadGlobal, setMostReadGlobal] = useState<BookListItem[]>([]);
  const [mostReadGenre, setMostReadGenre] = useState<BookListItem[]>([]);
  const [mostReadAuthor, setMostReadAuthor] = useState<BookListItem[]>([]);
  const [recommendations, setRecommendations] = useState<BookListItem[]>([]);
  const [randomGenre, setRandomGenre] = useState<Genre | null>(null);
  const [randomAuthor, setRandomAuthor] = useState<Author | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Fetch initial data
      const [global, genresRes, authorsRes] = await Promise.all([
        api.books.getMostRead({ count: 10 }),
        api.genres.getAll({ pageSize: 50 }), // Get more genres to have a better random pool
        api.authors.getAll({ pageSize: 50 }), // Get more authors
      ]);

      setMostReadGlobal(global);

      if (genresRes.items.length > 0) {
        const randomIndex = Math.floor(Math.random() * genresRes.items.length);
        const selectedGenre = genresRes.items[randomIndex];
        setRandomGenre(selectedGenre);
        
        const genreMostRead = await api.books.getMostRead({ 
          count: 10, 
          genreId: selectedGenre.id 
        });
        setMostReadGenre(genreMostRead);
      }

      // Select random author
      if (authorsRes.items.length > 0) {
        const randomIndex = Math.floor(Math.random() * authorsRes.items.length);
        const selectedAuthor = authorsRes.items[randomIndex];
        setRandomAuthor(selectedAuthor);

        const authorMostRead = await api.books.getMostRead({ 
          count: 10, 
          authorId: selectedAuthor.id 
        });
        setMostReadAuthor(authorMostRead);
      }

      if (user && user.role !== 'guest') {
        const [recs, favs] = await Promise.all([
          api.books.getRecommendations(),
          api.users.getFavorites(),
        ]);
        setRecommendations(recs);
        setFavorites(favs.items.map(b => b.id));
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-amber-600 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Добро пожаловать в Library</h1>
        <p className="text-lg opacity-90 max-w-2xl">
          Ваша персональная цифровая библиотека. Читайте, сохраняйте и открывайте для себя новые книги.
        </p>
      </section>

      {/* Global Most Read */}
      <BookSection
        title="Самые читаемые"
        icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
        books={mostReadGlobal}
        onBookClick={onBookClick}
        onFavoriteToggle={handleFavoriteToggle}
        favorites={favorites}
        userRole={user?.role}
      />

      {/* Recommendations if logged in */}
      {user && user.role !== 'guest' && recommendations.length > 0 && (
        <BookSection
          title="Рекомендуем вам"
          icon={<Award className="w-6 h-6 text-amber-600" />}
          books={recommendations}
          onBookClick={onBookClick}
          onFavoriteToggle={handleFavoriteToggle}
          favorites={favorites}
          userRole={user?.role}
        />
      )}

      {/* Most Read by Genre */}
      {randomGenre && mostReadGenre.length > 0 && (
        <BookSection
          title={`Популярно в жанре: ${randomGenre.name}`}
          icon={<BookOpen className="w-6 h-6 text-amber-600" />}
          books={mostReadGenre}
          onBookClick={onBookClick}
          onFavoriteToggle={handleFavoriteToggle}
          favorites={favorites}
          userRole={user?.role}
        />
      )}

      {/* Most Read by Author */}
      {randomAuthor && mostReadAuthor.length > 0 && (
        <BookSection
          title={`Лучшее от автора: ${randomAuthor.name}`}
          icon={<User className="w-6 h-6 text-amber-600" />}
          books={mostReadAuthor}
          onBookClick={onBookClick}
          onFavoriteToggle={handleFavoriteToggle}
          favorites={favorites}
          userRole={user?.role}
        />
      )}
    </div>
  );
}

interface BookSectionProps {
  title: string;
  icon: React.ReactNode;
  books: BookListItem[];
  onBookClick: (id: number) => void;
  onFavoriteToggle: (id: number) => void;
  favorites: number[];
  userRole?: string;
}

function BookSection({ title, icon, books, onBookClick, onFavoriteToggle, favorites, userRole }: BookSectionProps) {
  if (books.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        {icon}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-stone-100">{title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {books.map(book => (
          <BookCard
            key={book.id}
            book={book}
            onClick={() => onBookClick(book.id)}
            onFavoriteToggle={onFavoriteToggle}
            isFavorite={favorites.includes(book.id)}
            showFavoriteButton={userRole !== 'guest'}
          />
        ))}
      </div>
    </section>
  );
}
