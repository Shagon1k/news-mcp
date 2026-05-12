import type { INewsProvider, INewsParams } from './provider.js';
import { NewsRateLimitError } from './provider.js';
import { newsdataProvider } from './newsdata/queries.js';
import { newsapiProvider } from './newsapi/queries.js';
import { gnewsProvider } from './gnews/queries.js';
import type { INewsArticle } from '../types.js';

const PROVIDERS_BY_NAME: Record<string, INewsProvider> = {
    newsdata: newsdataProvider,
    newsapi: newsapiProvider,
    gnews: gnewsProvider,
};

const PRIORITY: INewsProvider[] = [newsdataProvider, newsapiProvider, gnewsProvider];

function resolveProviders(): INewsProvider[] {
    const preferred = process.env.NEWS_PROVIDER?.trim().toLowerCase();
    if (preferred) {
        const preferredProvider = PROVIDERS_BY_NAME[preferred];
        if (!preferredProvider) {
            throw new Error(`Unknown NEWS_PROVIDER: "${preferred}". Valid values: ${Object.keys(PROVIDERS_BY_NAME).join(', ')}`);
        }
        const rest = PRIORITY.filter((p) => p.name !== preferred);
        return [preferredProvider, ...rest].filter((p) => p.isAvailable());
    }
    return PRIORITY.filter((p) => p.isAvailable());
}

export function validateProviders(): void {
    const preferred = process.env.NEWS_PROVIDER?.trim().toLowerCase();

    if (preferred && !PROVIDERS_BY_NAME[preferred]) {
        console.error(`[news-mcp] ERROR: Unknown NEWS_PROVIDER "${preferred}". Valid values: ${Object.keys(PROVIDERS_BY_NAME).join(', ')}`);
        process.exit(1);
    }

    for (const provider of PRIORITY) {
        if (!provider.isAvailable()) {
            const isPreferred = provider.name === preferred;
            console.error(`[news-mcp] ${isPreferred ? 'WARNING: Preferred provider' : 'WARNING: Provider'} "${provider.name}" has no API key configured and will be skipped`);
        }
    }

    const available = PRIORITY.filter((p) => p.isAvailable());
    if (available.length === 0) {
        console.error('[news-mcp] ERROR: No news providers are configured. Set at least one of: NEWSDATA_IO_KEY, NEWSAPI_ORG_KEY, GNEWS_API_KEY');
        process.exit(1);
    }
}

export async function fetchNews(params: INewsParams): Promise<INewsArticle[]> {
    const providers = resolveProviders();

    if (providers.length === 0) {
        throw new Error('No news providers are configured. Set at least one of: NEWSDATA_IO_KEY, NEWSAPI_ORG_KEY, GNEWS_API_KEY');
    }

    if (!params.query && !params.isHeadlines) {
        throw new Error('Provide either a search query or set isHeadlines to true');
    }

    const preferred = process.env.NEWS_PROVIDER?.trim().toLowerCase();
    let lastError: unknown;

    for (const provider of providers) {
        try {
            const articles = await provider.fetchNews(params);
            if (preferred && provider.name !== preferred) {
                console.error(`[news-mcp] Preferred provider "${preferred}" was unavailable; used "${provider.name}" instead`);
            }
            return articles;
        } catch (err) {
            if (err instanceof NewsRateLimitError) {
                console.error(`[news-mcp] Provider "${provider.name}" rate limited, trying next...`);
                lastError = err;
                continue;
            }
            throw err;
        }
    }

    throw lastError ?? new Error('All providers failed');
}
