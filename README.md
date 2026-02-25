# ATXP — Gemini CLI Extension

Give your Gemini CLI agent a wallet, email, phone number, and instant access to paid MCP tools — web search, image/video/music generation, X/Twitter search, SMS, voice calls, code execution, file storage, and more.

[ATXP](https://atxp.ai) (Agent Transaction Protocol) lets AI agents pay for their own tools and services without managing API keys. Self-register in one command, pay per use.

## Install

```bash
gemini extensions install https://github.com/atxp-dev/atxp
```

> **Note:** After installing, start a new Gemini CLI session for the extension tools to load. Extensions installed mid-session aren't hot-reloaded.

## Setup

### Option 1: Agent self-registration (recommended)

No browser, no human login needed. After installing the extension, start a new session and ask your Gemini agent:

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

| Category | Tools | Description |
|----------|-------|-------------|
| **Account** | Register, Login, Whoami, Balance, Fund, Transactions | Self-register, check balance, get funding options |
| **Search** | Web Search, X/Twitter Search | Real-time web and social search |
| **Media** | Image, Video, Music | AI generation (returns URLs) |
| **Email** | Inbox, Read, Send, Reply, Search, Delete, Attachments, Username | Full email with @atxp.email address |
| **Phone** | Register, SMS, Send SMS, Voice Call, Call History, Search | SMS and AI-powered voice calls |
| **Contacts** | Add, List, Show, Edit, Remove, Search, Push, Pull | Local contacts with cloud sync |
| **Agents** | Create, List | Manage sub-agents |

### Remote MCP Tools (requires settings)

| Tool | Description |
|------|-------------|
| **Browse** | Fetch and read web page content |
| **Crawl** | Crawl websites and extract structured data |
| **Research** | Deep multi-source research and synthesis |
| **Code** | Execute code in a sandbox |
| **File Store** | Persistent cloud file storage |
| **Phone** | SMS, voice calls via MCP proxy |

## Usage

Just ask your Gemini agent naturally:

```
Search the web for the latest AI research papers
```

```
Generate an image of a sunset over mountains
```

```
Send an SMS to +1234567890 saying "Hello from my AI agent"
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

All tools are pay-per-use, billed to your ATXP account in USDC. Typical costs:

| Action | Cost |
|--------|------|
| Web/X search, image gen | $0.001–$0.05 |
| Send email | $0.01 |
| Send SMS | $0.05 |
| Voice call | $0.10 |
| Claim email username | $1.00 |
| Register phone number | $2.00 |

No subscriptions, no API keys to manage.

## Links

- [ATXP Website](https://atxp.ai)
- [Documentation](https://docs.atxp.ai)
- [Tool Catalog](https://docs.atxp.ai/tools)
- [CLI on npm](https://www.npmjs.com/package/atxp)
- [Account Portal](https://accounts.atxp.ai)

## License

MIT
