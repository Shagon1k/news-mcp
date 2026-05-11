import { NEWSAPI_BASE_URL, NEWSAPI_KEY } from './config.js';
import { normalizeArticle, type INewsApiArticle } from './normalizers.js';
import type { INewsArticle } from '../../types.js';

interface INewsApiResponse {
    status: string;
    totalResults: number;
    articles: INewsApiArticle[];
}

export interface FetchNewsParams {
    // Shared
    query?: string;
    sources?: string;
    pageSize?: number;
    page?: number;
    // everything
    searchIn?: 'title' | 'description' | 'content';
    domains?: string;
    excludeDomains?: string;
    from?: string;
    to?: string;
    language?: string;
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
    // top-headlines
    category?: 'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports' | 'technology';
    country?: string;
}

export async function fetchNews(params: FetchNewsParams): Promise<INewsArticle[]> {
    const useTopHeadlines = !!(params.category || params.country);
    const endpoint = useTopHeadlines ? 'top-headlines' : 'everything';

    const search = new URLSearchParams();
    search.set('apiKey', NEWSAPI_KEY);

    if (params.query) search.set('q', params.query);
    if (params.sources) search.set('sources', params.sources);
    if (params.pageSize) search.set('pageSize', String(params.pageSize));
    if (params.page) search.set('page', String(params.page));

    if (useTopHeadlines) {
        if (params.category) search.set('category', params.category);
        if (params.country) search.set('country', params.country);
    } else {
        if (params.searchIn) search.set('searchIn', params.searchIn);
        if (params.domains) search.set('domains', params.domains);
        if (params.excludeDomains) search.set('excludeDomains', params.excludeDomains);
        if (params.from) search.set('from', params.from);
        if (params.to) search.set('to', params.to);
        if (params.language) search.set('language', params.language);
        if (params.sortBy) search.set('sortBy', params.sortBy);
    }

    const response = await fetch(`${NEWSAPI_BASE_URL}/${endpoint}?${search}`);

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`NewsAPI error ${response.status}: ${body}`);
    }

    const data = (await response.json()) as INewsApiResponse;
    return data.articles.map(normalizeArticle);
}
