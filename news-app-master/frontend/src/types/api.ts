export interface User {
  id: number
  username: string
  email?: string | null
}

export interface AuthResponse {
  success: boolean
  user?: User | null
}

export interface ArticleSource {
  id?: string | null
  name?: string | null
}

export interface Article {
  author?: string | null
  title?: string | null
  description?: string | null
  url?: string | null
  urlToImage?: string | null
  publishedAt?: string | null
  content?: string | null
  source?: ArticleSource | null
}

export interface HeadlinesParams {
  category?: string | null
  page?: number
  pageSize?: number
  country?: string
}

export interface SearchParams {
  q: string
  language?: string
  sortBy?: string
  page?: number
  pageSize?: number
}
