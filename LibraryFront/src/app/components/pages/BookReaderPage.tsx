import React, { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';
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
  Download,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useReader } from '../../../contexts/ReaderContext';

interface BookReaderPageProps {
  bookId: number;
  onBack: () => void;
}

type ViewerType = 'txt' | 'rtf' | 'pdf' | 'epub' | 'fb2' | 'download' | 'unknown';

const textViewerTypes: ViewerType[] = ['txt', 'rtf', 'fb2'];

function getViewerType(url?: string): ViewerType {
  if (!url) return 'unknown';
  const cleanUrl = url.split('?')[0].split('#')[0];
  const ext = cleanUrl.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'txt':
      return 'txt';
    case 'rtf':
      return 'rtf';
    case 'pdf':
      return 'pdf';
    case 'epub':
      return 'epub';
    case 'fb2':
      return 'fb2';
    case 'mobi':
    case 'azw3':
      return 'download';
    default:
      return 'unknown';
  }
}

function getFormatLabel(type: ViewerType) {
  switch (type) {
    case 'pdf':
      return 'PDF';
    case 'epub':
      return 'EPUB';
    case 'fb2':
      return 'FB2';
    case 'rtf':
      return 'RTF';
    case 'txt':
      return 'TXT';
    case 'download':
      return 'Файл книги';
    default:
      return 'Неизвестный формат';
  }
}

function decodeBookText(buffer: ArrayBuffer) {
  const utf8 = new TextDecoder('utf-8').decode(buffer);
  const encodingMatch = utf8.slice(0, 300).match(/encoding=["']([^"']+)["']/i);
  const declaredEncoding = encodingMatch?.[1]?.toLowerCase();

  if (declaredEncoding?.includes('1251') || declaredEncoding?.includes('windows-1251')) {
    return new TextDecoder('windows-1251').decode(buffer);
  }

  return utf8;
}

