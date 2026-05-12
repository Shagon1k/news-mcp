import type { INewsArticle } from '../../types.js';

export interface INewsDataArticle {
    article_id: string;
    title: string;
    link: string;
    description: string | null;
    content: string | null;
    pubDate: string;
    source_id: string;
    source_name: string;
    creator: string[] | null;
}

export function normalizeArticle(article: INewsDataArticle): INewsArticle {
    return {
        title: article.title ?? '(no title)',
        description: article.description,
        url: article.link,
        source: article.source_name ?? article.source_id ?? '(unknown source)',
        author: article.creator?.join(', ') ?? null,
        publishedAt: article.pubDate,
        content: article.content,
    };
}
