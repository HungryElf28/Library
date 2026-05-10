import React, { useState, useEffect } from 'react';
import { Book, Author, Genre, Tag, User } from '../../../types';
import { api } from '../../../services/api';
import { API_BASE } from '../../../config';
import { Plus, Edit, Trash2, Loader, Save, X, Search, ChevronLeft, ChevronRight, User as UserIcon, Shield, ShieldCheck } from 'lucide-react';
import { BookEditModal } from '../BookEditModal';
import { AuthorEditModal } from '../AuthorEditModal';
import { GenreEditModal } from '../GenreEditModal';
import { TagEditModal } from '../TagEditModal';

type TabType = 'books' | 'authors' | 'genres' | 'tags' | 'users';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('books');
  const [loading, setLoading] = useState(true);
  
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddAuthorModal, setShowAddAuthorModal] = useState(false);
  const [showAddGenreModal, setShowAddGenreModal] = useState(false);
  const [showAddTagModal, setShowAddTagModal] = useState(false);

  useEffect(() => {
    setPage(1); // Reset page on tab or search change
    loadData(1);
  }, [activeTab, searchTerm]);

  const loadData = async (pageNum: number) => {
    setLoading(true);
    try {
      const params = { searchTerm, page: pageNum, pageSize };
      
      if (activeTab === 'books') {
        const data = await api.books.getAll(params);
        const fullBooks = await Promise.all(
            data.items.map(item => api.books.getById(item.id))
        );
        setBooks(fullBooks);
        setTotalCount(data.total);
      } else if (activeTab === 'authors') {
        const data = await api.authors.getAll(params);
        setAuthors(data.items);
        setTotalCount(data.total);
      } else if (activeTab === 'genres') {
        const data = await api.genres.getAll(params);
        setGenres(data.items);
        setTotalCount(data.total);
      } else if (activeTab === 'tags') {
        const data = await api.tags.getAll(params);
        setTags(data.items);
        setTotalCount(data.total);
      } else if (activeTab === 'users') {
        const data = await api.users.getAllUsers(params);
        setUsers(data.items);
        setTotalCount(data.total);
      }
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleDelete = async (id: number, type: TabType) => {
    if (!confirm(`Вы уверены, что хотите удалить этот объект?`)) return;

    try {
      if (type === 'books') await api.books.delete(id);
      else if (type === 'authors') await api.authors.delete(id);
      else if (type === 'genres') await api.genres.delete(id);
      else if (type === 'tags') await api.tags.delete(id);
      else if (type === 'users') await api.users.deleteUser(id);
      
      loadData(page);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Ошибка при удалении');
    }
  };

  const handleRoleChange = async (userId: number, currentRole: string) => {

    const newRole = currentRole.toLowerCase() === 'admin' ? 'User' : 'Admin';
    if (!confirm(`Изменить роль пользователя на ${newRole}?`)) return;

    try {
      await api.users.changeRole(userId, newRole);
      loadData(page);
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Ошибка при изменении роли');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-stone-100">Панель управления</h1>
          <p className="text-gray-500 dark:text-stone-400 mt-1">Управляйте библиотекой, авторами и пользователями</p>
        </div>
        
        <div className="flex gap-2">
            {activeTab === 'books' && (
                <button onClick={() => setShowAddBookModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 font-bold active:scale-95">
                    <Plus className="w-5 h-5" /> Добавить книгу
                </button>
            )}
            {activeTab === 'authors' && (
                <button onClick={() => setShowAddAuthorModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 font-bold active:scale-95">
                    <Plus className="w-5 h-5" /> Добавить автора
                </button>
            )}
            {activeTab === 'genres' && (
                <button onClick={() => setShowAddGenreModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 font-bold active:scale-95">
                    <Plus className="w-5 h-5" /> Добавить жанр
                </button>
            )}
            {activeTab === 'tags' && (
                <button onClick={() => setShowAddTagModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 font-bold active:scale-95">
                    <Plus className="w-5 h-5" /> Добавить тег
                </button>
            )}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-xl border border-amber-200 dark:border-stone-700 overflow-hidden">
        {/* Tabs */}
        <div className="bg-amber-50/50 dark:bg-stone-900/50 border-b border-amber-200 dark:border-stone-700">
          <div className="flex overflow-x-auto no-scrollbar">
            {(['books', 'authors', 'genres', 'tags', 'users'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all relative ${
                  activeTab === tab
                    ? 'text-amber-600 dark:text-amber-500'
                    : 'text-gray-500 dark:text-stone-500 hover:text-gray-800 dark:hover:text-stone-300'
                }`}
              >
                {tab === 'books' && 'Книги'}
                {tab === 'authors' && 'Авторы'}
                {tab === 'genres' && 'Жанры'}
                {tab === 'tags' && 'Теги'}
                {tab === 'users' && 'Пользователи'}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-600 dark:bg-amber-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-amber-100 dark:border-stone-800">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Поиск по ${activeTab === 'books' ? 'названию или автору' : activeTab === 'users' ? 'логину или email' : 'имени'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-stone-900 border border-amber-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-stone-100 transition-shadow"
            />
          </div>
        </div>

        <div className="p-6 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader className="w-10 h-10 text-amber-600 animate-spin" />
              <p className="text-gray-500 animate-pulse">Загрузка данных...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeTab === 'books' && books.map(book => {
                  const coverUrl = book.coverFile 
                    ? (book.coverFile.startsWith('http') ? book.coverFile : `${API_BASE}${book.coverFile.startsWith('/') ? '' : '/'}${book.coverFile}`)
                    : '/placeholder-book.png';
                    
                  return (
                    <div key={book.id} className="group bg-gray-50 dark:bg-stone-900/40 rounded-2xl border border-amber-100 dark:border-stone-800 p-4 hover:shadow-lg transition-all">
                      <div className="flex gap-4">
                        <div className="w-20 h-28 flex-shrink-0 bg-amber-100 rounded-lg overflow-hidden shadow-sm">
                          <img src={coverUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-stone-100 truncate">{book.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-stone-400 mt-1 truncate">
                            {book.authors.map(a => a.name).join(', ')}
                          </p>
                          <div className="flex gap-2 mt-4">
                            <button onClick={() => setEditingBook(book)} className="p-2 bg-white dark:bg-stone-800 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-200 dark:border-stone-700">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(book.id, 'books')} className="p-2 bg-white dark:bg-stone-800 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-200 dark:border-stone-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {activeTab === 'authors' && authors.map(author => {
                  const photoUrl = author.photo 
                    ? (author.photo.startsWith('http') ? author.photo : `${API_BASE}${author.photo.startsWith('/') ? '' : '/'}${author.photo}`)
                    : `https://ui-avatars.com/api/?name=${author.name}`;

                  return (
                    <div key={author.id} className="bg-gray-50 dark:bg-stone-900/40 rounded-2xl border border-amber-100 dark:border-stone-800 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-amber-100 overflow-hidden border-2 border-white shadow-sm">
                              <img src={photoUrl} className="w-full h-full object-cover" alt="" />
                          </div>
                          <span className="font-bold text-gray-900 dark:text-stone-100 truncate">{author.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingAuthor(author)} className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(author.id, 'authors')} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {(activeTab === 'genres' || activeTab === 'tags') && (activeTab === 'genres' ? genres : tags).map(item => (
                  <div key={item.id} className="bg-gray-50 dark:bg-stone-900/40 rounded-2xl border border-amber-100 dark:border-stone-800 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                    <span className="font-bold text-gray-900 dark:text-stone-100 truncate text-sm px-2">{item.name}</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => activeTab === 'genres' ? setEditingGenre(item as Genre) : setEditingTag(item as Tag)} 
                        className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, activeTab)} 
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {activeTab === 'users' && users.map(user => (
                  <div key={user.id} className="bg-gray-50 dark:bg-stone-900/40 rounded-2xl border border-amber-100 dark:border-stone-800 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 border-2 border-white shadow-sm">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-stone-100 truncate">{user.login}</span>
                          {user.role?.toLowerCase() === 'admin' && <ShieldCheck className="w-4 h-4 text-amber-600" title="Администратор" />}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-stone-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRoleChange(user.id, user.role || 'User')} 
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                          user.role?.toLowerCase() === 'admin' 
                            ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-stone-800 dark:text-stone-300'
                        }`}
                        title={user.role?.toLowerCase() === 'admin' ? 'Разжаловать до пользователя' : 'Сделать администратором'}
                      >
                        {user.role?.toLowerCase() === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        {user.role?.toLowerCase() === 'admin' ? 'Админ' : 'Сделать админом'}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id, 'users')} 
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalCount === 0 && !loading && (
                <div className="text-center py-20">
                  <div className="inline-flex p-6 bg-gray-100 dark:bg-stone-900 rounded-full mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-stone-100">Ничего не найдено</h3>
                  <p className="text-gray-500 mt-2">Попробуйте изменить параметры поиска</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => loadData(page - 1)}
                    className="p-2 bg-white dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex gap-1 px-4">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (page <= 3) pageNum = i + 1;
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = page - 2 + i;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => loadData(pageNum)}
                          className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                            page === pageNum
                              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-110'
                              : 'bg-white dark:bg-stone-800 border border-amber-100 dark:border-stone-700 text-gray-600 dark:text-stone-400 hover:border-amber-400'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => loadData(page + 1)}
                    className="p-2 bg-white dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingBook && (
        <BookEditModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSave={() => loadData(page)}
        />
      )}

      {showAddBookModal && (
        <BookEditModal
          onClose={() => setShowAddBookModal(false)}
          onSave={() => loadData(1)}
        />
      )}

      {editingAuthor && (
        <AuthorEditModal
          author={editingAuthor}
          onClose={() => setEditingAuthor(null)}
          onSave={() => loadData(page)}
        />
      )}

      {showAddAuthorModal && (
        <AuthorEditModal
          onClose={() => setShowAddAuthorModal(false)}
          onSave={() => loadData(1)}
        />
      )}

      {editingGenre && (
        <GenreEditModal
          genre={editingGenre}
          onClose={() => setEditingGenre(null)}
          onSave={() => loadData(page)}
        />
      )}

      {showAddGenreModal && (
        <GenreEditModal
          onClose={() => setShowAddGenreModal(false)}
          onSave={() => loadData(1)}
        />
      )}

      {editingTag && (
        <TagEditModal
          tag={editingTag}
          onClose={() => setEditingTag(null)}
          onSave={() => loadData(page)}
        />
      )}

      {showAddTagModal && (
        <TagEditModal
          onClose={() => setShowAddTagModal(false)}
          onSave={() => loadData(1)}
        />
      )}
    </div>
  );
}
