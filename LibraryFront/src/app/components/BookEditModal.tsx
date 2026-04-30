import React, { useState, useEffect } from 'react';
import { Book, Author, Genre, Tag, CreateBookDto } from '../../types';
import { api } from '../../services/api';
import { X, Loader, Save } from 'lucide-react';

interface BookEditModalProps {
  book?: Book;
  onClose: () => void;
  onSave: () => void;
}

export function BookEditModal({ book, onClose, onSave }: BookEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [allAuthors, setAllAuthors] = useState<Author[]>([]);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const [formData, setFormData] = useState<CreateBookDto>({
    title: book?.title || '',
    textFile: book?.textFile || '',
    coverFile: book?.coverFile || '',
    description: book?.description || '',
    authorIds: book?.authors.map(a => a.id) || [],
    genreIds: book?.genres.map(g => g.id) || [],
    tagIds: book?.tags.map(t => t.id) || [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [authors, genres, tags] = await Promise.all([
        api.authors.getAll(),
        api.genres.getAll(),
        api.tags.getAll(),
      ]);
      setAllAuthors(authors);
      setAllGenres(genres);
      setAllTags(tags);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const form = new FormData();

    form.append('Title', formData.title);
    form.append('Description', formData.description || '');

    if (formData.textFile)
      form.append('TextFile', formData.textFile);

    if (formData.coverFile)
      form.append('CoverFile', formData.coverFile);

    formData.authorIds.forEach(id =>
      form.append('AuthorIds', id.toString())
    );

    formData.genreIds.forEach(id =>
      form.append('GenreIds', id.toString())
    );

    formData.tagIds.forEach(id =>
      form.append('TagIds', id.toString())
    );

    if (book) {
      await api.books.update(book.id, form);
    } else {
      await api.books.create(form);
    }

    onSave();
    onClose();
  } catch (error) {
    console.error('Error saving book:', error);
  } finally {
    setLoading(false);
  }
};

  const toggleAuthor = (authorId: number) => {
    setFormData(prev => ({
      ...prev,
      authorIds: prev.authorIds.includes(authorId)
        ? prev.authorIds.filter(id => id !== authorId)
        : [...prev.authorIds, authorId],
    }));
  };

  const toggleGenre = (genreId: number) => {
    setFormData(prev => ({
      ...prev,
      genreIds: prev.genreIds.includes(genreId)
        ? prev.genreIds.filter(id => id !== genreId)
        : [...prev.genreIds, genreId],
    }));
  };

  const toggleTag = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-amber-200 dark:border-stone-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {book ? 'Редактировать книгу' : 'Добавить книгу'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Введите название книги"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Введите описание книги"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Файл текста *
            </label>
            <input
              type="file"
  accept=".epub,.txt"
              value={formData.textFile}
               onChange={(e) =>
    setFormData({
      ...formData,
      textFile: e.target.files?.[0]
    })  }
              required
              className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="/books/book.txt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL обложки
            </label>
            <input
                type="file"
  accept="image/*"
              value={formData.coverFile}
              onChange={(e) =>
    setFormData({
      ...formData,
      coverFile: e.target.files?.[0]
    })
  }
              className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="https://example.com/cover.jpg"
            />
            {/* 👇 ВОТ СЮДА ДОБАВЛЯЕШЬ ПРЕВЬЮ */}
  {formData.coverFile && (
    <img
      src={URL.createObjectURL(formData.coverFile)}
      className="w-32 mt-2 rounded shadow"
    />
  )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Авторы *
            </label>
            <div className="border border-amber-300 dark:border-stone-600 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {allAuthors.map(author => (
                <label key={author.id} className="flex items-center gap-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-stone-700 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.authorIds.includes(author.id)}
                    onChange={() => toggleAuthor(author.id)}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">{author.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Жанры
            </label>
            <div className="border border-amber-300 dark:border-stone-600 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {allGenres.map(genre => (
                <label key={genre.id} className="flex items-center gap-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-stone-700 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.genreIds.includes(genre.id)}
                    onChange={() => toggleGenre(genre.id)}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">{genre.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Теги
            </label>
            <div className="border border-amber-300 dark:border-stone-600 rounded-lg p-3 max-h-48 overflow-y-auto flex flex-wrap gap-2">
              {allTags.map(tag => (
                <label
                  key={tag.id}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    formData.tagIds.includes(tag.id)
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                      : 'bg-stone-100 dark:bg-stone-700 text-gray-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600 hover:bg-stone-200 dark:hover:bg-stone-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.tagIds.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                    className="hidden"
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-200 dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Сохранить
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
