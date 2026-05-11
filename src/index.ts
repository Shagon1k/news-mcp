import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "news-mcp",
  version: "1.0.0",
});

// Tools will be registered here

const transport = new StdioServerTransport();
await server.connect(transport);
