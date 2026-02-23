# ATXP — Gemini CLI Extension

Give your Gemini CLI agent a wallet, email, and instant access to paid MCP tools — web search, image/video/music generation, X/Twitter search, code execution, file storage, and more.

[ATXP](https://atxp.ai) (Agent Transaction Protocol) lets AI agents pay for their own tools and services without managing API keys. Self-register in one command, pay per use.

## Install

```bash
gemini extensions install https://github.com/atxp-dev/gemini-cli-extension
```

## Setup

### Option 1: Agent self-registration (recommended)

No browser, no human login needed. After installing the extension, just ask your Gemini agent:

```
Register me on ATXP so I can use paid tools
```

The agent calls the `atxp_register` tool, which creates an account instantly with:
- 10 IOU tokens to start
- A unique email address
- An Ethereum wallet
- A connection string (saved automatically)

No settings to configure — the agent is ready to use all tools immediately.

### Option 2: Use an existing ATXP account

If you already have an ATXP account from [accounts.atxp.ai](https://accounts.atxp.ai), extract the values from your connection string:

```
https://accounts.atxp.ai?connection_token=<YOUR_TOKEN>&account_id=<YOUR_ACCOUNT_ID>
```

Enter these when prompted during extension setup. This enables both local tools and remote MCP proxy tools.

## Available Tools

Once configured, these tools are available to your Gemini agent:

### Local Tools (always available after registration)

| Tool | Description |
|------|-------------|
| **Register** | Self-register as an ATXP agent |
| **Balance** | Check account balance |
| **Fund** | Get funding options (crypto + payment link) |
| **Search** | Real-time web search |
| **Image** | AI image generation |
| **Video** | AI video generation |
| **Music** | AI music generation |
| **X Search** | Live X/Twitter search |
| **Email** | Send and receive emails |

### Remote MCP Tools (requires settings)

| Tool | Description |
|------|-------------|
| **Browse** | Fetch and read web page content |
| **Crawl** | Crawl websites and extract structured data |
| **Research** | Deep multi-source research and synthesis |
| **Code** | Execute code in a sandbox |
| **File Store** | Persistent cloud file storage |

## Usage

Just ask your Gemini agent naturally:

```
Search the web for the latest AI research papers
```

```
Generate an image of a sunset over mountains
```

```
Check my ATXP email inbox
```

```
Run this Python script in a sandbox
```

The agent uses the appropriate ATXP tool automatically.

## Managing Your Account

Use the built-in tools or the ATXP CLI:

```bash
npx atxp@latest balance          # Check balance
npx atxp@latest fund             # Show funding options
npx atxp@latest transactions     # View transaction history
npx atxp@latest whoami           # Show account info
```

## Billing

All tools are pay-per-use, billed to your ATXP account in USDC. Costs are small — typically $0.001 to $0.05 per tool call. No subscriptions, no API keys to manage.

## Links

- [ATXP Website](https://atxp.ai)
- [Documentation](https://docs.atxp.ai)
- [Tool Catalog](https://docs.atxp.ai/tools)
- [CLI on npm](https://www.npmjs.com/package/atxp)
- [Account Portal](https://accounts.atxp.ai)

## License

MIT
