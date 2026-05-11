import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

type ToolHandler<TInput = any, TOutput = any> = (input: TInput) => Promise<TOutput>;

interface ToolDefinition<TInput = any, TOutput = any> {
    name: string;
    description: string;
    inputSchema: any;
    handler: ToolHandler<TInput, TOutput>;
    formatOutput?: (result: TOutput) => { content: any[]; structuredContent?: any };
}

export class ToolRegistry {
    constructor(private server: McpServer) { }

    registerTool<TInput = any, TOutput = any>(
        definition: ToolDefinition<TInput, TOutput>
    ): void {
        const { name, description, inputSchema, handler, formatOutput } = definition;

        this.server.registerTool(
            name,
            { description, inputSchema },
            async (input: any) => {
                const result = await handler(input);

                if (formatOutput) {
                    return formatOutput(result);
                }

                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                    structuredContent: result,
                };
            }
        );
    }

    registerTools(definitions: ToolDefinition[]): void {
        definitions.forEach((definition) => this.registerTool(definition));
    }
}
