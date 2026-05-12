import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ReaderProvider } from '../contexts/ReaderContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Header } from './components/Header';
import { HomePage } from './components/pages/HomePage';
import { CatalogPage } from './components/pages/CatalogPage';
import { BookDetailsPage } from './components/pages/BookDetailsPage';
import { BookReaderPage } from './components/pages/BookReaderPage';
import { AuthPage } from './components/pages/AuthPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { AdminPage } from './components/pages/AdminPage';
import { SearchResultsPage } from './components/pages/SearchResultsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { CollectionsPage } from './components/pages/CollectionsPage';
import { RecommendationsPage } from './components/pages/RecommendationsPage';
import { AuthorDetailsPage } from './components/pages/AuthorDetailsPage';
import { GenreDetailsPage } from './components/pages/GenreDetailsPage';
import { TagDetailsPage } from './components/pages/TagDetailsPage';

type Page =
  | { type: 'home' }
  | { type: 'catalog' }
  | { type: 'search'; query: string }
  | { type: 'book-details'; bookId: number }
  | { type: 'reader'; bookId: number }
  | { type: 'login' }
  | { type: 'profile' }
  | { type: 'reading' }
  | { type: 'favorites' }
  | { type: 'collections' }
  | { type: 'recommendations' }
  | { type: 'author-details'; authorId: number }
  | { type: 'genre-details'; genreId: number }
  | { type: 'tag-details'; tagId: number }
  | { type: 'admin' };

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'home' });
  const [history, setHistory] = useState<Page[]>([]);

  const navigate = (page: string, params?: any, addToHistory = true) => {
    let nextPage: Page;
    switch (page) {
      case 'home':
        nextPage = { type: 'home' };
        break;
      case 'catalog':
        nextPage = { type: 'catalog' };
        break;
      case 'search':
        nextPage = { type: 'search', query: params.query };
        break;
      case 'book-details':
        nextPage = { type: 'book-details', bookId: params.bookId };
        break;
      case 'author-details':
        nextPage = { type: 'author-details', authorId: params.authorId };
        break;
      case 'genre-details':
        nextPage = { type: 'genre-details', genreId: params.genreId };
        break;
      case 'tag-details':
        nextPage = { type: 'tag-details', tagId: params.tagId };
        break;
      case 'reader':
        nextPage = { type: 'reader', bookId: params.bookId };
        break;
      case 'login':
        nextPage = { type: 'login' };
        break;
      case 'profile':
        nextPage = { type: 'profile' };
        break;
      case 'reading':
        nextPage = { type: 'reading' };
        break;
      case 'favorites':
        nextPage = { type: 'favorites' };
        break;
      case 'collections':
        nextPage = { type: 'collections' };
        break;
      case 'recommendations':
        nextPage = { type: 'recommendations' };
        break;
      case 'admin':
        nextPage = { type: 'admin' };
        break;
      default:
        return;
    }

    if (addToHistory && JSON.stringify(currentPage) !== JSON.stringify(nextPage)) {
      setHistory(prev => [...prev, currentPage]);
    }
    setCurrentPage(nextPage);
  };

  const goBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevPage = newHistory.pop()!;
      setHistory(newHistory);
      setCurrentPage(prevPage);
    } else {
      setCurrentPage({ type: 'home' });
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate('search', { query });
    }
  };

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (currentPage.type === 'login') {
    return <AuthPage onSuccess={() => navigate('catalog', {}, false)} onBack={goBack} />;
  }

  if (currentPage.type === 'reader') {
    return (
      <BookReaderPage
        bookId={currentPage.bookId}
        onBack={goBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header
        onSearch={handleSearch}
        onNavigate={(page, params) => navigate(page, params)}
        currentPage={currentPage.type}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage.type === 'home' && (
          <HomePage
            onBookClick={(bookId) => navigate('book-details', { bookId })}
          />
        )}
        {currentPage.type === 'search' && (
          <SearchResultsPage
            query={currentPage.query}
            onBookClick={(bookId) => navigate('book-details', { bookId })}
            onAuthorClick={(authorId) => navigate('author-details', { authorId })}
            onGenreClick={(genreId) => navigate('genre-details', { genreId })}
            onTagClick={(tagId) => navigate('tag-details', { tagId })}
          />
        )}
        {currentPage.type === 'catalog' && (
          <CatalogPage
            onBookClick={(bookId) => navigate('book-details', { bookId })}
          />
        )}

        {currentPage.type === 'book-details' && (
          <BookDetailsPage
            bookId={currentPage.bookId}
            onStartReading={(bookId) => navigate('reader', { bookId })}
            onAuthorClick={(authorId) => navigate('author-details', { authorId })}
            onGenreClick={(genreId) => navigate('genre-details', { genreId })}
            onTagClick={(tagId) => navigate('tag-details', { tagId })}
            onBack={goBack}
            onNavigateToLogin={() => navigate('login')}
          />
        )}

        {currentPage.type === 'author-details' && (
          <AuthorDetailsPage
            authorId={currentPage.authorId}
            onBookClick={(bookId) => navigate('book-details', { bookId })}
            onBack={goBack}
          />
        )}

        {currentPage.type === 'genre-details' && (
          <GenreDetailsPage
            genreId={currentPage.genreId}
            onBookClick={(bookId) => navigate('book-details', { bookId })}
            onBack={goBack}
          />
        )}

        {currentPage.type === 'tag-details' && (
          <TagDetailsPage
            tagId={currentPage.tagId}
            onBookClick={(bookId) => navigate('book-details', { bookId })}
            onBack={goBack}
          />
        )}

        {currentPage.type === 'profile' && <SettingsPage />}

        {currentPage.type === 'reading' && (
          <ProfilePage
            onBookClick={(bookId) => navigate('book-details', { bookId })}
            onStartReading={(bookId) => navigate('reader', { bookId })}
            initialTab="reading"
          />
        )}

        {currentPage.type === 'favorites' && (
          <ProfilePage
            onBookClick={(bookId) => navigate('book-details', { bookId })}
            onStartReading={(bookId) => navigate('reader', { bookId })}
            initialTab="favorites"
          />
        )}


        {currentPage.type === 'collections' && (
          <CollectionsPage onBookClick={(bookId) => navigate('book-details', { bookId })} />
        )}

        {currentPage.type === 'recommendations' && (
          <RecommendationsPage onBookClick={(bookId) => navigate('book-details', { bookId })} />
        )}

        {currentPage.type === 'admin' && user?.role === 'admin' && <AdminPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ReaderProvider>
          <AppContent />
        </ReaderProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}