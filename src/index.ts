#!/usr/bin/env node
import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ToolRegistry } from './registry/toolRegistry.js';
import { newsTools } from './tools.js';

const server = new McpServer({
    name: 'news-mcp',
    version: '1.0.0',
});

const toolRegistry = new ToolRegistry(server);
toolRegistry.registerTools(newsTools);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('News MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
