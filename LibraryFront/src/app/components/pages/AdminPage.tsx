import React, { useState, useEffect } from 'react';
import { Book, Author, Genre } from '../../../types';
import { api } from '../../../services/api';
import { Plus, Edit, Trash2, Loader, Save, X } from 'lucide-react';
import { BookEditModal } from '../BookEditModal';
import { AuthorEditModal } from '../AuthorEditModal';
import { GenreEditModal } from '../GenreEditModal';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<'books' | 'authors' | 'genres'>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddAuthorModal, setShowAddAuthorModal] = useState(false);
  const [showAddGenreModal, setShowAddGenreModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksData, authorsData, genresData] = await Promise.all([
        api.books.getAll({ pageSize: 50 }),
        api.authors.getAll(),
        api.genres.getAll(),
      ]);

      const fullBooks = await Promise.all(
        booksData.items.map(item => api.books.getById(item.id))
      );

      setBooks(fullBooks);
      setAuthors(authorsData);
      setGenres(genresData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту книгу?')) return;

    try {
      await api.books.delete(bookId);
      setBooks(books.filter(b => b.id !== bookId));
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Ошибка при удалении книги');
    }
  };

  const handleDeleteAuthor = async (authorId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого автора?')) return;

    try {
      await api.authors.delete(authorId);
      setAuthors(authors.filter(a => a.id !== authorId));
    } catch (error) {
      console.error('Error deleting author:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при удалении автора');
    }
  };

  const handleDeleteGenre = async (genreId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот жанр?')) return;

    try {
      await api.genres.delete(genreId);
      setGenres(genres.filter(g => g.id !== genreId));
    } catch (error) {
      console.error('Error deleting genre:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при удалении жанра');
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Панель управления</h1>
        <p className="text-gray-600 dark:text-stone-400 mt-1">Управление контентом библиотеки</p>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700">
        <div className="border-b border-amber-200 dark:border-stone-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('books')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'books'
                  ? 'text-amber-600 dark:text-amber-500 border-b-2 border-amber-600 dark:border-amber-500'
                  : 'text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-200'
              }`}
            >
              Книги ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('authors')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'authors'
                  ? 'text-amber-600 dark:text-amber-500 border-b-2 border-amber-600 dark:border-amber-500'
                  : 'text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-200'
              }`}
            >
              Авторы ({authors.length})
            </button>
            <button
              onClick={() => setActiveTab('genres')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'genres'
                  ? 'text-amber-600 dark:text-amber-500 border-b-2 border-amber-600 dark:border-amber-500'
                  : 'text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-200'
              }`}
            >
              Жанры ({genres.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'books' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-stone-100">Управление книгами</h2>
                <button
                  onClick={() => setShowAddBookModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  <Plus className="w-5 h-5" />
                  Добавить книгу
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-amber-200 dark:border-stone-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-stone-300">Обложка</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-stone-300">Название</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-stone-300">Авторы</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-stone-300">Жанры</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-stone-300">Рейтинг</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-stone-300">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id} className="border-b border-amber-100 dark:border-stone-800 hover:bg-amber-50/50 dark:hover:bg-stone-800/50">
                        <td className="py-3 px-4">
                          <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden">
                            {book.coverFile ? (
                              <img
                                src={book.coverFile}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 dark:from-stone-700 dark:to-stone-600 flex items-center justify-center">
                                <span className="text-xs font-bold text-amber-300 dark:text-amber-400">{book.title[0]}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-stone-100">{book.title}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600 dark:text-stone-400">
                            {book.authors.map(a => a.name).join(', ')}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {book.genres.slice(0, 2).map(genre => (
                              <span
                                key={genre.id}
                                className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 rounded text-xs"
                              >
                                {genre.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600 dark:text-stone-400">
                            {book.averageRating ? book.averageRating.toFixed(1) : '—'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingBook(book)}
                              className="p-1 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded"
                              title="Редактировать"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'authors' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-stone-100">Управление авторами</h2>
                <button
                  onClick={() => setShowAddAuthorModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  <Plus className="w-5 h-5" />
                  Добавить автора
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {authors.map((author) => (
                  <div key={author.id} className="p-4 bg-card border border-amber-200 dark:border-stone-700 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 dark:text-stone-100 mb-2">{author.name}</h3>
                    {author.bio && (
                      <p className="text-sm text-gray-600 dark:text-stone-400 mb-3 line-clamp-2">{author.bio}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingAuthor(author)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-amber-600 dark:text-amber-500 border border-amber-600 dark:border-amber-500 rounded hover:bg-amber-50 dark:hover:bg-amber-900/30"
                      >
                        <Edit className="w-3 h-3" />
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDeleteAuthor(author.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="w-3 h-3" />
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'genres' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-stone-100">Управление жанрами</h2>
                <button
                  onClick={() => setShowAddGenreModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  <Plus className="w-5 h-5" />
                  Добавить жанр
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {genres.map((genre) => (
                  <div
                    key={genre.id}
                    className="p-4 bg-card border border-amber-200 dark:border-stone-700 rounded-lg hover:shadow-md transition-shadow flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900 dark:text-stone-100">{genre.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingGenre(genre)}
                        className="p-1 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGenre(genre.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editingBook && (
        <BookEditModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSave={() => {
            loadData();
            setEditingBook(null);
          }}
        />
      )}

      {showAddBookModal && (
        <BookEditModal
          onClose={() => setShowAddBookModal(false)}
          onSave={() => {
            loadData();
            setShowAddBookModal(false);
          }}
        />
      )}

      {editingAuthor && (
        <AuthorEditModal
          author={editingAuthor}
          onClose={() => setEditingAuthor(null)}
          onSave={() => {
            loadData();
            setEditingAuthor(null);
          }}
        />
      )}

      {showAddAuthorModal && (
        <AuthorEditModal
          onClose={() => setShowAddAuthorModal(false)}
          onSave={() => {
            loadData();
            setShowAddAuthorModal(false);
          }}
        />
      )}

      {editingGenre && (
        <GenreEditModal
          genre={editingGenre}
          onClose={() => setEditingGenre(null)}
          onSave={() => {
            loadData();
            setEditingGenre(null);
          }}
        />
      )}

      {showAddGenreModal && (
        <GenreEditModal
          onClose={() => setShowAddGenreModal(false)}
          onSave={() => {
            loadData();
            setShowAddGenreModal(false);
          }}
        />
      )}
    </div>
  );
}
