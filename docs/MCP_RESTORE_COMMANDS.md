# MCP Servers - Restore Commands

These MCP servers were disabled to save context tokens (~45k tokens saved).

## To Re-Enable:

### DataForSEO (SEO analysis tools) - ~35k tokens
```bash
claude mcp add dataforseo -s user -- cmd /c npx -y dataforseo-mcp-server
```

### Chrome DevTools (browser debugging) - ~4k tokens
```bash
claude mcp add chrome-devtools -s user -- cmd /c npx chrome-devtools-mcp@latest --isolated
```

### Puppeteer (browser automation) - ~1k tokens
```bash
claude mcp add puppeteer -s user -- cmd /c npx -y @modelcontextprotocol/server-puppeteer
```

### N8N (workflow automation) - ~2.5k tokens
```bash
claude mcp add n8n-mcp -s user -- cmd /c npx -y n8n-mcp
```

### Gemini Imagen4 (image generation) - broken, don't restore
```bash
# claude mcp add gemini-imagen4 -s user -- cmd /c npx -y gemini-imagen4
```

## Currently Active MCP Servers:
- context7 - Documentation lookup (~1k tokens)
- playwright - Browser testing (~3k tokens)
- sequential-thinking - Complex reasoning (~1k tokens)
- memory - Knowledge graph (~1.5k tokens)

## Quick Restore All:
```bash
claude mcp add dataforseo -s user -- cmd /c npx -y dataforseo-mcp-server && claude mcp add chrome-devtools -s user -- cmd /c npx chrome-devtools-mcp@latest --isolated && claude mcp add puppeteer -s user -- cmd /c npx -y @modelcontextprotocol/server-puppeteer && claude mcp add n8n-mcp -s user -- cmd /c npx -y n8n-mcp
```
