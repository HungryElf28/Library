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
  PaginatedResponse,
  AuthResponse,
  ReadingBook,
  Collection,
  Bookmark,
} from '../types';
import { mockAuthors, mockGenres, mockTags, mockBooks, mockUsers } from './mockData';
import { API_BASE } from '../config';

// Use mock data mode - set to false when backend is available
const USE_MOCK_DATA = true;

const STORAGE_KEY = 'library_auth_token';
const FAVORITES_KEY = 'library_favorites';
const BOOKMARKS_KEY = 'library_bookmarks';
const READING_PROGRESS_KEY = 'library_reading_progress';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let currentUser: User | null = null;
let authToken: string | null = localStorage.getItem(STORAGE_KEY);

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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

export const api = {
  auth: {
    async login(data: LoginDto): Promise<AuthResponse> {
      await delay(500);

      const params = new URLSearchParams({
        Login: data.login,
        Password: data.password,
      });

      const response = await fetchWithAuth(`${API_BASE}/login?${params}`, {
        method: 'POST',
      });

      const result = await response.json();
      
      localStorage.setItem(STORAGE_KEY, result.token || '');
      authToken = result.token || '';
      
      currentUser = result.user;
      return result;
    },

    async register(data: RegisterDto): Promise<AuthResponse> {
      await delay(500);

      const params = new URLSearchParams({
        Login: data.login,
        Email: data.email,
        Password: data.password,
      });

      const response = await fetchWithAuth(`${API_BASE}/register?${params}`, {
        method: 'POST',
      });

      const result = await response.json();
      
      localStorage.setItem(STORAGE_KEY, result.token || '');
      authToken = result.token || '';
      
      currentUser = result.user;
      return result;
    },

    async logout(): Promise<void> {
      await delay(300);
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
  },

  books: {
    async getAll(params: BookQueryParams = {}): Promise<PaginatedResponse<BookListItem>> {
      await delay(500);

      const queryParams = new URLSearchParams();
      if (params.genreId) queryParams.append('GenreId', params.genreId.toString());
      if (params.authorId) queryParams.append('AuthorId', params.authorId.toString());
      if (params.page) queryParams.append('Page', params.page.toString());
      if (params.pageSize) queryParams.append('PageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('SortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('SortOrder', params.sortOrder);

      const response = await fetchWithAuth(`${API_BASE}/api/books?${queryParams}`, {
        method: 'GET',
      });

      return response.json();
    },

    async getById(id: number): Promise<Book> {
      await delay(300);
      const response = await fetchWithAuth(`${API_BASE}/api/books/${id}`, {
        method: 'GET',
      });
      return response.json();
    },

    async create(data: CreateBookDto): Promise<Book> {
  await delay(500);

  const form = new FormData();

  form.append('Title', data.title);
  form.append('Description', data.description || '');

  if (data.textFile)
    form.append('TextFile', data.textFile);

  if (data.coverFile)
    form.append('CoverFile', data.coverFile);

  data.authorIds?.forEach(id =>
    form.append('AuthorIds', id.toString())
  );

  data.genreIds?.forEach(id =>
    form.append('GenreIds', id.toString())
  );

  data.tagIds?.forEach(id =>
    form.append('TagIds', id.toString())
  );

  const response = await fetchWithAuth(`${API_BASE}/api/books`, {
    method: 'POST',
    body: form,
  });

  return response.json();
},

    async update(id: number, data: UpdateBookDto): Promise<Book> {
      await delay(500);
      const response = await fetchWithAuth(`${API_BASE}/api/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    async delete(id: number): Promise<void> {
      await delay(500);
      await fetchWithAuth(`${API_BASE}/api/books/${id}`, {
        method: 'DELETE',
      });
    },
  },

  authors: {
    async getAll(): Promise<Author[]> {
      await delay(300);
      const response = await fetchWithAuth(`${API_BASE}/api/authors`, {
        method: 'GET',
      });
      return response.json();
    },

    async getById(id: number): Promise<Author> {
      await delay(300);
      const response = await fetchWithAuth(`${API_BASE}/api/authors/${id}`, {
        method: 'GET',
      });
      return response.json();
    },

    async create(data: CreateAuthorDto): Promise<Author> {
      await delay(500);
      const response = await fetchWithAuth(`${API_BASE}/api/authors`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    async update(id: number, data: UpdateAuthorDto): Promise<Author> {
      await delay(500);
      const response = await fetchWithAuth(`${API_BASE}/api/authors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    async delete(id: number): Promise<void> {
      await delay(500);
      await fetchWithAuth(`${API_BASE}/api/authors/${id}`, {
        method: 'DELETE',
      });
    },
  },

  genres: {
    async getAll(): Promise<Genre[]> {
      await delay(300);
      const response = await fetchWithAuth(`${API_BASE}/api/genres`, {
        method: 'GET',
      });
      return response.json();
    },

    async getById(id: number): Promise<Genre> {
      await delay(300);
      const response = await fetchWithAuth(`${API_BASE}/api/genres/${id}`, {
        method: 'GET',
      });
      return response.json();
    },

    async create(data: CreateGenreDto): Promise<Genre> {
      await delay(500);
      const response = await fetchWithAuth(`${API_BASE}/api/genres`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    async update(id: number, data: UpdateGenreDto): Promise<Genre> {
      await delay(500);
      const response = await fetchWithAuth(`${API_BASE}/api/genres/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    async delete(id: number): Promise<void> {
      await delay(500);
      await fetchWithAuth(`${API_BASE}/api/genres/${id}`, {
        method: 'DELETE',
      });
    },
  },

  tags: {
    async getAll(): Promise<Tag[]> {
      await delay(300);
      const response = await fetchWithAuth(`${API_BASE}/api/tags`, {
        method: 'GET',
      });
      return response.json();
    },

    async getById(id: number): Promise<Tag> {
      await delay(300);
      const response = await fetchWithAuth(`${API_BASE}/api/tags/${id}`, {
        method: 'GET',
      });
      return response.json();
    },

    async create(data: { name: string }): Promise<Tag> {
      await delay(500);
      const response = await fetchWithAuth(`${API_BASE}/api/tags`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    async update(id: number, data: { name: string }): Promise<Tag> {
      await delay(500);
      const response = await fetchWithAuth(`${API_BASE}/api/tags/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    async delete(id: number): Promise<void> {
      await delay(500);
      await fetchWithAuth(`${API_BASE}/api/tags/${id}`, {
        method: 'DELETE',
      });
    },
  },

  reviews: {
    async getByBookId(bookId: number): Promise<Review[]> {
      await delay(300);
      const response = await fetchWithAuth(`${API_BASE}/api/Reviews/${bookId}`, {
        method: 'GET',
      });
      return response.json();
    },

    async create(bookId: number, data: CreateReviewDto): Promise<Review> {
      await delay(500);
      const response = await fetchWithAuth(`${API_BASE}/api/Reviews/${bookId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },

  users: {
    async getFavorites(): Promise<BookListItem[]> {
      await delay(300);
      const response = await fetchWithAuth(`${API_BASE}/api/Users/favorites`, {
        method: 'GET',
      });
      return response.json();
    },

    async addToFavorites(bookId: number): Promise<void> {
      await delay(300);
      await fetchWithAuth(`${API_BASE}/api/Users/favorites/${bookId}`, {
        method: 'POST',
      });
    },

    async removeFromFavorites(bookId: number): Promise<void> {
      await delay(300);
      await fetchWithAuth(`${API_BASE}/api/Users/favorites/${bookId}`, {
        method: 'DELETE',
      });
    },

    async getReading(): Promise<ReadingBook[]> {
      await delay(300);
      const response = await fetchWithAuth(`${API_BASE}/api/Users/reading`, {
        method: 'GET',
      });
      return response.json();
    },

    async updateReadingProgress(bookId: number, page: number, totalPages: number): Promise<void> {
      // This endpoint doesn't exist in the API, using localStorage as fallback
      await delay(300);

      const progress = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY) || '{}');
      progress[bookId] = {
        page,
        lastOpened: new Date().toISOString().split('T')[0],
        progress: Math.round((page / totalPages) * 100),
      };
      localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(progress));
    },
  },

  collections: {
    async getAll(): Promise<Collection[]> {
      await delay(300);
      const response = await fetchWithAuth(`${API_BASE}/api/Collections`, {
        method: 'GET',
      });
      return response.json();
    },

    async getById(id: number): Promise<Collection> {
      await delay(300);
      const response = await fetchWithAuth(`${API_BASE}/api/Collections/${id}`, {
        method: 'GET',
      });
      return response.json();
    },

    async create(data: CreateCollectionDto): Promise<Collection> {
      await delay(500);
      const response = await fetchWithAuth(`${API_BASE}/api/Collections`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    async update(id: number, data: UpdateCollectionDto): Promise<Collection> {
      await delay(500);
      const response = await fetchWithAuth(`${API_BASE}/api/Collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    async delete(id: number): Promise<void> {
      await delay(500);
      await fetchWithAuth(`${API_BASE}/api/Collections/${id}`, {
        method: 'DELETE',
      });
    },

    async addBook(collectionId: number, bookId: number): Promise<void> {
      await delay(300);
      await fetchWithAuth(`${API_BASE}/api/Collections/${collectionId}/books/${bookId}`, {
        method: 'POST',
      });
    },

    async removeBook(collectionId: number, bookId: number): Promise<void> {
      await delay(300);
      await fetchWithAuth(`${API_BASE}/api/Collections/${collectionId}/books/${bookId}`, {
        method: 'DELETE',
      });
    },
  },

  bookmarks: {
    async getByBookId(bookId: number): Promise<Bookmark[]> {
      await delay(300);
      // This endpoint doesn't exist in the API, using localStorage as fallback
      const bookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '{}');
      return bookmarks[bookId] || [];
    },

    async create(bookId: number, page: number, note?: string): Promise<Bookmark> {
      await delay(300);
      // This endpoint doesn't exist in the API, using localStorage as fallback
      const bookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '{}');
      if (!bookmarks[bookId]) {
        bookmarks[bookId] = [];
      }

      const bookmark: Bookmark = {
        id: Date.now(),
        bookId,
        page,
        note,
        createdAt: new Date().toISOString(),
      };

      bookmarks[bookId].push(bookmark);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      return bookmark;
    },

    async delete(bookId: number, bookmarkId: number): Promise<void> {
      await delay(300);
      // This endpoint doesn't exist in the API, using localStorage as fallback
      const bookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '{}');
      if (bookmarks[bookId]) {
        bookmarks[bookId] = bookmarks[bookId].filter((b: Bookmark) => b.id !== bookmarkId);
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      }
    },
  },

  search: {
    async search(query: string): Promise<{ books: BookListItem[]; authors: Author[]; genres: Genre[] }> {
      await delay(400);

      const queryParams = new URLSearchParams({ query });
      const response = await fetchWithAuth(`${API_BASE}/api/search?${queryParams}`, {
        method: 'GET',
      });

      return response.json();
    },
  },
};