function parseRtfToText(rtf: string) {
  return rtf
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\'[0-9a-fA-F]{2}/g, '')
    .replace(/\\[^\s{}]+ ?/g, '')
    .replace(/[{}]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseFb2ToText(xml: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const error = doc.querySelector('parsererror');
    if (error) return xml;

    const bodies = Array.from(doc.querySelectorAll('body'));
    return bodies
      .map((body) =>
        Array.from(body.querySelectorAll('section'))
          .map((section) => section.textContent?.trim() ?? '')
          .filter(Boolean)
          .join('\n\n')
      )
      .filter(Boolean)
      .join('\n\n');
  } catch {
    return xml;
  }
}

function splitTextToPages(text: string, pageSize = 3000) {
  const chunks: string[] = [];
  let current = '';

  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  for (const paragraph of paragraphs) {
    if (current.length + paragraph.length + 2 > pageSize && current.length > 0) {
      chunks.push(current.trim());
      current = '';
    }
    current += `${paragraph}\n\n`;
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [text.trim()];
}

export function BookReaderPage({ bookId, onBack }: BookReaderPageProps) {
  const { user } = useAuth();
  const { settings, updateSettings } = useReader();
  const readerTopRef = useRef<HTMLDivElement | null>(null);
  const epubContainerRef = useRef<HTMLDivElement | null>(null);
  const epubBookRef = useRef<any>(null);
  const epubRenditionRef = useRef<any>(null);

  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState('');
  const [viewerType, setViewerType] = useState<ViewerType>('unknown');
  const [textPages, setTextPages] = useState<string[]>([]);
  const [rawText, setRawText] = useState('');
  const [readerError, setReaderError] = useState('');
  const [epubTotalPages, setEpubTotalPages] = useState(0);
  const [epubReady, setEpubReady] = useState(false);

  const canNavigateText = textViewerTypes.includes(viewerType);
  const canNavigateEpub = viewerType === 'epub';
  const canNavigate = canNavigateText || canNavigateEpub;
  const totalPages = canNavigateText ? Math.max(1, textPages.length) : Math.max(1, epubTotalPages);

  useEffect(() => {
    setCurrentPage(1);
    loadBook();
    loadBookmarks();
  }, [bookId]);

  useEffect(() => {
    if (!book?.textFile) return;

    const type = getViewerType(book.textFile);
    setViewerType(type);
    setFileUrl(book.textFile);
    setReaderError('');
    setTextPages([]);
    setRawText('');
    setEpubTotalPages(0);
    setEpubReady(false);

    if (textViewerTypes.includes(type)) {
      loadTextFile(book.textFile, type);
    }
  }, [book?.textFile]);

  useEffect(() => {
    if (viewerType !== 'epub' || !fileUrl || !epubContainerRef.current) return;

    epubContainerRef.current.innerHTML = '';
    const epubBook = ePub(fileUrl);
    const rendition = epubBook.renderTo(epubContainerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'none',
      flow: 'paginated',
    });

    epubBookRef.current = epubBook;
    epubRenditionRef.current = rendition;

    rendition.on('relocated', (location: any) => {
      const page = location?.start?.location ? location.start.location + 1 : 1;
      setCurrentPage(page);
    });

    rendition.display().then(() => {
      setEpubReady(true);
      applyEpubTheme();
    }).catch(() => {
      setReaderError('Не удалось открыть EPUB-файл в читалке.');
    });

    epubBook.ready
      .then(() => epubBook.locations.generate(1000))
      .then(() => setEpubTotalPages(epubBook.locations.length() || 1))
      .catch(() => setEpubTotalPages(1));

    return () => {
      rendition.destroy();
      epubBook.destroy();
      epubBookRef.current = null;
      epubRenditionRef.current = null;
    };
  }, [viewerType, fileUrl]);

  useEffect(() => {
    applyEpubTheme();
  }, [settings.fontSize, settings.fontFamily, settings.lineHeight, settings.theme, epubReady]);

  useEffect(() => {
    if (book && user && user.role !== 'guest' && canNavigate) {
      const timer = setTimeout(() => {
        api.users.updateReadingProgress(bookId, currentPage, totalPages);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, bookId, user, book, totalPages, canNavigate]);

  useEffect(() => {
    if (canNavigateText) {
      scrollReaderToTop();
    }
  }, [currentPage, canNavigateText]);

  const scrollReaderToTop = () => {
    readerTopRef.current?.scrollIntoView({ block: 'start' });
  };

  const applyEpubTheme = () => {
    const rendition = epubRenditionRef.current;
    if (!rendition) return;

    const textColor = settings.theme === 'dark' ? '#f5f5f4' : '#1f2937';
    const backgroundColor = settings.theme === 'dark'
      ? '#1c1917'
      : settings.theme === 'sepia'
        ? '#f5f1e8'
        : '#faf8f5';

    rendition.themes.default({
      body: {
        color: `${textColor} !important`,
        background: `${backgroundColor} !important`,
        'font-family': `${settings.fontFamily} !important`,
        'font-size': `${settings.fontSize}px !important`,
        'line-height': `${settings.lineHeight} !important`,
      },
      p: {
        'line-height': `${settings.lineHeight} !important`,
      },
    });
  };

  const loadBook = async () => {
    setLoading(true);
    try {
      const data = await api.books.getById(bookId);
      setBook(data);
    } catch (error) {
      console.error('Error loading book:', error);
      setReaderError('Не удалось загрузить книгу.');
    } finally {
      setLoading(false);
    }
  };

  const loadTextFile = async (url: string, type: ViewerType) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load book file');
      }

      const content = decodeBookText(await response.arrayBuffer());
      let text = content;
      if (type === 'rtf') text = parseRtfToText(content);
      if (type === 'fb2') text = parseFb2ToText(content);

      const pages = splitTextToPages(text);
      setRawText(text);
      setTextPages(pages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading book text:', error);
      const fallbackText = 'Не удалось загрузить содержимое книги. Проверьте, что файл доступен на сервере.';
      setReaderError(fallbackText);
      setRawText(fallbackText);
      setTextPages([fallbackText]);
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
    if (!user || user.role === 'guest' || !canNavigate) return;

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
      setBookmarks(bookmarks.filter((b) => b.id !== bookmarkId));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const handleGoToBookmark = (page: number) => {
    setCurrentPage(page);
    setShowBookmarks(false);
    scrollReaderToTop();

    if (canNavigateEpub && epubBookRef.current && epubRenditionRef.current) {
      const cfi = epubBookRef.current.locations.cfiFromLocation(Math.max(0, page - 1));
      epubRenditionRef.current.display(cfi);
    }
  };

  const nextPage = () => {
    if (canNavigateEpub) {
      epubRenditionRef.current?.next();
      return;
    }

    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollReaderToTop();
    }
  };

  const prevPage = () => {
    if (canNavigateEpub) {
      epubRenditionRef.current?.prev();
      return;
    }

    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollReaderToTop();
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

  const currentBookmark = bookmarks.find((b) => b.page === currentPage);
  const pageText = textPages[currentPage - 1] || rawText;
  const isDarkReader = settings.theme === 'dark';
  const isSepiaReader = settings.theme === 'sepia';
  const chromeClass = isDarkReader
    ? 'bg-[#2b2725]/95 text-stone-100 border-stone-700'
    : isSepiaReader
      ? 'bg-[#efe3c8]/95 text-stone-900 border-amber-300'
      : 'bg-white/95 text-gray-900 border-amber-200';
  const mutedTextClass = isDarkReader ? 'text-stone-300' : 'text-gray-600';
  const iconButtonClass = isDarkReader
    ? 'text-stone-200 hover:bg-stone-700 hover:text-white'
    : 'text-gray-700 hover:bg-amber-50 hover:text-gray-950';
  const navButtonClass = isDarkReader
    ? 'bg-[#2f2a27] text-stone-100 border-stone-600 hover:bg-stone-700 disabled:text-stone-500'
    : isSepiaReader
      ? 'bg-[#f7edd7] text-stone-900 border-amber-300 hover:bg-amber-100 disabled:text-stone-400'
      : 'bg-white text-gray-900 border-amber-300 hover:bg-amber-50 disabled:text-gray-400';
  const readerSurfaceClass = isDarkReader
    ? 'bg-[#211e1c] text-[#eee8dd] border-stone-700'
    : isSepiaReader
      ? 'bg-[#f6ecd7] text-stone-900 border-amber-300'
      : 'bg-white text-gray-900 border-amber-200';

  return (
    <div className={`min-h-screen pb-24 ${themeClasses[settings.theme]}`} style={{ backgroundColor: isDarkReader ? '#1c1917' : undefined }}>
      <div className={`sticky top-0 z-50 backdrop-blur-sm border-b px-4 py-3 ${chromeClass}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <button onClick={onBack} className={`flex items-center gap-2 ${iconButtonClass}`}>
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Назад</span>
          </button>

          <div className={`min-w-0 flex-1 text-center text-sm ${mutedTextClass}`}>
            <span className="font-medium truncate inline-block max-w-full align-bottom">{book.title}</span>
            <span className="hidden sm:inline"> · {getFormatLabel(viewerType)}</span>
          </div>

          <div className="flex items-center gap-2">
            {user && user.role !== 'guest' && canNavigate && (
              <>
                <button onClick={() => setShowBookmarks(!showBookmarks)} className={`p-2 rounded-lg relative ${iconButtonClass}`} title="Закладки">
                  <BookmarkIcon className="w-5 h-5" />
                  {bookmarks.length > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center">
                      {bookmarks.length}
                    </span>
                  )}
                </button>
                <button onClick={handleAddBookmark} className={`p-2 rounded-lg ${iconButtonClass}`} title="Добавить закладку">
                  <BookmarkPlus className="w-5 h-5" />
                </button>
              </>
            )}
            <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg ${iconButtonClass}`} title="Настройки">
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
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-stone-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-2">Размер шрифта: {settings.fontSize}px</label>
                <input type="range" min="14" max="28" step="2" value={settings.fontSize} onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })} className="w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-2">Межстрочный интервал: {settings.lineHeight}</label>
                <input type="range" min="1.4" max="2.2" step="0.2" value={settings.lineHeight} onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })} className="w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-3">Шрифт</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Georgia, serif', 'Arial, sans-serif', 'Courier New, monospace'].map((font) => (
                    <button
                      key={font}
                      onClick={() => updateSettings({ fontFamily: font })}
                      className={`px-3 py-2 border rounded-lg text-sm ${settings.fontFamily === font ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-gray-300 hover:bg-gray-50 dark:border-stone-600 dark:hover:bg-stone-700'}`}
                      style={{ fontFamily: font }}
                    >
                      {font.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-3">Тема</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => updateSettings({ theme: 'light' })} className={`px-3 py-2 border rounded-lg text-sm flex items-center justify-center gap-2 ${settings.theme === 'light' ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-gray-300 hover:bg-gray-50 dark:border-stone-600 dark:hover:bg-stone-700'}`}>
                    <Sun className="w-4 h-4" />
                    Светлая
                  </button>
                  <button onClick={() => updateSettings({ theme: 'dark' })} className={`px-3 py-2 border rounded-lg text-sm flex items-center justify-center gap-2 ${settings.theme === 'dark' ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-gray-300 hover:bg-gray-50 dark:border-stone-600 dark:hover:bg-stone-700'}`}>
                    <Moon className="w-4 h-4" />
                    Темная
                  </button>
                  <button onClick={() => updateSettings({ theme: 'sepia' })} className={`px-3 py-2 border rounded-lg text-sm flex items-center justify-center gap-2 ${settings.theme === 'sepia' ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-gray-300 hover:bg-gray-50 dark:border-stone-600 dark:hover:bg-stone-700'}`}>
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
              <button onClick={() => setShowBookmarks(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-stone-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {bookmarks.length === 0 ? (
                <p className="text-gray-600 dark:text-stone-400 text-center py-8">У вас пока нет закладок</p>
              ) : (
                bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="p-3 border border-amber-200 dark:border-stone-700 rounded-lg hover:bg-amber-50/50 dark:hover:bg-stone-700/50">
                    <div className="flex items-start justify-between">
                      <button onClick={() => handleGoToBookmark(bookmark.page)} className="flex-1 text-left">
                        <p className="font-medium text-gray-900 dark:text-stone-100">Страница {bookmark.page}</p>
                        {bookmark.note && <p className="text-sm text-gray-600 dark:text-stone-400 mt-1">{bookmark.note}</p>}
                      </button>
                      <button onClick={() => handleDeleteBookmark(bookmark.id)} className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded">
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

      <div ref={readerTopRef} className="max-w-5xl mx-auto px-4 py-8 scroll-mt-20">
        {currentBookmark && canNavigate && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="flex items-start gap-2">
              <BookmarkIcon className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Закладка</p>
                {currentBookmark.note && <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">{currentBookmark.note}</p>}
              </div>
            </div>
          </div>
        )}

        {readerError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200">
            {readerError}
          </div>
        )}

        {viewerType === 'pdf' ? (
          <div className={`min-h-[80vh] border rounded-lg overflow-hidden ${readerSurfaceClass}`}>
            <iframe src={fileUrl} title={book.title} className="w-full min-h-[80vh]" />
          </div>
        ) : viewerType === 'epub' ? (
          <div className={`h-[78vh] border rounded-lg overflow-hidden ${readerSurfaceClass}`}>
            {!epubReady && !readerError && (
              <div className="h-full flex items-center justify-center">
                <Loader className="w-8 h-8 text-amber-600 animate-spin" />
              </div>
            )}
            <div ref={epubContainerRef} className={`w-full h-full ${epubReady ? 'block' : 'hidden'}`} />
          </div>
        ) : viewerType === 'download' || viewerType === 'unknown' ? (
          <div className={`p-6 rounded-lg border ${readerSurfaceClass}`}>
            <p>Этот формат нельзя корректно показать во встроенной браузерной читалке. Файл можно открыть в отдельной программе для чтения.</p>
            <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
              <Download className="w-5 h-5" />
              Скачать книгу
            </a>
          </div>
        ) : (
          <div
            className={`whitespace-pre-wrap rounded-lg p-6 border ${readerSurfaceClass}`}
            style={{
              fontSize: `${settings.fontSize}px`,
              fontFamily: settings.fontFamily,
              lineHeight: settings.lineHeight,
            }}
          >
            {pageText}
          </div>
        )}
      </div>

      {canNavigate && (
        <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-sm border-t px-4 py-4 ${chromeClass}`}>
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button onClick={prevPage} disabled={!canNavigateEpub && currentPage === 1} className={`flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${navButtonClass}`}>
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Назад</span>
            </button>

            <div className={`text-sm ${mutedTextClass}`}>
              <span className="font-medium">{currentPage}</span> / {epubTotalPages > 0 || canNavigateText ? totalPages : '...'}
            </div>

            <button onClick={nextPage} disabled={!canNavigateEpub && currentPage === totalPages} className={`flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${navButtonClass}`}>
              <span className="hidden sm:inline">Вперед</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
