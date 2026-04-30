import React, { useState, useEffect } from 'react';
import { Collection } from '../../../types';
import { api } from '../../../services/api';
import { Plus, Edit, Trash2, Loader, BookOpen, X } from 'lucide-react';
import { BookCard } from '../BookCard';
import { useAuth } from '../../../contexts/AuthContext';

interface CollectionsPageProps {
  onBookClick: (bookId: number) => void;
}

export function CollectionsPage({ onBookClick }: CollectionsPageProps) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await api.collections.getAll();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await api.collections.create({ title: newTitle });
      setNewTitle('');
      setShowCreateModal(false);
      await loadCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Ошибка при создании подборки');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollection || !editingTitle.trim()) return;

    try {
      await api.collections.update(selectedCollection.id, { title: editingTitle });
      setShowEditModal(false);
      await loadCollections();
      const updated = collections.find(c => c.id === selectedCollection.id);
      if (updated) {
        setSelectedCollection({ ...selectedCollection, title: editingTitle });
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      alert('Ошибка при обновлении подборки');
    }
  };

  const handleDelete = async (collectionId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту подборку?')) return;

    try {
      await api.collections.delete(collectionId);
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
      }
      await loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Ошибка при удалении подборки');
    }
  };

  const handleRemoveBook = async (bookId: number) => {
    if (!selectedCollection) return;

    try {
      await api.collections.removeBook(selectedCollection.id, bookId);
      setSelectedCollection({
        ...selectedCollection,
        books: selectedCollection.books.filter(b => b.id !== bookId),
      });
      await loadCollections();
    } catch (error) {
      console.error('Error removing book:', error);
      alert('Ошибка при удалении книги из подборки');
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Мои подборки</h1>
          <p className="text-gray-600 dark:text-stone-400 mt-1">Создавайте свои списки любимых книг</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Создать подборку
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 p-4">
            <h2 className="font-semibold text-gray-900 dark:text-stone-100 mb-4">Подборки</h2>
            {collections.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-stone-400 text-center py-8">
                У вас пока нет подборок
              </p>
            ) : (
              <div className="space-y-2">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    onClick={() => setSelectedCollection(collection)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCollection?.id === collection.id
                        ? 'bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-600 dark:border-amber-500'
                        : 'border-2 border-transparent hover:bg-gray-50 dark:hover:bg-stone-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-stone-100">{collection.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-stone-400 mt-1">
                          {collection.books.length} {collection.books.length === 1 ? 'книга' : 'книг'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCollection(collection);
                            setEditingTitle(collection.title);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(collection.id);
                          }}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedCollection ? (
            <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 mb-6">
                {selectedCollection.title}
              </h2>

              {selectedCollection.books.length === 0 ? (
                <div className="text-center py-20">
                  <BookOpen className="w-16 h-16 text-gray-300 dark:text-stone-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-stone-400">В этой подборке пока нет книг</p>
                  <p className="text-sm text-gray-500 dark:text-stone-500 mt-2">
                    Добавляйте книги в подборку со страницы книги
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedCollection.books.map((book) => (
                    <div key={book.id} className="relative">
                      <BookCard
                        book={book}
                        onClick={() => onBookClick(book.id)}
                        showFavoriteButton={false}
                      />
                      <button
                        onClick={() => handleRemoveBook(book.id)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Удалить из подборки"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 p-6 text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 dark:text-stone-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-stone-400">Выберите подборку для просмотра</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 mb-4">
              Создать подборку
            </h2>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Название подборки"
                className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
                autoFocus
                required
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTitle('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-stone-600 text-gray-700 dark:text-stone-300 rounded-lg hover:bg-gray-50 dark:hover:bg-stone-700"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 mb-4">
              Редактировать подборку
            </h2>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                placeholder="Название подборки"
                className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
                autoFocus
                required
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-stone-600 text-gray-700 dark:text-stone-300 rounded-lg hover:bg-gray-50 dark:hover:bg-stone-700"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
