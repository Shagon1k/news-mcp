import { GNEWS_BASE_URL, GNEWS_KEY } from './config.js';
import { normalizeArticle, type IGNewsArticle } from './normalizers.js';
import type { INewsParams, INewsProvider } from '../provider.js';
import { NewsRateLimitError } from '../provider.js';
import type { INewsArticle } from '../../types.js';

interface IGNewsResponse {
    totalArticles: number;
    articles: IGNewsArticle[];
    errors?: { code: number; message: string };
}

export const gnewsProvider: INewsProvider = {
    name: 'gnews',

    isAvailable(): boolean {
        return !!GNEWS_KEY;
    },

    async fetchNews(params: INewsParams): Promise<INewsArticle[]> {
        const search = new URLSearchParams();
        search.set('apikey', GNEWS_KEY);

        if (params.query) search.set('q', params.query);
        if (params.language) search.set('lang', params.language);
        if (params.country) search.set('country', params.country);
        if (params.pageSize) search.set('max', String(params.pageSize));
        if (params.page) search.set('page', String(params.page));
        if (params.from) search.set('from', params.from);
        if (params.to) search.set('to', params.to);

        const endpoint = params.isHeadlines ? 'top-headlines' : 'search';
        const response = await fetch(`${GNEWS_BASE_URL}/${endpoint}?${search}`);

        if (response.status === 429) {
            throw new NewsRateLimitError('gnews', 'GNews rate limit reached');
        }

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`GNews error ${response.status}: ${body}`);
        }

        const data = (await response.json()) as IGNewsResponse;

        if (data.errors) {
            if (data.errors.code === 429) {
                throw new NewsRateLimitError('gnews', `GNews rate limit: ${data.errors.message}`);
            }
            throw new Error(`GNews API error: ${data.errors.message}`);
        }

        return data.articles.map(normalizeArticle);
    },
};
