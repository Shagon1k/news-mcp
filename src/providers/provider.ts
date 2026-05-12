import type { INewsArticle } from '../types.js';

export interface INewsParams {
    query?: string;
    isHeadlines?: boolean;
    language?: string;
    country?: string;
    from?: string;
    to?: string;
    pageSize?: number;
    page?: number;
    domains?: string;
    excludeDomains?: string;
}

export interface INewsProvider {
    name: string;
    isAvailable(): boolean;
    fetchNews(params: INewsParams): Promise<INewsArticle[]>;
}

export class NewsRateLimitError extends Error {
    constructor(public readonly providerName: string, message: string) {
        super(message);
        this.name = 'NewsRateLimitError';
    }
}
