import React, { useState, useEffect } from 'react';
import { Book, Author, Genre, Tag, CreateBookDto } from '../../types';
import { api } from '../../services/api';
import { X, Loader, Save, Plus } from 'lucide-react';
import { EntityPickerModal } from './EntityPickerModal';
import { API_BASE } from '../../config';

interface BookEditModalProps {
  book?: Book;
  onClose: () => void;
  onSave: () => void;
}

export function BookEditModal({ book, onClose, onSave }: BookEditModalProps) {
  const [formData, setFormData] = useState<CreateBookDto>({
    title: book?.title || '',
    description: book?.description || '',
    authorIds: book?.authors.map(a => a.id) || [],
    genreIds: book?.genres.map(g => g.id) || [],
    tagIds: book?.tags.map(t => t.id) || [],
    textFile: undefined,
    coverFile: undefined,
  });
  
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>(book?.authors || []);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>(book?.genres || []);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(book?.tags || []);

  const [pickerConfig, setPickerConfig] = useState<{
    type: 'authors' | 'genres' | 'tags';
    title: string;
    selectedIds: number[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getCoverPreview = () => {
    if (formData.coverFile instanceof File) {
      return URL.createObjectURL(formData.coverFile);
    }
    if (book?.coverFile) {
      return book.coverFile.startsWith('http') 
        ? book.coverFile 
        : `${API_BASE}${book.coverFile.startsWith('/') ? '' : '/'}${book.coverFile}`;
    }
    return null;
  };

  const coverPreview = getCoverPreview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.authorIds.length === 0) {
      setError('Выберите хотя бы одного автора');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('Title', formData.title);
      data.append('Description', formData.description || '');
      
      formData.authorIds.forEach(id => data.append('AuthorIds', id.toString()));
      formData.genreIds.forEach(id => data.append('GenreIds', id.toString()));
      formData.tagIds.forEach(id => data.append('TagIds', id.toString()));

      if (formData.textFile instanceof File) {
        data.append('TextFile', formData.textFile);
      }
      if (formData.coverFile instanceof File) {
        data.append('CoverFile', formData.coverFile);
      }

      if (book) {
        await api.books.update(book.id, data);
      } else {
        await api.books.create(data);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const handlePickerSave = async (ids: number[]) => {
    if (!pickerConfig) return;

    setLoading(true);
    try {
      if (pickerConfig.type === 'authors') {
        setFormData({ ...formData, authorIds: ids });
        const items = await Promise.all(ids.map(id => api.authors.getById(id)));
        setSelectedAuthors(items);
      } else if (pickerConfig.type === 'genres') {
        setFormData({ ...formData, genreIds: ids });
        const items = await Promise.all(ids.map(id => api.genres.getById(id)));
        setSelectedGenres(items);
      } else {
        setFormData({ ...formData, tagIds: ids });
        const items = await Promise.all(ids.map(id => api.tags.getById(id)));
        setSelectedTags(items);
      }
    } catch (err) {
      console.error('Error updating selection names:', err);
    } finally {
      setLoading(false);
      setPickerConfig(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-amber-200 dark:border-stone-700">
        <div className="sticky top-0 bg-card border-b border-amber-200 dark:border-stone-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-stone-100">
            {book ? 'Редактировать книгу' : 'Добавить новую книгу'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-lg text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-stone-300 mb-2 uppercase tracking-wider">
                  Название произведения *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
                  placeholder="Например: Война и мир"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-stone-300 mb-2 uppercase tracking-wider">
                  Описание / Аннотация
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 border border-amber-300 dark:border-stone-600 bg-card text-gray-900 dark:text-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow resize-none"
                  placeholder="Краткое содержание или описание книги..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-amber-50/50 dark:bg-stone-900/30 rounded-2xl border border-amber-100 dark:border-stone-800">
                <label className="block text-sm font-bold text-gray-800 dark:text-stone-200 mb-4 uppercase tracking-wider">
                  Файлы издания
                </label>
                
                <div className="space-y-6">
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-stone-400 mb-2">Текстовый файл (epub, fb2, txt...)*</span>
                    <input
                      type="file"
                      accept=".epub,application/epub+zip,.fb2,application/x-fictionbook+xml,.txt,text/plain,.rtf,application/rtf,.pdf,application/pdf,.mobi,application/x-mobipocket-ebook,.azw3,application/vnd.amazon.ebook"
                      onChange={(e) => setFormData({ ...formData, textFile: e.target.files?.[0] })}
                      required={!book}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-stone-400 mb-2">Обложка книги</span>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFormData({ ...formData, coverFile: e.target.files?.[0] })}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-stone-800 file:text-white hover:file:bg-black cursor-pointer"
                        />
                      </div>
                      {coverPreview && (
                        <div className="w-20 h-28 bg-gray-200 rounded-lg overflow-hidden shadow-md flex-shrink-0 border border-white dark:border-stone-700">
                          <img
                            src={coverPreview}
                            className="w-full h-full object-cover"
                            alt="Preview"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-amber-100 dark:border-stone-800">
             <h3 className="text-sm font-bold text-gray-700 dark:text-stone-300 uppercase tracking-wider">Связи и категории</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-stone-300">Авторы*</span>
                    <button
                      type="button"
                      onClick={() => setPickerConfig({ type: 'authors', title: 'Выбор авторов', selectedIds: formData.authorIds })}
                      className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Выбрать
                    </button>
                  </div>
                  <div className="min-h-[80px] p-3 bg-gray-50 dark:bg-stone-900/50 rounded-xl border border-amber-100 dark:border-stone-800 flex flex-wrap gap-2 items-start">
                    {selectedAuthors.map(a => (
                      <span key={a.id} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                        {a.name}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => {
                          const newIds = formData.authorIds.filter(id => id !== a.id);
                          setFormData({ ...formData, authorIds: newIds });
                          setSelectedAuthors(selectedAuthors.filter(item => item.id !== a.id));
                        }} />
                      </span>
                    ))}
                    {selectedAuthors.length === 0 && <span className="text-[10px] text-gray-400 italic">Не выбрано</span>}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-stone-300">Жанры</span>
                    <button
                      type="button"
                      onClick={() => setPickerConfig({ type: 'genres', title: 'Выбор жанров', selectedIds: formData.genreIds })}
                      className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Выбрать
                    </button>
                  </div>
                  <div className="min-h-[80px] p-3 bg-gray-50 dark:bg-stone-900/50 rounded-xl border border-amber-100 dark:border-stone-800 flex flex-wrap gap-2 items-start">
                    {selectedGenres.map(g => (
                      <span key={g.id} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                        {g.name}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => {
                          const newIds = formData.genreIds.filter(id => id !== g.id);
                          setFormData({ ...formData, genreIds: newIds });
                          setSelectedGenres(selectedGenres.filter(item => item.id !== g.id));
                        }} />
                      </span>
                    ))}
                    {selectedGenres.length === 0 && <span className="text-[10px] text-gray-400 italic">Не выбрано</span>}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-stone-300">Теги</span>
                    <button
                      type="button"
                      onClick={() => setPickerConfig({ type: 'tags', title: 'Выбор тегов', selectedIds: formData.tagIds })}
                      className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Выбрать
                    </button>
                  </div>
                  <div className="min-h-[80px] p-3 bg-gray-50 dark:bg-stone-900/50 rounded-xl border border-amber-100 dark:border-stone-800 flex flex-wrap gap-2 items-start">
                    {selectedTags.map(t => (
                      <span key={t.id} className="px-2 py-1 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                        {t.name}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => {
                          const newIds = formData.tagIds.filter(id => id !== t.id);
                          setFormData({ ...formData, tagIds: newIds });
                          setSelectedTags(selectedTags.filter(item => item.id !== t.id));
                        }} />
                      </span>
                    ))}
                    {selectedTags.length === 0 && <span className="text-[10px] text-gray-400 italic">Не выбрано</span>}
                  </div>
                </div>
             </div>
          </div>

          <div className="p-6 bg-card border-t border-amber-200 dark:border-stone-700 flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 dark:border-stone-600 text-gray-700 dark:text-stone-300 rounded-xl hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors font-semibold"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold shadow-lg shadow-amber-600/20 active:scale-95"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Сохранить изменения
            </button>
          </div>
        </form>
      </div>

      {pickerConfig && (
        <EntityPickerModal
          title={pickerConfig.title}
          type={pickerConfig.type}
          selectedIds={pickerConfig.selectedIds}
          onClose={() => setPickerConfig(null)}
          onSave={handlePickerSave}
        />
      )}
    </div>
  );
}
