import React, { useState, useEffect } from 'react';
import { Book, Bookmark } from '../../../types';
import { api } from '../../../services/api';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookmarkPlus,
  Bookmark as BookmarkIcon,
  Settings,
  Sun,
  Moon,
  Type,
  X,
  Loader,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useReader } from '../../../contexts/ReaderContext';

interface BookReaderPageProps {
  bookId: number;
  onBack: () => void;
}

const samplePages = [
  'Глава 1\n\nВ начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел из своей каморки, которую нанимал от жильцов в С — м переулке, на улицу и медленно, как бы в нерешимости, отправился к К — ну мосту.',
  'Он благополучно избегнул встречи с своею хозяйкой на лестнице. Каморка его приходилась под самою кровлей высокого пятиэтажного дома и походила более на шкаф, чем на квартиру.',
  'Квартирной же хозяйке его, у которой он нанимал эту каморку с обедом и прислугой, помещавшейся одною лестницей ниже, он должен был кругом денег и потому боялся с нею встречаться.',
  'Не то чтоб он был так труслив и забит, совсем даже напротив; но с некоторого времени он был в раздражительном и напряженном состоянии, похожем на ипохондрию.',
  'Он до того углубился в себя и уединился от всех, что боялся даже всякой встречи, не только встречи с хозяйкой. Он был задавлен бедностью; но даже стесненное положение перестало в последнее время тяготить его.',
];

export function BookReaderPage({ bookId, onBack }: BookReaderPageProps) {
  const { user } = useAuth();
  const { settings, updateSettings } = useReader();
  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [loading, setLoading] = useState(true);

  const totalPages = samplePages.length;

  useEffect(() => {
    loadBook();
    loadBookmarks();
  }, [bookId]);

  useEffect(() => {
    if (book && user && user.role !== 'guest') {
      const timer = setTimeout(() => {
        api.users.updateReadingProgress(bookId, currentPage, totalPages);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, bookId, user]);

  const loadBook = async () => {
    setLoading(true);
    try {
      const data = await api.books.getById(bookId);
      setBook(data);
    } catch (error) {
      console.error('Error loading book:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    if (!user || user.role === 'guest') return;

    try {
      const data = await api.bookmarks.getByBookId(bookId);
      setBookmarks(data);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const handleAddBookmark = async () => {
    if (!user || user.role === 'guest') return;

    const note = prompt('Добавить заметку к закладке (необязательно):');
    if (note === null) return;

    try {
      const bookmark = await api.bookmarks.create(bookId, currentPage, note || undefined);
      setBookmarks([...bookmarks, bookmark]);
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: number) => {
    if (!user || user.role === 'guest') return;

    try {
      await api.bookmarks.delete(bookId, bookmarkId);
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const handleGoToBookmark = (page: number) => {
    setCurrentPage(page);
    setShowBookmarks(false);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading || !book) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  const themeClasses = {
    light: 'bg-[#faf8f5] text-gray-900',
    dark: 'bg-[#1c1917] text-stone-100',
    sepia: 'bg-[#f5f1e8] text-stone-900',
  };

  const currentBookmark = bookmarks.find(b => b.page === currentPage);

  return (
    <div className={`min-h-screen ${themeClasses[settings.theme]}`}>
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-amber-200 dark:border-stone-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Назад</span>
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{book.title}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Страница {currentPage} из {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {user && user.role !== 'guest' && (
              <>
                <button
                  onClick={() => setShowBookmarks(!showBookmarks)}
                  className="p-2 hover:bg-gray-100 rounded-lg relative"
                  title="Закладки"
                >
                  <BookmarkIcon className="w-5 h-5" />
                  {bookmarks.length > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center">
                      {bookmarks.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleAddBookmark}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Добавить закладку"
                >
                  <BookmarkPlus className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Настройки"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Настройки чтения</h2>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Размер шрифта: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min="14"
                  max="24"
                  step="2"
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Межстрочный интервал: {settings.lineHeight}
                </label>
                <input
                  type="range"
                  min="1.4"
                  max="2"
                  step="0.2"
                  value={settings.lineHeight}
                  onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Шрифт</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Georgia, serif', 'Arial, sans-serif', 'Courier New, monospace'].map((font) => (
                    <button
                      key={font}
                      onClick={() => updateSettings({ fontFamily: font })}
                      className={`px-3 py-2 border rounded-lg text-sm ${
                        settings.fontFamily === font
                          ? 'border-amber-600 bg-amber-50 text-amber-900'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Тема</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`px-3 py-2 border rounded-lg text-sm flex items-center justify-center gap-2 ${
                      settings.theme === 'light'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Светлая
                  </button>
                  <button
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`px-3 py-2 border rounded-lg text-sm flex items-center justify-center gap-2 ${
                      settings.theme === 'dark'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Темная
                  </button>
                  <button
                    onClick={() => updateSettings({ theme: 'sepia' })}
                    className={`px-3 py-2 border rounded-lg text-sm flex items-center justify-center gap-2 ${
                      settings.theme === 'sepia'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    Сепия
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBookmarks && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Закладки</h2>
              <button onClick={() => setShowBookmarks(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {bookmarks.length === 0 ? (
                <p className="text-gray-600 text-center py-8">У вас пока нет закладок</p>
              ) : (
                bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="p-3 border border-amber-200 dark:border-stone-700 rounded-lg hover:bg-amber-50/50 dark:hover:bg-stone-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => handleGoToBookmark(bookmark.page)}
                        className="flex-1 text-left"
                      >
                        <p className="font-medium text-gray-900">Страница {bookmark.page}</p>
                        {bookmark.note && (
                          <p className="text-sm text-gray-600 mt-1">{bookmark.note}</p>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentBookmark && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="flex items-start gap-2">
              <BookmarkIcon className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Закладка</p>
                {currentBookmark.note && (
                  <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">{currentBookmark.note}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          className="prose max-w-none"
          style={{
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontFamily,
            lineHeight: settings.lineHeight,
          }}
        >
          <div className="whitespace-pre-wrap">{samplePages[currentPage - 1]}</div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-amber-200 dark:border-stone-700 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-amber-300 dark:border-stone-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 dark:hover:bg-stone-700"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Назад</span>
          </button>

          <div className="text-sm text-gray-600">
            <span className="font-medium">{currentPage}</span> / {totalPages}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-amber-300 dark:border-stone-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 dark:hover:bg-stone-700"
          >
            <span className="hidden sm:inline">Вперёд</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
