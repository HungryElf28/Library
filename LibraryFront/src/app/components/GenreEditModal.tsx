import React, { useState } from 'react';
import { Genre } from '../../types';
import { api } from '../../services/api';
import { X, Loader } from 'lucide-react';

interface GenreEditModalProps {
  genre?: Genre;
  onClose: () => void;
  onSave: () => void;
}

export function GenreEditModal({ genre, onClose, onSave }: GenreEditModalProps) {
  const [name, setName] = useState(genre?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = { name };

      if (genre) {
        await api.genres.update(genre.id, data);
      } else {
        await api.genres.create(data);
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-amber-200 dark:border-stone-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100">
            {genre ? 'Редактировать жанр' : 'Добавить жанр'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-stone-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-2">
              Название жанра *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Введите название жанра"
            />
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-stone-600 text-gray-700 dark:text-stone-300 rounded-lg hover:bg-gray-50 dark:hover:bg-stone-700 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {genre ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
