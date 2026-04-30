import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ReaderProvider } from '../contexts/ReaderContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Header } from './components/Header';
import { CatalogPage } from './components/pages/CatalogPage';
import { BookDetailsPage } from './components/pages/BookDetailsPage';
import { BookReaderPage } from './components/pages/BookReaderPage';
import { AuthPage } from './components/pages/AuthPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { AdminPage } from './components/pages/AdminPage';
import { SearchResultsPage } from './components/pages/SearchResultsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { CollectionsPage } from './components/pages/CollectionsPage';

type Page =
  | { type: 'catalog' }
  | { type: 'search'; query: string }
  | { type: 'book-details'; bookId: number }
  | { type: 'reader'; bookId: number }
  | { type: 'login' }
  | { type: 'profile' }
  | { type: 'reading' }
  | { type: 'favorites' }
  | { type: 'collections' }
  | { type: 'admin' };

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'catalog' });

  const navigate = (page: string, params?: any) => {
    switch (page) {
      case 'catalog':
        setCurrentPage({ type: 'catalog' });
        break;
      case 'search':
        setCurrentPage({ type: 'search', query: params.query });
        break;
      case 'book-details':
        setCurrentPage({ type: 'book-details', bookId: params.bookId });
        break;
      case 'reader':
        setCurrentPage({ type: 'reader', bookId: params.bookId });
        break;
      case 'login':
        setCurrentPage({ type: 'login' });
        break;
      case 'profile':
        setCurrentPage({ type: 'profile' });
        break;
      case 'reading':
        setCurrentPage({ type: 'reading' });
        break;
      case 'favorites':
        setCurrentPage({ type: 'favorites' });
        break;
      case 'collections':
        setCurrentPage({ type: 'collections' });
        break;
      case 'admin':
        setCurrentPage({ type: 'admin' });
        break;
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
    return <AuthPage onSuccess={() => navigate('catalog')} />;
  }

  if (currentPage.type === 'reader') {
    return (
      <BookReaderPage
        bookId={currentPage.bookId}
        onBack={() => navigate('book-details', { bookId: currentPage.bookId })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header
        onSearch={handleSearch}
        onNavigate={navigate}
        currentPage={currentPage.type}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage.type === 'catalog' && (
          <CatalogPage
            onBookClick={(bookId) => navigate('book-details', { bookId })}
          />
        )}

        {currentPage.type === 'search' && (
          <SearchResultsPage
            query={currentPage.query}
            onBookClick={(bookId) => navigate('book-details', { bookId })}
            onAuthorClick={(authorId) => navigate('catalog')}
            onGenreClick={(genreId) => navigate('catalog')}
          />
        )}

        {currentPage.type === 'book-details' && (
          <BookDetailsPage
            bookId={currentPage.bookId}
            onStartReading={(bookId) => navigate('reader', { bookId })}
            onBack={() => navigate('catalog')}
          />
        )}

        {currentPage.type === 'profile' && <SettingsPage />}

        {currentPage.type === 'reading' && (
          <ProfilePage
            onBookClick={(bookId) => navigate('book-details', { bookId })}
            initialTab="reading"
          />
        )}

        {currentPage.type === 'favorites' && (
          <ProfilePage
            onBookClick={(bookId) => navigate('book-details', { bookId })}
            initialTab="favorites"
          />
        )}

        {currentPage.type === 'collections' && (
          <CollectionsPage onBookClick={(bookId) => navigate('book-details', { bookId })} />
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