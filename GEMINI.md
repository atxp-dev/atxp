# ATXP — Agent Transaction Protocol

You have access to ATXP paid tools. These are real services that cost a small amount per use (fractions of a cent to a few cents), billed to the configured ATXP account.

## Available Tools

| Tool | What it does | When to use it |
|------|-------------|----------------|
| **search** | Real-time web search | When you need current information, news, facts, or anything beyond your training data |
| **browse** | Fetch and read web pages | When you need the full content of a specific URL |
| **crawl** | Crawl websites recursively | When you need to explore an entire site or extract structured data from multiple pages |
| **research** | Deep multi-source research | When a topic requires synthesizing information from many sources |
| **image** | AI image generation | When the user asks you to create, generate, or make an image |
| **video** | AI video generation | When the user asks for a video or animation |
| **music** | AI music generation | When the user asks for music, a soundtrack, or audio |
| **x-search** | X/Twitter live search | When the user asks about trending topics, tweets, or social media discussions |
| **email** | Send and receive email | When the user asks to send email, check inbox, or manage messages |
| **code** | Execute code in a sandbox | When you need to run code in an isolated environment |
| **filestore** | Cloud file storage | When you need to store or retrieve files persistently |

## How to Use

Call the tools naturally. They are registered as MCP tools and available in your tool list. For example:
- To search: call the `search_search` tool with a `query` argument
- To generate an image: call the `image_create_image` tool with a `prompt` argument
- To send email: call the `email_send_email` tool with `to`, `subject`, and `body` arguments

## Setting Up a New ATXP Account

If the user doesn't have an ATXP account yet, they can create one instantly:

```bash
# Self-register as an agent (no browser needed)
npx atxp agent register

# Or create an account at https://accounts.atxp.ai
```

Self-registration gives the agent:
- A wallet with 10 IOU tokens to start
- A unique email address ({agentId}@atxp.email)
- A connection token for authentication

After registration, extract the `connection_token` and `account_id` from the connection string and configure them in this extension's settings.

## Checking Balance and Funding

```bash
npx atxp balance          # Check current balance
npx atxp fund             # Show funding options (crypto addresses + payment link)
npx atxp fund --amount 50 # Request a $50 payment link
npx atxp transactions     # View recent transactions
npx atxp whoami           # Show account info
```

The `fund` command returns both crypto deposit addresses (USDC on Base, World, Polygon) and a shareable Stripe payment link. Choose based on context:
- **Payment link**: Share with a human to fund via credit card
- **Crypto deposit**: For direct USDC transfers between agents or wallets

## Billing

All tool calls are billed per use to the ATXP account. Costs are small (typically $0.001–$0.05 per call depending on the tool). The account balance is in USDC stablecoins.

## More Information

- Website: https://atxp.ai
- Documentation: https://docs.atxp.ai
- Tool catalog: https://docs.atxp.ai/tools
- CLI: https://www.npmjs.com/package/atxp
