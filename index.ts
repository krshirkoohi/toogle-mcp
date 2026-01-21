#!/usr/bin/env bun
/**
 * Antigravity MCP Server
 * 
 * A unified MCP server that wraps:
 * - Tana Supertag CLI (search, node inspection)
 * - Google Calendar (list, add events)
 * 
 * This provides clean, native tools for AI agents.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { tanaSearch, tanaNodeShow } from './tools/tana.js';
import { listCalendarEvents, addCalendarEvent } from './tools/calendar.js';

// Initialize MCP Server
const server = new Server(
    {
        name: 'toogle',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'tana_search',
                description: 'Search the Tana workspace for notes, projects, goals, etc. Uses fast structural search by default.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'The search query',
                        },
                        tag: {
                            type: 'string',
                            description: 'Optional: Filter by Tana supertag',
                        },
                        semantic: {
                            type: 'boolean',
                            description: 'Optional: Use AI semantic search (requires Ollama to be running locally)',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'tana_node_show',
                description: 'Get the full details of a specific Tana node by its ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeId: {
                            type: 'string',
                            description: 'The Tana node ID (e.g., CAR6WhL8Es8E)',
                        },
                    },
                    required: ['nodeId'],
                },
            },
            {
                name: 'calendar_list_events',
                description: 'List upcoming Google Calendar events',
                inputSchema: {
                    type: 'object',
                    properties: {
                        maxResults: {
                            type: 'number',
                            description: 'Maximum number of events to return (default: 10)',
                        },
                    },
                },
            },
            {
                name: 'calendar_add_event',
                description: 'Add a new event to Google Calendar',
                inputSchema: {
                    type: 'object',
                    properties: {
                        summary: {
                            type: 'string',
                            description: 'Event title',
                        },
                        startTime: {
                            type: 'string',
                            description: 'Start time in ISO 8601 format (e.g., 2026-01-22T10:00:00)',
                        },
                        endTime: {
                            type: 'string',
                            description: 'End time in ISO 8601 format',
                        },
                        description: {
                            type: 'string',
                            description: 'Optional event description',
                        },
                    },
                    required: ['summary', 'startTime', 'endTime'],
                },
            },
        ],
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (!args) {
        return {
            content: [{ type: 'text', text: `Missing arguments for tool: ${name}` }],
            isError: true,
        };
    }

    try {
        switch (name) {
            case 'tana_search': {
                const result = await tanaSearch(
                    args.query as string,
                    args.tag as string | undefined,
                    args.semantic as boolean | undefined
                );
                if (result.error) {
                    return { content: [{ type: 'text', text: `Error: ${result.error}` }], isError: true };
                }
                return { content: [{ type: 'text', text: result.results }] };
            }

            case 'tana_node_show': {
                const result = await tanaNodeShow(args.nodeId as string);
                if (result.error) {
                    return { content: [{ type: 'text', text: `Error: ${result.error}` }], isError: true };
                }
                return { content: [{ type: 'text', text: result.content }] };
            }

            case 'calendar_list_events': {
                const events = await listCalendarEvents(args.maxResults as number | undefined);
                const formatted = events
                    .map((e) => `• ${e.start} - ${e.summary}`)
                    .join('\n');
                return { content: [{ type: 'text', text: formatted || 'No upcoming events.' }] };
            }

            case 'calendar_add_event': {
                const event = await addCalendarEvent(
                    args.summary as string,
                    args.startTime as string,
                    args.endTime as string,
                    args.description as string | undefined
                );
                return {
                    content: [
                        { type: 'text', text: `✓ Created event: "${event.summary}" at ${event.start}` },
                    ],
                };
            }

            default:
                return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
        }
    } catch (error) {
        return {
            content: [{ type: 'text', text: `Tool error: ${String(error)}` }],
            isError: true,
        };
    }
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Antigravity MCP Server running on stdio');
}

main().catch(console.error);
