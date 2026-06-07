import React, { useState, useEffect } from 'react';
import { BookListItem, Genre, Author } from '../../../types';
import { api } from '../../../services/api';
import { BookCard } from '../BookCard';
import { Loader, TrendingUp, Award, User, BookOpen, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface HomePageProps {
  onBookClick: (bookId: number) => void;
  onNavigate: (page: string, params?: any) => void;
}

export function HomePage({ onBookClick, onNavigate }: HomePageProps) {
  const { user } = useAuth();
  const [mostReadGlobal, setMostReadGlobal] = useState<BookListItem[]>([]);
  const [mostReadGenre, setMostReadGenre] = useState<BookListItem[]>([]);
  const [mostReadAuthor, setMostReadAuthor] = useState<BookListItem[]>([]);
  const [recommendations, setRecommendations] = useState<BookListItem[]>([]);
  const [randomGenre, setRandomGenre] = useState<Genre | null>(null);
  const [randomAuthor, setRandomAuthor] = useState<Author | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHero, setShowHero] = useState(true);

  useEffect(() => {
    loadInitialData();

    const timer = setTimeout(() => {
      setShowHero(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [global, genresRes, authorsRes] = await Promise.all([
        api.books.getMostRead({ count: 10 }),
        api.genres.getAll({ pageSize: 500 }),
        api.authors.getAll({ pageSize: 500 }),
      ]);

      setMostReadGlobal(global);

      if (genresRes.items.length > 0) {
        const randomIndex = Math.floor(Math.random() * genresRes.items.length);
        const selectedGenre = genresRes.items[randomIndex];
        setRandomGenre(selectedGenre);
        
        const genreMostRead = await api.books.getMostRead({ 
          count: 5, 
          genreId: selectedGenre.id 
        });
        setMostReadGenre(genreMostRead);
      }

      if (authorsRes.items.length > 0) {
        const randomIndex = Math.floor(Math.random() * authorsRes.items.length);
        const selectedAuthor = authorsRes.items[randomIndex];
        setRandomAuthor(selectedAuthor);

        const authorMostRead = await api.books.getMostRead({ 
          count: 5, 
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
      {showHero && (
        <section className="bg-amber-600 rounded-2xl p-8 text-white transition-all duration-500 overflow-hidden">
          <h1 className="text-4xl font-bold mb-4">Добро пожаловать в Library</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Ваша персональная цифровая библиотека. Читайте, сохраняйте и открывайте для себя новые книги.
          </p>
        </section>
      )}

      <BookSection
        title="Самые читаемые"
        icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
        books={mostReadGlobal}
        onBookClick={onBookClick}
        onFavoriteToggle={handleFavoriteToggle}
        favorites={favorites}
        userRole={user?.role}
      />

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

      {randomGenre && mostReadGenre.length > 0 && (
        <BookSection
          title={`Популярно в жанре: ${randomGenre.name}`}
          icon={<BookOpen className="w-6 h-6 text-amber-600" />}
          books={mostReadGenre}
          onBookClick={onBookClick}
          onFavoriteToggle={handleFavoriteToggle}
          favorites={favorites}
          userRole={user?.role}
          onHeaderClick={() => {
            console.log('Navigating to genre:', randomGenre.id);
            onNavigate('genre-details', { genreId: randomGenre.id });
          }}
        />
      )}

      {/* Most Read by Author */}
      {randomAuthor && mostReadAuthor.length > 0 && (
        <BookSection
          title={`Популярно у автора: ${randomAuthor.name}`}
          icon={<User className="w-6 h-6 text-amber-600" />}
          books={mostReadAuthor}
          onBookClick={onBookClick}
          onFavoriteToggle={handleFavoriteToggle}
          favorites={favorites}
          userRole={user?.role}
          onHeaderClick={() => {
            console.log('Navigating to author:', randomAuthor.id);
            onNavigate('author-details', { authorId: randomAuthor.id });
          }}
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
  onHeaderClick?: () => void;
}

function BookSection({ title, icon, books, onBookClick, onFavoriteToggle, favorites, userRole, onHeaderClick }: BookSectionProps) {
  if (books.length === 0) return null;

  return (
    <section>
      <div 
        className={`flex items-center justify-between mb-6 ${onHeaderClick ? 'cursor-pointer group' : ''}`}
        onClick={onHeaderClick}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
            {title}
          </h2>
        </div>
        {onHeaderClick && (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-500 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Смотреть все</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        )}
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