export interface User {
  id: number;
  login: string;
  email: string;
  role: 'guest' | 'client' | 'admin';
}

export interface Author {
  id: number;
  name: string;
  bio?: string;
  photo?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  textFile: string;
  coverFile?: string;
  description?: string;
  authors: Author[];
  genres: Genre[];
  tags: Tag[];
  averageRating?: number;
  reviewsCount?: number;
}

export interface BookListItem {
  id: number;
  title: string;
  coverFile?: string;
  authors?: string[];
  averageRating?: number;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  bookId: number;
  rate: number;
  text?: string;
  createdAt: string;
}

export interface ReadingBook {
  bookId: number;
  title: string;
  coverFile?: string;
  page: number;
  lastOpened: string;
  progress: number;
}

export interface Collection {
  id: number;
  title: string;
  userId: number;
  books: BookListItem[];
}

export interface Bookmark {
  id: number;
  bookId: number;
  page: number;
  note?: string;
  createdAt: string;
}

export interface LoginDto {
  login: string;
  password: string;
}

export interface RegisterDto {
  login: string;
  email: string;
  password: string;
}

export interface CreateReviewDto {
  rate: number;
  text?: string;
}

export interface CreateBookDto {
  title: string;
  textFile: string;
  coverFile?: string;
  description?: string;
  authorIds: number[];
  genreIds: number[];
  tagIds: number[];
}

export interface UpdateBookDto extends CreateBookDto {}

export interface CreateAuthorDto {
  name: string;
  bio?: string;
  photo?: string;
}

export interface UpdateAuthorDto extends CreateAuthorDto {}

export interface CreateGenreDto {
  name: string;
}

export interface UpdateGenreDto extends CreateGenreDto {}

export interface CreateCollectionDto {
  title: string;
}

export interface UpdateCollectionDto {
  title: string;
}

export interface BookQueryParams {
  genreId?: number;
  authorId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'Title' | 'Rate';
  sortOrder?: 'Asc' | 'Desc';
  query?: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  theme: 'light' | 'dark' | 'sepia';
  lineHeight: number;
}
