import http from '@/services/http'
import type { Article, HeadlinesParams, SearchParams } from '@/types/api'

export async function fetchTopHeadlines(params: HeadlinesParams = {}): Promise<Article[]> {
  const { data } = await http.get<Article[]>('/news/top-headlines', {
    params: {
      ...params,
      category: params.category || undefined,
    },
  })

  return data
}

export async function searchArticles(params: SearchParams): Promise<Article[]> {
  const { data } = await http.get<Article[]>('/news/search', {
    params,
  })

  return data
}
