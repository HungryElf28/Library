import React, { useState, useEffect } from 'react';
import { Book, Review, CreateReviewDto, Collection } from '../../../types';
import { api } from '../../../services/api';
import { Star, Heart, BookOpen, Loader, ArrowLeft, Edit, ListPlus, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { BookEditModal } from '../BookEditModal';

interface BookDetailsPageProps {
  bookId: number;
  onStartReading: (bookId: number) => void;
  onBack: () => void;
}

export function BookDetailsPage({ bookId, onStartReading, onBack }: BookDetailsPageProps) {
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

  const loadReviews = async () => {
    try {
      const data = await api.reviews.getByBookId(bookId);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const checkFavorite = async () => {
    if (!user || user.role === 'guest') return;

    try {
      const favorites = await api.users.getFavorites();
      setIsFavorite(favorites.some(b => b.id === bookId));
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role === 'guest') return;

    try {
      await api.reviews.create(bookId, userReview);
      setShowReviewForm(false);
      setUserReview({ rate: 5, text: '' });
      await loadReviews();
      await loadBook();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const loadCollections = async () => {
    if (!user || user.role === 'guest') return;

    try {
      const data = await api.collections.getAll();
      setCollections(data);
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

  if (loading || !book) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  const existingUserReview = reviews.find(r => r.userId === user?.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
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
        <div className="grid md:grid-cols-3 gap-8 p-6 md:p-8">
          <div className="md:col-span-1">
            <div className="sticky top-20">
              {book.coverFile ? (
                <img
                  src={book.coverFile}
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
                  onClick={() => onStartReading(bookId)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  Читать
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-stone-100 mb-2">{book.title}</h1>
              <p className="text-lg text-gray-600 dark:text-stone-400 mb-4">
                {book.authors.map(a => a.name).join(', ')}
              </p>

              {book.averageRating && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-stone-100">{book.averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-600 dark:text-stone-400">
                    {book.reviewsCount} {book.reviewsCount === 1 ? 'отзыв' : 'отзывов'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {book.genres.map(genre => (
                <span key={genre.id} className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
              {book.tags.map(tag => (
                <span key={tag.id} className="px-3 py-1 bg-gray-100 dark:bg-stone-700 text-gray-700 dark:text-stone-300 rounded-full text-sm">
                  {tag.name}
                </span>
              ))}
            </div>

            {book.description && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 mb-3">Описание</h2>
                <p className="text-gray-700 dark:text-stone-300 leading-relaxed">{book.description}</p>
              </div>
            )}

            <div className="pt-6 border-t border-amber-200 dark:border-stone-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100">Отзывы</h2>
                {user && user.role !== 'guest' && !existingUserReview && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
                  >
                    {showReviewForm ? 'Отменить' : 'Написать отзыв'}
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-amber-50/50 dark:bg-stone-800/50 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-2">
                      Оценка
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setUserReview({ ...userReview, rate: rating })}
                          className="p-1"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              rating <= userReview.rate
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-2">
                      Текст отзыва (необязательно)
                    </label>
                    <textarea
                      value={userReview.text}
                      onChange={(e) => setUserReview({ ...userReview, text: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-amber-300 dark:border-stone-600 bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Поделитесь своим мнением о книге..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700"
                  >
                    Опубликовать
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-600 dark:text-stone-400 text-center py-8">Пока нет отзывов</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-amber-50/50 dark:bg-stone-800/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-stone-100">{review.userName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rate
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-stone-500">{review.createdAt}</span>
                      </div>
                      {review.text && (
                        <p className="text-gray-700 dark:text-stone-300 leading-relaxed">{review.text}</p>
                      )}
                    </div>
                  ))
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-amber-200 dark:border-stone-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100">
                Добавить в подборку
              </h2>
              <button
                onClick={() => setShowCollectionsModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-stone-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {collections.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-stone-400 py-8">
                  У вас пока нет подборок. Создайте их на странице "Подборки".
                </p>
              ) : (
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleAddToCollection(collection.id)}
                      className="w-full p-3 text-left border border-amber-200 dark:border-stone-700 rounded-lg hover:bg-amber-50 dark:hover:bg-stone-700 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-stone-100">{collection.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-stone-400 mt-1">
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
