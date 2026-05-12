# news-mcp

MCP server for fetching news articles. Supports multiple providers with automatic fallback.

## Providers

| Provider | Key variable | Notes |
|---|---|---|
| [Newsdata.io](https://newsdata.io) | `NEWSDATA_IO_KEY` | Priority 1 |
| [NewsAPI.org](https://newsapi.org) | `NEWSAPI_ORG_KEY` | Priority 2 |
| [GNews](https://gnews.io) | `GNEWS_API_KEY` | Priority 3 |

The server uses the first available provider in priority order. If a provider hits its rate limit, it falls through to the next one automatically.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in at least one API key in `.env`:

```env
NEWSDATA_IO_KEY=your_key
NEWSAPI_ORG_KEY=your_key
GNEWS_API_KEY=your_key

# Optional: pin a specific provider (newsdata | newsapi | gnews)
NEWS_PROVIDER=
```

## Running

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Claude Desktop config

```json
{
  "mcpServers": {
    "news-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/news-mcp/build/index.js"],
      "env": {
        "NEWSDATA_IO_KEY": "your_key",
        "NEWSAPI_ORG_KEY": "your_key",
        "GNEWS_API_KEY": "your_key"
      }
    }
  }
}
```

## Tool

### `fetch_news`

Fetches news articles from the active provider.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | string | One of `query` / `isHeadlines` | Keywords to search for. Max 200 chars. |
| `isHeadlines` | boolean | One of `query` / `isHeadlines` | Fetch top headlines instead of searching. |
| `language` | string | No | 2-letter language code (e.g. `en`, `fr`). |
| `country` | string | No | 2-letter country code (e.g. `us`, `gb`). Support varies by provider. |
| `from` | string | No | Oldest article date (ISO 8601). |
| `to` | string | No | Newest article date (ISO 8601). |
| `pageSize` | number | No | Results to return (1–100, default **10**). Free tiers may cap lower. |
| `page` | number | No | Page number for pagination (default 1). |
| `domains` | string | No | Comma-separated domains to include (e.g. `bbc.co.uk,techcrunch.com`). |
| `excludeDomains` | string | No | Comma-separated domains to exclude. |

Returns articles with: `title`, `description`, `url`, `source`, `author`, `publishedAt`, `content`.

## Prompts

### `movie-week-digest`

Fetches the 10 most popular movie news stories of the week and presents them as a formatted digest with an Editor's Pick highlight.
