import { NEWSDATA_BASE_URL, NEWSDATA_KEY } from './config.js';
import { normalizeArticle, type INewsDataArticle } from './normalizers.js';
import type { INewsParams, INewsProvider } from '../provider.js';
import { NewsRateLimitError } from '../provider.js';
import type { INewsArticle } from '../../types.js';

interface INewsdataResponse {
    status: string;
    totalResults: number;
    results: INewsDataArticle[];
    nextPage?: string;
}

const RATE_LIMIT_CODES = new Set(['RateLimitExceeded', 'Forbidden', 'TooManyRequests']);

export const newsdataProvider: INewsProvider = {
    name: 'newsdata',

    isAvailable(): boolean {
        return !!NEWSDATA_KEY;
    },

    async fetchNews(params: INewsParams): Promise<INewsArticle[]> {
        const search = new URLSearchParams();
        search.set('apikey', NEWSDATA_KEY);

        if (params.query) search.set('q', params.query);
        if (params.isHeadlines) search.set('category', 'top');
        if (params.language) search.set('language', params.language);
        if (params.country) search.set('country', params.country);
        if (params.from) search.set('from_date', params.from);
        if (params.to) search.set('to_date', params.to);
        if (params.pageSize) search.set('size', String(params.pageSize));
        if (params.page && params.page > 1) search.set('page', String(params.page));
        if (params.domains) search.set('domainurl', params.domains);
        if (params.excludeDomains) search.set('excludedomain', params.excludeDomains);

        const response = await fetch(`${NEWSDATA_BASE_URL}/latest?${search}`);

        if (response.status === 429) {
            throw new NewsRateLimitError('newsdata', 'Newsdata.io rate limit reached');
        }

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Newsdata.io error ${response.status}: ${body}`);
        }

        const data = (await response.json()) as INewsdataResponse;

        if (data.status === 'error') {
            const err = data as any;
            const code = err.results?.code ?? err.code ?? '';
            if (RATE_LIMIT_CODES.has(code)) {
                throw new NewsRateLimitError('newsdata', `Newsdata.io rate limit: ${code}`);
            }
            throw new Error(`Newsdata.io API error: ${JSON.stringify(data)}`);
        }

        return (data.results ?? []).map(normalizeArticle);
    },
};
