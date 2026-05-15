import {
  Book,
  BookListItem,
  Author,
  Genre,
  Tag,
  Review,
  User,
  LoginDto,
  RegisterDto,
  CreateReviewDto,
  CreateBookDto,
  UpdateBookDto,
  CreateAuthorDto,
  UpdateAuthorDto,
  CreateGenreDto,
  UpdateGenreDto,
  CreateCollectionDto,
  UpdateCollectionDto,
  BookQueryParams,
  PaginationQueryParams,
  PaginatedResponse,
  AuthResponse,
  ReadingBook,
  Collection,
  Bookmark,
  SearchProjection,
} from '../types';
import { API_BASE } from '../config';

const STORAGE_KEY = 'library_auth_token';
const READING_PROGRESS_KEY = 'library_reading_progress';
const BOOKMARKS_KEY = 'library_bookmarks';

let currentUser: User | null = null;
let authToken: string | null = localStorage.getItem(STORAGE_KEY);

function appendPaginationParams(queryParams: URLSearchParams, params: PaginationQueryParams = {}) {
  if (params.searchTerm) queryParams.append('SearchTerm', params.searchTerm);
  if (params.page) queryParams.append('Page', params.page.toString());
  if (params.pageSize) queryParams.append('PageSize', params.pageSize.toString());
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error ${response.status}`);
  }

  return response;
}

async function safeJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
    return {} as T;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

export const api = {
  auth: {
    async login(data: LoginDto): Promise<AuthResponse> {
      const response = await fetchWithAuth(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await safeJsonResponse<AuthResponse>(response);
      
      localStorage.setItem(STORAGE_KEY, result.token || '');
      authToken = result.token || '';
      
      currentUser = result.user;
      return result;
    },

    async register(data: RegisterDto): Promise<AuthResponse> {
      const response = await fetchWithAuth(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await safeJsonResponse<AuthResponse>(response);
      
      localStorage.setItem(STORAGE_KEY, result.token || '');
      authToken = result.token || '';
      
      currentUser = result.user;
      return result;
    },

    async logout(): Promise<void> {
      localStorage.removeItem(STORAGE_KEY);
      currentUser = null;
      authToken = null;
    },

    getCurrentUser(): User | null {
      return currentUser;
    },

    getToken(): string | null {
      return authToken;
    },

    async getMe(): Promise<User> {
      const response = await fetchWithAuth(`${API_BASE}/api/auth/me`, {
        method: 'GET',
      });
      const user = await safeJsonResponse<User>(response);
      currentUser = user;
      return user;
    },
  },

  books: {
    async getAll(params: BookQueryParams = {}): Promise<PaginatedResponse<BookListItem>> {
      const queryParams = new URLSearchParams();
      appendPaginationParams(queryParams, params);
      if (params.genreId) queryParams.append('GenreId', params.genreId.toString());
      if (params.authorId) queryParams.append('AuthorId', params.authorId.toString());
      if (params.tagId) queryParams.append('TagId', params.tagId.toString());
      if (params.sortBy) queryParams.append('SortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('SortOrder', params.sortOrder);

      const response = await fetchWithAuth(`${API_BASE}/api/books?${queryParams}`, {
        method: 'GET',
      });

      return safeJsonResponse<PaginatedResponse<BookListItem>>(response);
    },

    async getById(id: number): Promise<Book> {
      const response = await fetchWithAuth(`${API_BASE}/api/books/${id}`, {
        method: 'GET',
      });
      return safeJsonResponse<Book>(response);
    },

    async create(data: FormData): Promise<Book> {
      const response = await fetchWithAuth(`${API_BASE}/api/books`, {
        method: 'POST',
        body: data,
      });
      return safeJsonResponse<Book>(response);
    },

    async update(id: number, data: FormData): Promise<Book> {
      const response = await fetchWithAuth(`${API_BASE}/api/books/${id}`, {
        method: 'PUT',
        body: data,
      });
      return safeJsonResponse<Book>(response);
    },

    async delete(id: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/books/${id}`, {
        method: 'DELETE',
      });
    },

    async getRecommendations(): Promise<BookListItem[]> {
      const response = await fetchWithAuth(`${API_BASE}/api/books/recommendations`, {
        method: 'GET',
      });
      return safeJsonResponse<BookListItem[]>(response);
    },

    async getMostRead(params: { count?: number; genreId?: number; authorId?: number } = {}): Promise<BookListItem[]> {
      const queryParams = new URLSearchParams();
      if (params.count) queryParams.append('count', params.count.toString());
      if (params.genreId) queryParams.append('genreId', params.genreId.toString());
      if (params.authorId) queryParams.append('authorId', params.authorId.toString());

      const response = await fetchWithAuth(`${API_BASE}/api/books/most-read?${queryParams}`, {
        method: 'GET',
      });
      return safeJsonResponse<BookListItem[]>(response);
    },
  },

  authors: {
    async getAll(params: PaginationQueryParams = {}): Promise<PaginatedResponse<Author>> {
      const queryParams = new URLSearchParams();
      appendPaginationParams(queryParams, params);

      const response = await fetchWithAuth(`${API_BASE}/api/authors?${queryParams}`, {
        method: 'GET',
      });
      return safeJsonResponse<PaginatedResponse<Author>>(response);
    },

    async getById(id: number): Promise<Author> {
      const response = await fetchWithAuth(`${API_BASE}/api/authors/${id}`, {
        method: 'GET',
      });
      return safeJsonResponse<Author>(response);
    },

    async create(data: FormData): Promise<Author> {
      const response = await fetchWithAuth(`${API_BASE}/api/authors`, {
        method: 'POST',
        body: data,
      });
      return safeJsonResponse<Author>(response);
    },

    async update(id: number, data: FormData): Promise<Author> {
      const response = await fetchWithAuth(`${API_BASE}/api/authors/${id}`, {
        method: 'PUT',
        body: data,
      });
      return safeJsonResponse<Author>(response);
    },

    async delete(id: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/authors/${id}`, {
        method: 'DELETE',
      });
    },
  },

  genres: {
    async getAll(params: PaginationQueryParams = {}): Promise<PaginatedResponse<Genre>> {
      const queryParams = new URLSearchParams();
      appendPaginationParams(queryParams, params);

      const response = await fetchWithAuth(`${API_BASE}/api/genres?${queryParams}`, {
        method: 'GET',
      });
      return safeJsonResponse<PaginatedResponse<Genre>>(response);
    },

    async getById(id: number): Promise<Genre> {
      const response = await fetchWithAuth(`${API_BASE}/api/genres/${id}`, {
        method: 'GET',
      });
      return safeJsonResponse<Genre>(response);
    },

    async create(data: CreateGenreDto): Promise<Genre> {
      const response = await fetchWithAuth(`${API_BASE}/api/genres`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return safeJsonResponse<Genre>(response);
    },

    async update(id: number, data: UpdateGenreDto): Promise<Genre> {
      const response = await fetchWithAuth(`${API_BASE}/api/genres/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return safeJsonResponse<Genre>(response);
    },

    async delete(id: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/genres/${id}`, {
        method: 'DELETE',
      });
    },
  },

  tags: {
    async getAll(params: PaginationQueryParams = {}): Promise<PaginatedResponse<Tag>> {
      const queryParams = new URLSearchParams();
      appendPaginationParams(queryParams, params);

      const response = await fetchWithAuth(`${API_BASE}/api/tags?${queryParams}`, {
        method: 'GET',
      });
      return safeJsonResponse<PaginatedResponse<Tag>>(response);
    },

    async getById(id: number): Promise<Tag> {
      const response = await fetchWithAuth(`${API_BASE}/api/tags/${id}`, {
        method: 'GET',
      });
      return safeJsonResponse<Tag>(response);
    },

    async create(data: { name: string }): Promise<Tag> {
      const response = await fetchWithAuth(`${API_BASE}/api/tags`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return safeJsonResponse<Tag>(response);
    },

    async update(id: number, data: { name: string }): Promise<Tag> {
      const response = await fetchWithAuth(`${API_BASE}/api/tags/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return safeJsonResponse<Tag>(response);
    },

    async delete(id: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/tags/${id}`, {
        method: 'DELETE',
      });
    },
  },

  reviews: {
    async getByBookId(bookId: number, params: PaginationQueryParams = { page: 1, pageSize: 50 }): Promise<PaginatedResponse<Review>> {
      const queryParams = new URLSearchParams();
      appendPaginationParams(queryParams, params);

      const response = await fetchWithAuth(`${API_BASE}/api/Reviews/${bookId}?${queryParams}`, {
        method: 'GET',
      });
      return safeJsonResponse<PaginatedResponse<Review>>(response);
    },

    async create(bookId: number, data: CreateReviewDto): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Reviews/${bookId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async delete(id: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Reviews/${id}`, {
        method: 'DELETE',
      });
    },
  },

  users: {
    async getFavorites(params: PaginationQueryParams = { page: 1, pageSize: 100 }): Promise<PaginatedResponse<BookListItem>> {
      const queryParams = new URLSearchParams();
      appendPaginationParams(queryParams, params);

      const response = await fetchWithAuth(`${API_BASE}/api/Users/favorites?${queryParams}`, {
        method: 'GET',
      });
      return safeJsonResponse<PaginatedResponse<BookListItem>>(response);
    },

    async addToFavorites(bookId: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Users/favorites/${bookId}`, {
        method: 'POST',
      });
    },

    async removeFromFavorites(bookId: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Users/favorites/${bookId}`, {
        method: 'DELETE',
      });
    },

    async getReading(params: PaginationQueryParams = { page: 1, pageSize: 100 }): Promise<PaginatedResponse<ReadingBook>> {
      const queryParams = new URLSearchParams();
      appendPaginationParams(queryParams, params);

      const response = await fetchWithAuth(`${API_BASE}/api/Users/reading?${queryParams}`, {
        method: 'GET',
      });
      return safeJsonResponse<PaginatedResponse<ReadingBook>>(response);
    },

    async saveProgress(bookId: number, page: number, charOffset: number | undefined, totalPages: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Users/reading/${bookId}`, {
        method: 'POST',
        body: JSON.stringify({ page, charOffset, totalPages }),
      });
    },

    async getProgress(bookId: number): Promise<ReadingBook> {
      const response = await fetchWithAuth(`${API_BASE}/api/Users/reading/${bookId}`, {
        method: 'GET',
      });
      return safeJsonResponse<ReadingBook>(response);
    },

    async updateSubscription(isSubscribed: boolean): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Users/subscription`, {
        method: 'POST',
        body: JSON.stringify(isSubscribed),
      });
    },

    async getAllUsers(params: PaginationQueryParams = { page: 1, pageSize: 100 }): Promise<PaginatedResponse<User>> {
      const queryParams = new URLSearchParams();
      appendPaginationParams(queryParams, params);

      const response = await fetchWithAuth(`${API_BASE}/api/Users/all?${queryParams}`, {
        method: 'GET',
      });
      return safeJsonResponse<PaginatedResponse<User>>(response);
    },

    async deleteUser(userId: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Users/${userId}`, {
        method: 'DELETE',
      });
    },

    async changeRole(userId: number, roleName: string): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify(roleName),
      });
    },

    async updateAvatar(data: FormData): Promise<{ avatarUrl: string }> {
      const response = await fetchWithAuth(`${API_BASE}/api/Users/avatar`, {
        method: 'POST',
        body: data,
      });
      return safeJsonResponse<{ avatarUrl: string }>(response);
    },

    async deleteAvatar(): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Users/avatar`, {
        method: 'DELETE',
      });
    },

    async deleteUserAvatar(userId: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Users/${userId}/avatar`, {
        method: 'DELETE',
      });
    },

    async updateReadingProgress(bookId: number, page: number, charOffset: number | undefined, totalPages: number): Promise<void> {
      await api.users.saveProgress(bookId, page, charOffset, totalPages);

      const progress = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY) || '{}');
      progress[bookId] = {
        page,
        charOffset,
        lastOpened: new Date().toISOString().split('T')[0],
        progress: totalPages > 0 ? Math.round((page / totalPages) * 100) : 0,
      };
      localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(progress));
    },
  },

  collections: {
    async getAll(params: PaginationQueryParams = { page: 1, pageSize: 100 }): Promise<PaginatedResponse<Collection>> {
      const queryParams = new URLSearchParams();
      appendPaginationParams(queryParams, params);

      const response = await fetchWithAuth(`${API_BASE}/api/Collections?${queryParams}`, {
        method: 'GET',
      });
      return safeJsonResponse<PaginatedResponse<Collection>>(response);
    },

    async getById(id: number): Promise<Collection> {
      const response = await fetchWithAuth(`${API_BASE}/api/Collections/${id}`, {
        method: 'GET',
      });
      return safeJsonResponse<Collection>(response);
    },

    async create(data: CreateCollectionDto): Promise<Collection> {
      const response = await fetchWithAuth(`${API_BASE}/api/Collections`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return safeJsonResponse<Collection>(response);
    },

    async update(id: number, data: UpdateCollectionDto): Promise<Collection> {
      const response = await fetchWithAuth(`${API_BASE}/api/Collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return safeJsonResponse<Collection>(response);
    },

    async delete(id: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Collections/${id}`, {
        method: 'DELETE',
      });
    },

    async addBook(collectionId: number, bookId: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Collections/${collectionId}/books/${bookId}`, {
        method: 'POST',
      });
    },

    async removeBook(collectionId: number, bookId: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Collections/${collectionId}/books/${bookId}`, {
        method: 'DELETE',
      });
    },
  },

  bookmarks: {
    async getByBookId(bookId: number): Promise<Bookmark[]> {
      const response = await fetchWithAuth(`${API_BASE}/api/Bookmarks/${bookId}`, {
        method: 'GET',
      });
      return safeJsonResponse<Bookmark[]>(response);
    },

    async create(bookId: number, page: number, note?: string, cfi?: string, charOffset?: number): Promise<Bookmark> {
      const response = await fetchWithAuth(`${API_BASE}/api/Bookmarks/${bookId}`, {
        method: 'POST',
        body: JSON.stringify({ page, note, cfi, charOffset }),
      });
      return safeJsonResponse<Bookmark>(response);
    },

    async update(bookmarkId: number, note?: string): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Bookmarks/${bookmarkId}`, {
        method: 'PUT',
        body: JSON.stringify(note),
      });
    },

    async delete(bookId: number, bookmarkId: number): Promise<void> {
      await fetchWithAuth(`${API_BASE}/api/Bookmarks/${bookmarkId}`, {
        method: 'DELETE',
      });
    },
  },

  search: {
    async search(query: string): Promise<SearchProjection[]> {
      const queryParams = new URLSearchParams({ query });
      const response = await fetchWithAuth(`${API_BASE}/api/search?${queryParams}`, {
        method: 'GET',
      });

      return safeJsonResponse<SearchProjection[]>(response);
    },

    async getSuggestions(query: string): Promise<Record<string, string[]>> {
      const queryParams = new URLSearchParams({ query });
      const response = await fetchWithAuth(`${API_BASE}/api/search/suggestions?${queryParams}`, {
        method: 'GET',
      });

      return safeJsonResponse<Record<string, string[]>>(response);
    },
  },
};
