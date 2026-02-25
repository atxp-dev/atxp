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
function getConnection() {
    if (process.env.ATXP_CONNECTION)
        return process.env.ATXP_CONNECTION;
    if (existsSync(CONFIG_PATH)) {
        const content = readFileSync(CONFIG_PATH, "utf-8");
        const match = content.match(/^ATXP_CONNECTION=(.+)$/m);
        if (match)
            return match[1].trim().replace(/^["']|["']$/g, "");
    }
    return null;
}
/**
 * Run an npx atxp command and return the output
 */
function runAtxp(args, timeoutMs = 30000) {
    const env = { ...process.env };
    const conn = getConnection();
    if (conn)
        env.ATXP_CONNECTION = conn;
    try {
        const output = execSync(`npx atxp@latest ${args}`, {
            encoding: "utf-8",
            timeout: timeoutMs,
            env,
            stdio: ["pipe", "pipe", "pipe"],
        });
        return output.trim();
    }
    catch (error) {
        const err = error;
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
server.tool("atxp_register", "Self-register as a new ATXP agent. Creates an account instantly with a wallet, email, 10 IOU tokens, and a connection string. No human login needed.", {}, async () => {
    const output = runAtxp("agent register", 60000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_login", "Authenticate with an ATXP connection string. Saves credentials to ~/.atxp/config.", { connection_string: z.string().describe("The full ATXP connection string URL") }, async ({ connection_string }) => {
    const output = runAtxp(`login --token "${connection_string}"`, 30000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_whoami", "Show account info: ID, type, email, wallet address, owner.", {}, async () => {
    const output = runAtxp("whoami");
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_balance", "Check ATXP account balance across all chains. Free to call.", {}, async () => {
    const output = runAtxp("balance");
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_fund", "Show all funding options: crypto deposit addresses (USDC on Base, Solana) and a shareable Stripe payment link. Use --amount to request a specific payment link amount. Free to call.", {
    amount: z.number().optional().describe("Suggested payment link amount in USD (1-1000, default 10)"),
    open: z.boolean().optional().describe("Open the payment link in a browser"),
}, async ({ amount, open }) => {
    let args = "fund";
    if (amount)
        args += ` --amount ${amount}`;
    if (open)
        args += " --open";
    const output = runAtxp(args);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_transactions", "View recent transaction history. Free to call.", { limit: z.number().optional().describe("Number of transactions to show (default 10)") }, async ({ limit }) => {
    const args = limit ? `transactions --limit ${limit}` : "transactions";
    const output = runAtxp(args);
    return { content: [{ type: "text", text: output }] };
});
// --- Paid API Tools ---
server.tool("atxp_search", "Real-time web search. Returns current results from the web. Paid per use.", { query: z.string().describe("Search query") }, async ({ query }) => {
    const output = runAtxp(`search "${query.replace(/"/g, '\\"')}"`, 30000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_image", "Generate an AI image from a text prompt. Returns an image URL. Paid per use.", { prompt: z.string().describe("Image generation prompt") }, async ({ prompt }) => {
    const output = runAtxp(`image "${prompt.replace(/"/g, '\\"')}"`, 60000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_video", "Generate an AI video from a text prompt. Returns a video URL. Paid per use.", { prompt: z.string().describe("Video generation prompt") }, async ({ prompt }) => {
    const output = runAtxp(`video "${prompt.replace(/"/g, '\\"')}"`, 120000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_music", "Generate AI music from a text prompt. Returns a music URL. Paid per use.", { prompt: z.string().describe("Music generation prompt") }, async ({ prompt }) => {
    const output = runAtxp(`music "${prompt.replace(/"/g, '\\"')}"`, 120000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_x_search", "Search X/Twitter for live posts and discussions. Paid per use.", { query: z.string().describe("X/Twitter search query") }, async ({ query }) => {
    const output = runAtxp(`x "${query.replace(/"/g, '\\"')}"`, 30000);
    return { content: [{ type: "text", text: output }] };
});
// --- Email ---
server.tool("atxp_email_inbox", "Check the agent's email inbox. Free to call. Each agent has a unique @atxp.email address.", {}, async () => {
    const output = runAtxp("email inbox");
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_email_read", "Read a specific email message by ID. Free to call.", { message_id: z.string().describe("The message ID to read") }, async ({ message_id }) => {
    const output = runAtxp(`email read ${message_id}`);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_email_send", "Send an email from the agent's @atxp.email address. Costs $0.01 per email.", {
    to: z.string().describe("Recipient email address"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body text"),
}, async ({ to, subject, body }) => {
    const output = runAtxp(`email send --to "${to}" --subject "${subject.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}"`, 30000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_email_reply", "Reply to an email by message ID. Costs $0.01 per reply.", {
    message_id: z.string().describe("The message ID to reply to"),
    body: z.string().describe("Reply body text"),
}, async ({ message_id, body }) => {
    const output = runAtxp(`email reply ${message_id} --body "${body.replace(/"/g, '\\"')}"`, 30000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_email_search", "Search emails by subject or sender. Free to call.", { query: z.string().describe("Search query for emails") }, async ({ query }) => {
    const output = runAtxp(`email search "${query.replace(/"/g, '\\"')}"`);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_email_delete", "Delete an email message by ID. Free to call.", { message_id: z.string().describe("The message ID to delete") }, async ({ message_id }) => {
    const output = runAtxp(`email delete ${message_id}`);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_email_get_attachment", "Download an email attachment by message ID and attachment index. Free to call.", {
    message_id: z.string().describe("The message ID containing the attachment"),
    index: z.number().describe("Attachment index (0-based)"),
}, async ({ message_id, index }) => {
    const output = runAtxp(`email get-attachment --message ${message_id} --index ${index}`);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_email_claim_username", "Claim a human-readable email username (e.g., yourname@atxp.email). Costs $1.00.", { username: z.string().describe("The username to claim") }, async ({ username }) => {
    const output = runAtxp(`email claim-username ${username}`, 30000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_email_release_username", "Release your claimed email username. Free to call.", {}, async () => {
    const output = runAtxp("email release-username");
    return { content: [{ type: "text", text: output }] };
});
// --- Phone ---
server.tool("atxp_phone_register", "Register a phone number for SMS and voice calls. Costs $2.00.", { area_code: z.string().optional().describe("Preferred area code (e.g., '415')") }, async ({ area_code }) => {
    const args = area_code ? `phone register --area-code ${area_code}` : "phone register";
    const output = runAtxp(args, 60000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_phone_release", "Release your registered phone number. Free to call.", {}, async () => {
    const output = runAtxp("phone release");
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_phone_configure_voice", "Configure the AI voice agent for inbound/outbound calls. Free to call.", {
    agent_name: z.string().describe("Name for the voice agent"),
    voice_description: z.string().describe("Description of the agent's voice personality and behavior"),
}, async ({ agent_name, voice_description }) => {
    const output = runAtxp(`phone configure-voice --agent-name "${agent_name.replace(/"/g, '\\"')}" --voice-description "${voice_description.replace(/"/g, '\\"')}"`, 30000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_phone_sms", "Check SMS inbox. Free to call.", {
    unread_only: z.boolean().optional().describe("Only show unread messages"),
    direction: z.enum(["incoming", "sent"]).optional().describe("Filter by direction"),
}, async ({ unread_only, direction }) => {
    let args = "phone sms";
    if (unread_only)
        args += " --unread-only";
    if (direction)
        args += ` --direction ${direction}`;
    const output = runAtxp(args);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_phone_read_sms", "Read a specific SMS message by ID. Free to call.", { message_id: z.string().describe("The SMS message ID to read") }, async ({ message_id }) => {
    const output = runAtxp(`phone read-sms ${message_id}`);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_phone_send_sms", "Send an SMS message. Costs $0.05. Optionally attach media for MMS.", {
    to: z.string().describe("Recipient phone number"),
    body: z.string().describe("Message text"),
    media: z.string().optional().describe("URL of media to attach (MMS)"),
}, async ({ to, body, media }) => {
    let args = `phone send-sms --to "${to}" --body "${body.replace(/"/g, '\\"')}"`;
    if (media)
        args += ` --media "${media}"`;
    const output = runAtxp(args, 30000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_phone_get_attachment", "Download an MMS attachment by message ID and index. Free to call.", {
    message_id: z.string().describe("The message ID containing the attachment"),
    index: z.number().describe("Attachment index (0-based)"),
}, async ({ message_id, index }) => {
    const output = runAtxp(`phone get-attachment --message ${message_id} --index ${index}`);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_phone_call", "Make an AI-powered voice call. Costs $0.10 per call.", {
    to: z.string().describe("Phone number to call"),
    instruction: z.string().describe("Instructions for the AI voice agent during the call"),
}, async ({ to, instruction }) => {
    const output = runAtxp(`phone call --to "${to}" --instruction "${instruction.replace(/"/g, '\\"')}"`, 60000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_phone_calls", "Check call history. Free to call.", { direction: z.enum(["incoming", "sent"]).optional().describe("Filter by direction") }, async ({ direction }) => {
    const args = direction ? `phone calls --direction ${direction}` : "phone calls";
    const output = runAtxp(args);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_phone_read_call", "Read a call transcript and summary by call ID. Free to call.", { call_id: z.string().describe("The call ID to read") }, async ({ call_id }) => {
    const output = runAtxp(`phone read-call ${call_id}`);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_phone_search", "Search SMS messages and call history. Free to call.", { query: z.string().describe("Search query") }, async ({ query }) => {
    const output = runAtxp(`phone search "${query.replace(/"/g, '\\"')}"`);
    return { content: [{ type: "text", text: output }] };
});
// --- Contacts ---
server.tool("atxp_contacts_add", "Add a new contact to the local contacts database. Free to call.", {
    name: z.string().describe("Contact name"),
    phone: z.array(z.string()).optional().describe("Phone number(s)"),
    email: z.array(z.string()).optional().describe("Email address(es)"),
    notes: z.string().optional().describe("Notes about the contact"),
}, async ({ name, phone, email, notes }) => {
    let args = `contacts add --name "${name.replace(/"/g, '\\"')}"`;
    if (phone)
        phone.forEach((p) => (args += ` --phone "${p}"`));
    if (email)
        email.forEach((e) => (args += ` --email "${e}"`));
    if (notes)
        args += ` --notes "${notes.replace(/"/g, '\\"')}"`;
    const output = runAtxp(args);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_contacts_list", "List all contacts. Free to call.", {}, async () => {
    const output = runAtxp("contacts list");
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_contacts_show", "Show full details for a contact by ID. Free to call.", { id: z.string().describe("Contact ID") }, async ({ id }) => {
    const output = runAtxp(`contacts show ${id}`);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_contacts_edit", "Update a contact's fields. Free to call.", {
    id: z.string().describe("Contact ID to edit"),
    name: z.string().optional().describe("New name"),
    phone: z.array(z.string()).optional().describe("New phone number(s)"),
    email: z.array(z.string()).optional().describe("New email address(es)"),
    notes: z.string().optional().describe("New notes"),
}, async ({ id, name, phone, email, notes }) => {
    let args = `contacts edit ${id}`;
    if (name)
        args += ` --name "${name.replace(/"/g, '\\"')}"`;
    if (phone)
        phone.forEach((p) => (args += ` --phone "${p}"`));
    if (email)
        email.forEach((e) => (args += ` --email "${e}"`));
    if (notes)
        args += ` --notes "${notes.replace(/"/g, '\\"')}"`;
    const output = runAtxp(args);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_contacts_remove", "Delete a contact by ID. Free to call.", { id: z.string().describe("Contact ID to remove") }, async ({ id }) => {
    const output = runAtxp(`contacts remove ${id}`);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_contacts_search", "Search contacts by name, phone, or email. Case-insensitive. Free to call.", { query: z.string().describe("Search query") }, async ({ query }) => {
    const output = runAtxp(`contacts search "${query.replace(/"/g, '\\"')}"`);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_contacts_push", "Back up local contacts to the ATXP server. Free to call.", {}, async () => {
    const output = runAtxp("contacts push");
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_contacts_pull", "Restore contacts from the ATXP server. Free to call.", {}, async () => {
    const output = runAtxp("contacts pull");
    return { content: [{ type: "text", text: output }] };
});
// --- Agent Management ---
server.tool("atxp_agent_create", "Create a new agent account under the logged-in human developer. Requires prior login.", {}, async () => {
    const output = runAtxp("agent create", 30000);
    return { content: [{ type: "text", text: output }] };
});
server.tool("atxp_agent_list", "List all agents created by the logged-in account.", {}, async () => {
    const output = runAtxp("agent list");
    return { content: [{ type: "text", text: output }] };
});
// --- Start ---
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
