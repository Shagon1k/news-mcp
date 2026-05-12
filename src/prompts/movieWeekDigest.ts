export const movieWeekDigestPrompt = {
    name: 'movie-week-digest',
    title: 'Movie Week Digest',
    description: 'Fetches the top 10 most popular and interesting movie news of the week and presents them as a digest.',
    handler: () => ({
        messages: [
            {
                role: 'user' as const,
                content: {
                    type: 'text' as const,
                    text: `
                        Fetch the top 10 most popular and interesting movie news from this week.

                        Use the fetch_news tool with:
                        - query: "movie" (feel free to also try "film" or "cinema" to get richer results if needed)
                        - pageSize: 10
                        - sortBy: popularity or relevance if available

                        Present the results as a weekly digest with the following structure for each article:
                        - A numbered headline (bold or prominent)
                        - Source and publication date
                        - A 1–2 sentence summary of what the article is about
                        - The article URL

                        At the end, add a short "Editor's Pick" note highlighting the single most exciting story of the week and why.`,
                },
            },
        ],
    }),
};
