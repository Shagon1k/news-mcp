import { z } from 'zod';
import { fetchNews } from './providers/newsapi/queries.js';
import type { INewsArticle } from './types.js';

export const newsTools = [
    {
        name: 'fetch_news',
        description: `Fetch news articles from NewsAPI.org.
            Automatically uses the top-headlines endpoint when country or category is provided,
            and the everything endpoint for open keyword search.

            Returns articles with: title, description, url, source, author, publishedAt, content.
        `,
        inputSchema: {
            // Shared
            query: z.string().max(500).optional()
                .describe('Keywords or phrases to search for in article title and body. Supports AND/OR/NOT operators and exact phrases.'),
            sources: z.string().optional()
                .describe('Comma-separated news source IDs (e.g. "bbc-news,cnn"). Cannot be combined with country or category.'),
            pageSize: z.number().int().min(1).max(100).default(20)
                .describe('Number of results to return (1–100).'),
            page: z.number().int().min(1).default(1)
                .describe('Page number for pagination.'),

            // top-headlines only
            category: z.enum(['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology']).optional()
                .describe('Category of top headlines. Cannot be combined with sources.'),
            country: z.string().length(2).optional()
                .describe('2-letter ISO 3166-1 country code for top headlines (e.g. "us", "gb"). Cannot be combined with sources.'),

            // everything only
            searchIn: z.enum(['title', 'description', 'content']).optional()
                .describe('Restrict keyword search to a specific article field. Only for keyword search.'),
            domains: z.string().optional()
                .describe('Comma-separated domains to restrict results to (e.g. "bbc.co.uk,techcrunch.com"). Only for keyword search.'),
            excludeDomains: z.string().optional()
                .describe('Comma-separated domains to exclude. Only for keyword search.'),
            from: z.string().optional()
                .describe('Oldest article date (ISO 8601, e.g. "2024-01-01" or "2024-01-01T00:00:00"). Only for keyword search.'),
            to: z.string().optional()
                .describe('Newest article date (ISO 8601). Only for keyword search.'),
            language: z.enum(['ar', 'de', 'en', 'es', 'fr', 'he', 'it', 'nl', 'no', 'pt', 'ru', 'sv', 'ud', 'zh']).optional()
                .describe('Language of articles (ISO 639-1 code). Only for keyword search.'),
            sortBy: z.enum(['relevancy', 'popularity', 'publishedAt']).default('publishedAt')
                .describe('Sort order for results. Only for keyword search.'),
        },
        handler: async (input: any) => {
            return await fetchNews(input);
        },
        formatOutput: (articles: INewsArticle[]) => {
            if (articles.length === 0) {
                return {
                    content: [{ type: 'text', text: 'No articles found.' }],
                    structuredContent: { articles: [] },
                };
            }

            const formatted = articles.map((a, i) =>
                `--- Article ${i + 1} ---\n` +
                `Title:     ${a.title}\n` +
                `Source:    ${a.source}${a.author ? ` · ${a.author}` : ''}\n` +
                `Published: ${a.publishedAt}\n` +
                `URL:       ${a.url}\n` +
                (a.description ? `Summary:   ${a.description}` : '')
            ).join('\n\n');

            return {
                content: [{ type: 'text', text: formatted }],
                structuredContent: { articles },
            };
        },
    },
];
