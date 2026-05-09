import React, { useState, useEffect } from 'react';
import { X, Search, Loader, Check } from 'lucide-react';
import { api } from '../../services/api';

interface Entity {
  id: number;
  name: string;
}

interface EntityPickerModalProps {
  title: string;
  type: 'authors' | 'genres' | 'tags';
  selectedIds: number[];
  onClose: () => void;
  onSave: (ids: number[]) => void;
}

export function EntityPickerModal({ title, type, selectedIds: initialSelectedIds, onClose, onSave }: EntityPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<Entity[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setPageHasMore] = useState(false);

  useEffect(() => {
    loadItems(1, true);
  }, [searchTerm]);

  const loadItems = async (pageNum: number, isNewSearch = false) => {
    setLoading(true);
    try {
      let response;
      const params = { searchTerm, page: pageNum, pageSize: 20 };
      
      if (type === 'authors') response = await api.authors.getAll(params);
      else if (type === 'genres') response = await api.genres.getAll(params);
      else response = await api.tags.getAll(params);

      const newItems = response.items.map((item: any) => ({
        id: item.id,
        name: item.name
      }));

      if (isNewSearch) {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
      
      setPageHasMore(newItems.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[80vh] border border-amber-200 dark:border-stone-700">
        <div className="px-6 py-4 border-b border-amber-100 dark:border-stone-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-stone-100">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-stone-800 rounded-lg text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-amber-50 dark:border-stone-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-stone-100"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => toggleSelection(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                selectedIds.includes(item.id)
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                  : 'hover:bg-gray-50 dark:hover:bg-stone-800 text-gray-700 dark:text-stone-300'
              }`}
            >
              <span className="font-medium">{item.name}</span>
              {selectedIds.includes(item.id) && <Check className="w-4 h-4" />}
            </button>
          ))}
          
          {loading && (
            <div className="flex justify-center py-4">
              <Loader className="w-6 h-6 text-amber-600 animate-spin" />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-stone-400">
              Ничего не найдено
            </div>
          )}

          {hasMore && !loading && (
            <button
              onClick={() => loadItems(page + 1)}
              className="w-full py-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              Загрузить еще
            </button>
          )}
        </div>

        <div className="p-4 border-t border-amber-100 dark:border-stone-800 flex justify-between items-center bg-gray-50 dark:bg-stone-900/50 rounded-b-xl">
          <span className="text-sm text-gray-500 dark:text-stone-400">
            Выбрано: {selectedIds.length}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-stone-300 hover:bg-gray-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={() => onSave(selectedIds)}
              className="px-6 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
