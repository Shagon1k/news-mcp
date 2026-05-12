import type { INewsArticle } from '../../types.js';

interface IGNewsSource {
    id: string;
    name: string;
    url: string;
    country: string;
}

export interface IGNewsArticle {
    title: string;
    description: string | null;
    content: string | null;
    url: string;
    publishedAt: string;
    source: IGNewsSource;
}

export function normalizeArticle(article: IGNewsArticle): INewsArticle {
    return {
        title: article.title ?? '(no title)',
        description: article.description,
        url: article.url,
        source: article.source.name ?? '(unknown source)',
        author: null,
        publishedAt: article.publishedAt,
        content: article.content,
    };
}
