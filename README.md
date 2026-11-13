# StoryShort MCP

[![Official MCP Registry](https://img.shields.io/badge/MCP%20Registry-app.storyshort%2Fstoryshort-blue)](https://registry.modelcontextprotocol.io/v0.1/servers?search=storyshort)

Turn a story idea into a narrated faceless short video (script, AI voiceover, AI scene images, captions) from any AI assistant that speaks MCP. The primary way to use it is the **hosted remote MCP server** of [StoryShort](https://storyshort.app) (nothing to install). This repository also holds the MIT-licensed source of the **local stdio server** (`@storyshort/mcp-server` on npm), which wraps the StoryShort public API `/api/v1` with a smaller set of tools than the hosted server.

StoryShort (storyshort.app) is independent of storyshort.ai, a different company.

- **Endpoint:** `https://storyshort.app/api/mcp` (Streamable HTTP)
- **Registry name:** `app.storyshort/storyshort` ([Official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=storyshort))
- **Auth:** OAuth 2.0 with PKCE and dynamic client registration (discovered from `/.well-known/oauth-protected-resource`), or a StoryShort API key as `Authorization: Bearer sk_live_...`
- **Docs and API keys:** https://storyshort.app/en/developers
- **Also on npm** as a stdio server: `npx -y @storyshort/mcp-server` with `STORYSHORT_API_KEY` set (source in `src/`)

## What you need

A StoryShort account. The server is a connector to your own account, not a free video generator: drafts are free, renders spend credits from your balance. See https://storyshort.app/en/pricing for the live plans and prices.

## Connect

**Claude Code**

```bash
claude mcp add --transport http storyshort https://storyshort.app/api/mcp
```

then run `/mcp` and authenticate `storyshort` (a browser opens: sign in and allow).

**Gemini CLI**

```bash
gemini extensions install https://github.com/airdropfi/storyshort-gemini-extension
```

**VS Code** (`.vscode/mcp.json`)

```json
{
  "servers": {
    "storyshort": { "type": "http", "url": "https://storyshort.app/api/mcp" }
  }
}
```

**Any other client that supports remote (Streamable HTTP) servers**: add the URL above. If the client cannot do OAuth, create an API key in the StoryShort dashboard and send it as `Authorization: Bearer sk_live_...`.

## What the tools cover

29 tools, each with a title and read-only / destructive annotations:

| Area | Tools |
|---|---|
| Draft and render | `draft_video`, `get_draft`, `update_draft`, `revise_scene`, `render_draft`, `create_video`, `get_video`, `list_videos`, `cancel_video`, `quote_video`, `list_niches` |
| Series | `create_series`, `list_series`, `update_series`, `pause_series`, `resume_series`, `get_series_performance`, `plan_drama_season`, `get_season_plan`, `save_season_plan` |
| Characters | `create_character_sheet`, `get_character_sheet`, `select_character_image`, `quote_character_episode`, `create_character_episode` |
| Account and publishing | `get_credit_balance`, `list_social_accounts`, `get_connection_status`, `publish_video` |

Rules the server enforces: a draft is free and renders nothing; a render that the balance cannot pay is refused before it starts; impersonation of real people, protected characters and sexual content are refused. Videos use AI-generated images and a synthetic voice: switch on the platform's AI-content label when you post. No result or performance is promised.

## Related

- Gemini CLI extension: https://github.com/airdropfi/storyshort-gemini-extension
- Privacy: https://storyshort.app/en/privacy · Terms: https://storyshort.app/en/terms · Support: support@storyshort.app

## Run the stdio server from source

```bash
npm ci && npm run build
STORYSHORT_API_KEY=sk_live_... node dist/index.js      # or: docker build -t storyshort-mcp . && docker run -i -e STORYSHORT_API_KEY storyshort-mcp
```

The stdio server registers 8 tools (generate video, get video, list videos, list niches, credit balance, usage stats, subscription, list API keys), 2 prompts and 2 resources. Without an API key it still starts and answers `tools/list` (no network needed), but every tool call is refused until a key is set. The hosted remote server above exposes the fuller tool set listed in the table.

## About this repository

It holds the registry metadata (`server.json`, identical to the published registry entry), documentation and the source of the stdio server (`src/`, `tests/`, `Dockerfile`). The hosted server's own code runs at storyshort.app and is closed source. MIT license covers the contents of this repository.
