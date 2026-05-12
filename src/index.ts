import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ToolRegistry } from './registry/toolRegistry.js';
import { PromptRegistry } from './registry/promptRegistry.js';
import { newsTools } from './tools.js';
import { allPrompts } from './prompts/index.js';
import { validateProviders } from './providers/index.js';

const server = new McpServer({
    name: 'news-mcp',
    version: '1.0.0',
    description: 'News Search MCP with different providers and automatic switching.'
});

const toolRegistry = new ToolRegistry(server);
const promptRegistry = new PromptRegistry(server);

toolRegistry.registerTools(newsTools);
promptRegistry.registerPrompts(allPrompts);

async function main() {
    validateProviders();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('News MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
