import React, { useState, useEffect } from 'react';
import { Book, Review, CreateReviewDto, Collection } from '../../../types';
import { api } from '../../../services/api';
import { Star, Heart, BookOpen, Loader, ArrowLeft, Edit, ListPlus, X, Trash2, User, Filter } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { BookEditModal } from '../BookEditModal';
import { API_BASE } from '../../../config';
import { calculateAge } from '../../utils';

interface BookDetailsPageProps {
  bookId: number;
  onStartReading: (bookId: number) => void;
  onAuthorClick?: (authorId: number) => void;
  onGenreClick?: (genreId: number) => void;
  onTagClick?: (tagId: number) => void;
  onBack: () => void;
  onNavigateToLogin?: () => void;
}

export function BookDetailsPage({ 
  bookId, 
  onStartReading, 
  onAuthorClick,
  onGenreClick,
  onTagClick,
  onBack, 
  onNavigateToLogin 
}: BookDetailsPageProps) {
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<CreateReviewDto>({ rate: 5, text: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  useEffect(() => {
    loadBook();
    loadReviews();
    checkFavorite();
  }, [bookId]);

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

  const coverUrl = book?.coverFile 
    ? (book.coverFile.startsWith('http') ? book.coverFile : `${API_BASE}${book.coverFile.startsWith('/') ? '' : '/'}${book.coverFile}`)
    : null;

  const loadReviews = async () => {
    try {
      const data = await api.reviews.getByBookId(bookId);
      setReviews(data.items);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const checkFavorite = async () => {
    if (!user || user.role === 'guest') return;

    try {
      const favorites = await api.users.getFavorites();
      setIsFavorite(favorites.items.some(b => b.id === bookId));
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user || user.role === 'guest') return;

    try {
      if (isFavorite) {
        await api.users.removeFromFavorites(bookId);
        setIsFavorite(false);
      } else {
        await api.users.addToFavorites(bookId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const existingUserReview = reviews.find(r => r.userId === user?.id);

  const handleEditReview = () => {
    if (existingUserReview) {
      setUserReview({ rate: existingUserReview.rate, text: existingUserReview.text || '' });
      setShowReviewForm(true);
      setTimeout(() => {
          const form = document.getElementById('review-form');
          form?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role === 'guest') return;

    try {
      await api.reviews.create(bookId, userReview);
      setShowReviewForm(false);
      await loadReviews();
      await loadBook();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Ошибка при сохранении отзыва');
    }
  };

  const handleReviewDelete = async (reviewId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;

    try {
      await api.reviews.delete(reviewId);
      await loadReviews();
      await loadBook();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Ошибка при удалении отзыва');
    }
  };

  const loadCollections = async () => {
    if (!user || user.role === 'guest') return;

    try {
      const data = await api.collections.getAll();
      setCollections(data.items);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const handleAddToCollection = async (collectionId: number) => {
    if (!user || user.role === 'guest') return;

    try {
      await api.collections.addBook(collectionId, bookId);
      alert('Книга добавлена в подборку');
      setShowCollectionsModal(false);
    } catch (error) {
      console.error('Error adding to collection:', error);
      alert('Ошибка при добавлении книги в подборку');
    }
  };

  const handleStartReading = () => {
    if (!user || user.role === 'guest') {
      if (confirm('Для чтения книг необходимо войти в аккаунт. Перейти на страницу входа?')) {
        if (onNavigateToLogin) {
          onNavigateToLogin();
        }
      }
      return;
    }

    if (!user.isSubscribed) {
      if (confirm('Для чтения книг необходима активная подписка. Перейти к оформлению?')) {
        onBack();
        alert('Пожалуйста, оформите подписку в профиле (Настройки), чтобы читать книги.');
      }
      return;
    }

    if (book.ageRestriction && book.ageRestriction > 0) {
      const userAge = calculateAge(user.birthDate);
      if (userAge < book.ageRestriction) {
        alert(`Эта книга имеет возрастное ограничение ${book.ageRestriction}+. Ваш возраст: ${userAge}.`);
        return;
      }
    }

    onStartReading(bookId);
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-stone-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading || !book) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  const filteredReviews = ratingFilter 
    ? reviews.filter(r => r.rate === ratingFilter)
    : reviews;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад к каталогу
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Редактировать
          </button>
        )}
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-amber-200 dark:border-stone-700 overflow-hidden">
        <div className="grid md:grid-cols-3 gap-8 p-6 md:p-8 items-start">
          <div className="md:col-span-1">
            <div className="sticky top-20">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={book.title}
                  className="w-full rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gradient-to-br from-amber-50 to-orange-100 dark:from-stone-700 dark:to-stone-600 rounded-lg flex items-center justify-center">
                  <span className="text-6xl font-bold text-amber-300 dark:text-amber-400">{book.title[0]}</span>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleStartReading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20 active:scale-95"
                >
                  <BookOpen className="w-5 h-5" />
                  {(!user || user.role === 'guest') ? 'Войти и читать' : 'Читать'}
                </button>

                {user && user.role !== 'guest' && (
                  <>
                    <button
                      onClick={handleFavoriteToggle}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                        isFavorite
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                          : 'bg-stone-100 dark:bg-stone-700 text-gray-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                      {isFavorite ? 'В избранном' : 'В избранное'}
                    </button>
                    <button
                      onClick={() => {
                        loadCollections();
                        setShowCollectionsModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 dark:bg-stone-700 text-gray-700 dark:text-stone-300 rounded-lg font-medium hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                    >
                      <ListPlus className="w-5 h-5" />
                      В подборку
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-stone-100">{book.title}</h1>
                {book.ageRestriction !== undefined && book.ageRestriction > 0 && (
                  <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs font-bold text-white border border-white/20 whitespace-nowrap">
                    {book.ageRestriction}+
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg text-gray-600 dark:text-stone-400 mb-4">
                {book.authors.map((a, i) => (
                    <React.Fragment key={a.id}>
                        <button 
                            onClick={() => onAuthorClick?.(a.id)}
                            className="hover:text-amber-600 hover:underline transition-colors text-left"
                        >
                            {a.name}
                        </button>
                        {i < book.authors.length - 1 && <span>,</span>}
                    </React.Fragment>
                ))}
              </div>

              {(book.reviewsCount ?? 0) > 0 && (
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    {renderRatingStars(book.averageRating || 0)}
                    <span className="text-2xl font-bold text-gray-900 dark:text-stone-100">
                      {(book.averageRating || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-amber-200 dark:bg-stone-700" />
                  <span className="text-gray-600 dark:text-stone-400">
                    {book.reviewsCount} {book.reviewsCount === 1 ? 'отзыв' : 'отзывов'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {book.genres.map(genre => (
                <button 
                    key={genre.id} 
                    onClick={() => onGenreClick?.(genre.id)}
                    className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 rounded-full text-sm hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                >
                  {genre.name}
                </button>
              ))}
              {book.tags.map(tag => (
                <button 
                    key={tag.id} 
                    onClick={() => onTagClick?.(tag.id)}
                    className="px-3 py-1 bg-gray-100 dark:bg-stone-700 text-gray-700 dark:text-stone-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-stone-600 transition-colors"
                >
                  {tag.name}
                </button>
              ))}
            </div>

            {book.description && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 mb-3">Описание</h2>
                <p className="text-gray-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">{book.description}</p>
              </div>
            )}

            <div className="pt-8 border-t border-amber-200 dark:border-stone-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-stone-100">Отзывы читателей</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Filter className="w-4 h-4 text-amber-600" />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setRatingFilter(null)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          ratingFilter === null
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                        }`}
                      >
                        Все
                      </button>
                      {[5, 4, 3, 2, 1].map(r => (
                        <button
                          key={r}
                          onClick={() => setRatingFilter(ratingFilter === r ? null : r)}
                          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                            ratingFilter === r
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                          }`}
                        >
                          {r} <Star className={`w-3 h-3 ${ratingFilter === r ? 'fill-white' : 'fill-yellow-400 text-yellow-400'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {user && user.role !== 'guest' && (
                  <button
                    onClick={() => {
                        if (showReviewForm) {
                            setShowReviewForm(false);
                        } else if (existingUserReview) {
                            handleEditReview();
                        } else {
                            setUserReview({ rate: 5, text: '' });
                            setShowReviewForm(true);
                        }
                    }}
                    className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-all active:scale-95 shadow-md shadow-amber-600/20"
                  >
                    {showReviewForm ? 'Отменить' : existingUserReview ? 'Редактировать мой отзыв' : 'Написать свой отзыв'}
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form id="review-form" onSubmit={handleSubmitReview} className="mb-8 p-6 bg-amber-50/50 dark:bg-stone-800/50 rounded-2xl border border-amber-200 dark:border-stone-700 shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-stone-100 mb-4">
                      {existingUserReview ? 'Редактирование отзыва' : 'Ваш отзыв'}
                  </h3>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-stone-300 mb-2 uppercase tracking-wider">
                      Ваша оценка
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setUserReview({ ...userReview, rate: rating })}
                          className="p-1 transition-transform hover:scale-110 active:scale-90"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              rating <= userReview.rate
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-stone-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-stone-300 mb-2 uppercase tracking-wider">
                      Комментарий
                    </label>
                    <textarea
                      value={userReview.text}
                      onChange={(e) => setUserReview({ ...userReview, text: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-amber-300 dark:border-stone-600 bg-card rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
                      placeholder="Что вам понравилось или не понравилось в этой книге?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 active:scale-95"
                  >
                    {existingUserReview ? 'Сохранить изменения' : 'Опубликовать отзыв'}
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-stone-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-stone-800">
                    <p className="text-gray-600 dark:text-stone-400">
                        {ratingFilter ? `Отзывов с оценкой ${ratingFilter} пока нет` : 'Пока нет отзывов. Будьте первым!'}
                    </p>
                    {ratingFilter && (
                        <button 
                            onClick={() => setRatingFilter(null)}
                            className="mt-2 text-sm text-amber-600 hover:underline font-bold"
                        >
                            Сбросить фильтр
                        </button>
                    )}
                  </div>
                ) : (
                  filteredReviews.map((review) => {
                    const isOwnReview = review.userId === user?.id;
                    return (
                        <div key={review.id} className={`p-6 rounded-2xl border transition-all ${
                            isOwnReview 
                                ? 'bg-amber-50/80 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 shadow-sm' 
                                : 'bg-gray-50 dark:bg-stone-900/40 border-transparent hover:border-amber-100 dark:hover:border-stone-800'
                        }`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-stone-800 flex items-center justify-center overflow-hidden border border-amber-200 dark:border-stone-700 shadow-sm">
                                {review.userAvatar ? (
                                  <img 
                                    src={review.userAvatar.startsWith('http') ? review.userAvatar : `${API_BASE}${review.userAvatar}`}
                                    className="w-full h-full object-cover"
                                    alt=""
                                  />
                                ) : (
                                  <User className="w-6 h-6 text-gray-500 dark:text-stone-500" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-900 dark:text-stone-100">{review.userName}</p>
                                  {isOwnReview && (
                                      <span className="text-[10px] px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full font-bold uppercase tracking-wider">Вы</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3.5 h-3.5 ${
                                        i < review.rate
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300 dark:text-stone-700'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 dark:text-stone-500">{review.createdAt}</span>
                                {(isOwnReview || user?.role === 'admin') && (
                                    <div className="flex gap-1">
                                        {isOwnReview && !showReviewForm && (
                                            <button 
                                                onClick={handleEditReview}
                                                className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
                                                title="Редактировать"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleReviewDelete(review.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                                            title="Удалить"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                          </div>
                          {review.text && (
                            <p className="text-gray-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">{review.text}</p>
                          )}
                        </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && book && (
        <BookEditModal
          book={book}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            loadBook();
            setShowEditModal(false);
          }}
        />
      )}

      {showCollectionsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col border border-amber-200 dark:border-stone-700">
            <div className="sticky top-0 bg-card border-b border-amber-200 dark:border-stone-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-stone-100">
                Добавить в подборку
              </h2>
              <button
                onClick={() => setShowCollectionsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-lg transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {collections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-stone-400 mb-4">
                    У вас пока нет подборок. Создайте их на странице "Подборки".
                  </p>
                  <button 
                    onClick={() => onBack()} // Should navigate to collections but we don't have direct path here easily
                    className="text-amber-600 font-bold hover:underline"
                  >
                      Перейти в коллекции
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleAddToCollection(collection.id)}
                      className="w-full p-4 text-left border border-amber-100 dark:border-stone-800 rounded-xl hover:bg-amber-50 dark:hover:bg-stone-900/50 hover:border-amber-300 transition-all group shadow-sm"
                    >
                      <h3 className="font-bold text-gray-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-500">{collection.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-stone-500 mt-1">
                        {collection.books.length} {collection.books.length === 1 ? 'книга' : 'книг'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
