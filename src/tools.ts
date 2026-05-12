import { z } from 'zod';
import { fetchNews } from './providers/index.js';
import type { INewsArticle } from './types.js';

export const newsTools = [
    {
        name: 'fetch_news',
        description: `Fetch news articles from available providers.


            Parameters:
            - query: string — keywords or phrases to search for in article titles and body
            - isHeadlines: boolean — fetch top headlines instead of searching; at least one of query or isHeadlines must be provided
            - language: string — language code for articles (e.g. "en", "fr", "de")
            - country: string — 2-letter ISO country code (e.g. "us", "gb"); support varies by provider
            - from: string — oldest article date in ISO 8601 format (e.g. "2024-01-01" or "2024-01-01T00:00:00")
            - to: string — newest article date in ISO 8601 format
            - pageSize: number — number of results to return (1–100, default 10)
            - page: number — page number for pagination (default 1)
            - domains: string — comma-separated domains to restrict results to (e.g. "bbc.co.uk,techcrunch.com")
            - excludeDomains: string — comma-separated domains to exclude from results

            Returns a list of articles with fields:
            - title: string — article headline
            - description: string — short summary or lead paragraph
            - url: string — link to the full article
            - source: string — publication name
            - author: string — author name(s)
            - publishedAt: string — publication datetime in ISO 8601 format
            - content: string — truncated article body (full content may require a direct fetch)
        `,
        inputSchema: {
            query: z.string().max(500).optional()
                .describe('Keywords or phrases to search for in article title and body. Required if isHeadlines is not set.'),
            isHeadlines: z.boolean().optional()
                .describe('Fetch top headlines instead of searching. Required if query is not provided.'),
            language: z.string().optional()
                .describe('Language code for articles (e.g. "en", "fr", "de").'),
            country: z.string().optional()
                .describe('2-letter ISO country code to filter by (e.g. "us", "gb"). Support varies by provider.'),
            from: z.string().optional()
                .describe('Oldest article date (ISO 8601, e.g. "2024-01-01" or "2024-01-01T00:00:00").'),
            to: z.string().optional()
                .describe('Newest article date (ISO 8601).'),
            pageSize: z.number().int().min(1).max(100).default(10)
                .describe('Number of results to return (1–100). Default is 10 (free-tier limit for some providers).'),
            page: z.number().int().min(1).default(1)
                .describe('Page number for pagination.'),
            domains: z.string().optional()
                .describe('Comma-separated domains to restrict results to (e.g. "bbc.co.uk,techcrunch.com").'),
            excludeDomains: z.string().optional()
                .describe('Comma-separated domains to exclude from results.'),
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
