import { NEWSAPI_BASE_URL, NEWSAPI_KEY } from './config.js';
import { normalizeArticle, type INewsApiArticle } from './normalizers.js';
import type { INewsParams, INewsProvider } from '../provider.js';
import { NewsRateLimitError } from '../provider.js';
import type { INewsArticle } from '../../types.js';

interface INewsApiResponse {
    status: string;
    totalResults: number;
    articles: INewsApiArticle[];
    code?: string;
}

const RATE_LIMIT_CODES = new Set(['rateLimited', 'maximumResultsReached', 'apiKeyExhausted']);

export const newsapiProvider: INewsProvider = {
    name: 'newsapi',

    isAvailable(): boolean {
        return !!NEWSAPI_KEY;
    },

    async fetchNews(params: INewsParams): Promise<INewsArticle[]> {
        const search = new URLSearchParams();
        search.set('apiKey', NEWSAPI_KEY);

        if (params.query) search.set('q', params.query);
        if (params.pageSize) search.set('pageSize', String(params.pageSize));
        if (params.page) search.set('page', String(params.page));

        let endpoint: string;
        if (params.isHeadlines) {
            endpoint = 'top-headlines';
            if (params.country) search.set('country', params.country);
        } else {
            endpoint = 'everything';
            if (params.language) search.set('language', params.language);
            if (params.from) search.set('from', params.from);
            if (params.to) search.set('to', params.to);
            if (params.domains) search.set('domains', params.domains);
            if (params.excludeDomains) search.set('excludeDomains', params.excludeDomains);
        }

        const response = await fetch(`${NEWSAPI_BASE_URL}/${endpoint}?${search}`);

        if (response.status === 429) {
            throw new NewsRateLimitError('newsapi', 'NewsAPI.org rate limit reached');
        }

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`NewsAPI.org error ${response.status}: ${body}`);
        }

        const data = (await response.json()) as INewsApiResponse;

        if (data.status === 'error') {
            if (data.code && RATE_LIMIT_CODES.has(data.code)) {
                throw new NewsRateLimitError('newsapi', `NewsAPI.org rate limit: ${data.code}`);
            }
            throw new Error(`NewsAPI.org API error: ${JSON.stringify(data)}`);
        }

        return data.articles.map(normalizeArticle);
    },
};
