# Installing the StoryShort MCP server in Cline

StoryShort (https://storyshort.app) is a remote MCP server (Streamable HTTP). Do not clone or
build anything.

1. Add this entry to `cline_mcp_settings.json` (MCP Servers > Configure MCP Servers):

   ```json
   {
     "mcpServers": {
       "storyshort": {
         "type": "streamableHttp",
         "url": "https://storyshort.app/api/mcp",
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

   `type` must be `streamableHttp` (otherwise Cline assumes legacy SSE).
2. The server asks for sign-in on first use (OAuth). Approve the browser sign-in at storyshort.app.
   If OAuth is not available in your Cline build, the user creates an API key at
   https://storyshort.app/en/developers and you add
   `"headers": { "Authorization": "Bearer <their key>" }` to the entry. Never invent a key.
3. Verify by calling `get_credit_balance`.

Rules: drafts are free; renders spend the user's credits. Call `quote_video` and get the user's
explicit yes before any render. Scenes and voice are AI-generated.
