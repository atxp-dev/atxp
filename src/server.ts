#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_PATH = join(homedir(), ".atxp", "config");

/**
 * Get ATXP_CONNECTION from env or ~/.atxp/config
 */
function getConnection(): string | null {
  if (process.env.ATXP_CONNECTION) return process.env.ATXP_CONNECTION;

  if (existsSync(CONFIG_PATH)) {
    const content = readFileSync(CONFIG_PATH, "utf-8");
    const match = content.match(/^ATXP_CONNECTION=(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

/**
 * Run an npx atxp command and return the output
 */
function runAtxp(args: string, timeoutMs = 30000): string {
  const env = { ...process.env };
  const conn = getConnection();
  if (conn) env.ATXP_CONNECTION = conn;

  try {
    const output = execSync(`npx atxp@latest ${args}`, {
      encoding: "utf-8",
      timeout: timeoutMs,
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return output.trim();
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    const stderr = err.stderr?.trim() || "";
    const stdout = err.stdout?.trim() || "";
    return stdout || stderr || err.message || "Command failed";
  }
}

const server = new McpServer({
  name: "atxp",
  version: "1.0.0",
});

// --- Account Management ---

server.tool(
  "atxp_register",
  "Self-register as a new ATXP agent. Creates an account instantly with a wallet, email, 10 IOU tokens, and a connection string. No human login needed.",
  {},
  async () => {
    const output = runAtxp("agent register", 60000);
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_login",
  "Authenticate with an ATXP connection string. Saves credentials to ~/.atxp/config.",
  { connection_string: z.string().describe("The full ATXP connection string URL") },
  async ({ connection_string }) => {
    const output = runAtxp(`login --token "${connection_string}"`, 30000);
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_whoami",
  "Show account info: ID, type, email, wallet address, owner.",
  {},
  async () => {
    const output = runAtxp("whoami");
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_balance",
  "Check ATXP account balance across all chains. Free to call.",
  {},
  async () => {
    const output = runAtxp("balance");
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_fund",
  "Show all funding options: crypto deposit addresses (USDC on Base, World, Polygon) and a shareable Stripe payment link (for agent accounts). Free to call.",
  { amount: z.number().optional().describe("Suggested payment link amount in USD (1-1000, default 10)") },
  async ({ amount }) => {
    const args = amount ? `fund --amount ${amount}` : "fund";
    const output = runAtxp(args);
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_transactions",
  "View recent transaction history. Free to call.",
  { limit: z.number().optional().describe("Number of transactions to show (default 10)") },
  async ({ limit }) => {
    const args = limit ? `transactions --limit ${limit}` : "transactions";
    const output = runAtxp(args);
    return { content: [{ type: "text", text: output }] };
  }
);

// --- Paid API Tools ---

server.tool(
  "atxp_search",
  "Real-time web search. Returns current results from the web. Paid per use.",
  { query: z.string().describe("Search query") },
  async ({ query }) => {
    const output = runAtxp(`search "${query.replace(/"/g, '\\"')}"`, 30000);
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_image",
  "Generate an AI image from a text prompt. Returns an image URL. Paid per use.",
  { prompt: z.string().describe("Image generation prompt") },
  async ({ prompt }) => {
    const output = runAtxp(`image "${prompt.replace(/"/g, '\\"')}"`, 60000);
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_video",
  "Generate an AI video from a text prompt. Returns a video URL. Paid per use.",
  { prompt: z.string().describe("Video generation prompt") },
  async ({ prompt }) => {
    const output = runAtxp(`video "${prompt.replace(/"/g, '\\"')}"`, 120000);
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_music",
  "Generate AI music from a text prompt. Returns a music URL. Paid per use.",
  { prompt: z.string().describe("Music generation prompt") },
  async ({ prompt }) => {
    const output = runAtxp(`music "${prompt.replace(/"/g, '\\"')}"`, 120000);
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_x_search",
  "Search X/Twitter for live posts and discussions. Paid per use.",
  { query: z.string().describe("X/Twitter search query") },
  async ({ query }) => {
    const output = runAtxp(`x "${query.replace(/"/g, '\\"')}"`, 30000);
    return { content: [{ type: "text", text: output }] };
  }
);

// --- Email ---

server.tool(
  "atxp_email_inbox",
  "Check the agent's email inbox. Free to call. Each agent has a unique @atxp.email address.",
  {},
  async () => {
    const output = runAtxp("email inbox");
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_email_read",
  "Read a specific email message by ID. Free to call.",
  { message_id: z.string().describe("The message ID to read") },
  async ({ message_id }) => {
    const output = runAtxp(`email read ${message_id}`);
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_email_send",
  "Send an email from the agent's @atxp.email address. Costs $0.01 per email.",
  {
    to: z.string().describe("Recipient email address"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body text"),
  },
  async ({ to, subject, body }) => {
    const output = runAtxp(
      `email send --to "${to}" --subject "${subject.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}"`,
      30000
    );
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_email_reply",
  "Reply to an email by message ID. Costs $0.01 per reply.",
  {
    message_id: z.string().describe("The message ID to reply to"),
    body: z.string().describe("Reply body text"),
  },
  async ({ message_id, body }) => {
    const output = runAtxp(
      `email reply ${message_id} --body "${body.replace(/"/g, '\\"')}"`,
      30000
    );
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_email_search",
  "Search emails by subject or sender. Free to call.",
  { query: z.string().describe("Search query for emails") },
  async ({ query }) => {
    const output = runAtxp(`email search "${query.replace(/"/g, '\\"')}"`);
    return { content: [{ type: "text", text: output }] };
  }
);

// --- Agent Management ---

server.tool(
  "atxp_agent_create",
  "Create a new agent account under the logged-in human developer. Requires prior login.",
  {},
  async () => {
    const output = runAtxp("agent create", 30000);
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "atxp_agent_list",
  "List all agents created by the logged-in account.",
  {},
  async () => {
    const output = runAtxp("agent list");
    return { content: [{ type: "text", text: output }] };
  }
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
