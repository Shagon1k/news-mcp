import type { INewsArticle } from '../../types.js';

interface INewsApiSource {
    id: string | null;
    name: string;
}

export interface INewsApiArticle {
    source: INewsApiSource;
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    publishedAt: string;
    content: string | null;
}

export function normalizeArticle(article: INewsApiArticle): INewsArticle {
    return {
        title: article.title ?? '(no title)',
        description: article.description,
        url: article.url,
        source: article.source.name ?? '(unknown source)',
        author: article.author,
        publishedAt: article.publishedAt,
        content: article.content,
    };
}
