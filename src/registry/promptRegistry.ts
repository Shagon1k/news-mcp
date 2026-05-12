import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

interface PromptMessage {
    role: 'user' | 'assistant';
    content: {
        type: 'text';
        text: string;
    };
}

interface PromptDefinition {
    name: string;
    title: string;
    description: string;
    handler: () => { messages: PromptMessage[] };
}

export class PromptRegistry {
    constructor(private server: McpServer) { }

    registerPrompt(definition: PromptDefinition): void {
        const { name, title, description, handler } = definition;
        this.server.registerPrompt(name, { title, description }, handler);
    }

    registerPrompts(definitions: PromptDefinition[]): void {
        definitions.forEach((definition) => this.registerPrompt(definition));
    }
}
