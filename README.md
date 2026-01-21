# Toogle MCP

**Toogle** = **T**ana + G**oogle**

A unified [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that bridges Tana and Google services for AI agents.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-Protocol-blueviolet)
![Bun](https://img.shields.io/badge/Bun-Runtime-black?logo=bun)

## What is this?

This server acts as a **bridge** between AI coding assistants (like Claude, Cursor, or Windsurf) and your external tools:

- **Tana** – Semantic search across your personal knowledge graph
- **Google Calendar** – List and create events programmatically

Instead of asking an AI to run scripts, it can now call tools directly like `tana_search` or `calendar_add_event`.

## Tools

| Tool | Description |
|------|-------------|
| `tana_search` | Full-text or semantic search across your Tana workspace |
| `tana_node_show` | Retrieve full content of a specific Tana node by ID |
| `calendar_list_events` | List upcoming Google Calendar events |
| `calendar_add_event` | Create a new calendar event |

## Prerequisites

- [Bun](https://bun.sh/) runtime
- **[Supertag CLI](https://github.com/jcfischer/supertag-cli)** – Required for Tana integration. Created by [Jens-Christian Fischer](https://github.com/jcfischer), this excellent CLI provides the bridge to your Tana workspace.
- Google Cloud OAuth credentials (for Calendar access)
- [Ollama](https://ollama.ai/) running locally with `bge-m3` model (optional, for semantic search)

## Installation

```bash
git clone https://github.com/krshirkoohi/toogle-mcp.git
cd toogle-mcp
bun install
```

## Configuration

Add to your MCP config (e.g., `~/.gemini/antigravity/mcp_config.json`):

```json
{
  "mcpServers": {
    "antigravity": {
      "command": "/path/to/bun",
      "args": ["/path/to/antigravity-server/index.ts"],
      "env": {
        "SUPERTAG_PATH": "/path/to/supertag",
        "CALENDAR_TIMEZONE": "Europe/London",
        "GOOGLE_CLIENT_ID": "your-client-id",
        "GOOGLE_CLIENT_SECRET": "your-client-secret",
        "GOOGLE_REFRESH_TOKEN": "your-refresh-token"
      }
    }
  }
}
```

## Usage

Once configured, your AI agent will have access to the tools. Example prompts:

- *"Search my Tana for notes about project planning"*
- *"What's on my calendar this week?"*
- *"Add a meeting tomorrow at 3pm"*

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   AI Agent      │────▶│    Toogle MCP    │────▶│   Tana CLI  │
│ (Claude/Cursor) │     │      Server      │     │   (search)  │
└─────────────────┘     └──────────────────┘     └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │ Google API  │
                        │ (Calendar)  │
                        └─────────────┘
```

## Why MCP?

The Model Context Protocol allows AI assistants to **take actions** in the real world, not just generate text. This server demonstrates how to:

1. Wrap CLI tools as MCP endpoints
2. Authenticate with OAuth APIs
3. Return structured data to agents

## License

MIT

## Author

Built by Kavia Shirkoohi (shirkoohi.com) as part of the Antigravity project.
