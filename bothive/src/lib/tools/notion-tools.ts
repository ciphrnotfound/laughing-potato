import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";
import { createClient } from "@supabase/supabase-js";

/**
 * Notion Integration Tools
 * Requires NOTION_CLIENT_ID/SECRET configured in Supabase 'integrations' table
 * and user to have connected via OAuth.
 */

// Helper to get Supabase Client (Service Role for backend execution)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getNotionAccessToken(userId?: string): Promise<string | null> {
    if (!userId) {
        console.warn("getNotionAccessToken: No userId provided in context");
        return null;
    }

    // 1. Get Integration ID for 'notion'
    const { data: integ, error: integError } = await supabase
        .from('integrations')
        .select('id')
        .eq('slug', 'notion')
        .single();

    if (integError || !integ) {
        console.error("Notion integration not found in catalog", integError);
        return null;
    }

    // 2. Get User's Connection
    const { data: conn, error: connError } = await supabase
        .from('user_integrations')
        .select('access_token')
        .eq('user_id', userId)
        .eq('integration_id', integ.id)
        .eq('status', 'active')
        .single();

    if (connError || !conn?.access_token) {
        console.warn(`No active Notion connection found for user ${userId}`, connError);
        return null;
    }

    return conn.access_token;
}

/**
 * Create a Notion page
 */
export const createNotionPage: ToolDescriptor = {
    name: "integrations.createNotionPage",
    capability: "integrations.notion",
    description: "Create a new page in Notion workspace",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const userId = context.metadata.userId;
        const accessToken = await getNotionAccessToken(userId);

        if (!accessToken) {
            return {
                success: false,
                output: "Notion is not connected. Please connect Notion in Settings > Integrations."
            };
        }

        const title = typeof input.title === "string" ? input.title : "Untitled Agent Page";
        const content = typeof input.content === "string" ? input.content : "";
        const parentId = typeof input.parent_page_id === "string" ? input.parent_page_id : undefined; // Optional parent

        // If no parent provided, we need a default. Notion API requires a parent (db or page).
        // Since we can't search easily without user input, we might need a 'default page' or search for one.
        // Fallback: This usually fails if no parent is known.
        // Improvement: Allow user to specify parent ID, OR search for a "Bot Home" page?
        // For now, fail if no parent (or try to find a root page?). 
        // Actually, 'search' endpoint can find a page.

        let targetParentId = parentId;

        if (!targetParentId) {
            // Try to search for a page to use as default parent? Or just error?
            // Error is safer + instruction to user.
            // BUT, user might expect it to just "work".
            // Let's try to finding the Workspace root? Notion doesn't expose "Root" easily via API.
            // We'll ask user to provide parent_page_id OR use search tool first.
            // Wait, let's try to search for a page named "Docs" or something logic? No.
            return {
                success: false,
                output: "Missing 'parent_page_id'. Please provide the ID of a page or database to contain the new page."
            };
        }

        const body = {
            parent: { page_id: targetParentId },
            properties: {
                title: {
                    title: [
                        {
                            text: {
                                content: title
                            }
                        }
                    ]
                }
            },
            children: [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [
                            {
                                type: 'text',
                                text: {
                                    content: content
                                }
                            }
                        ]
                    }
                }
            ]
        };

        const response = await fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                output: `Notion API Error: ${data.message || response.statusText}`
            };
        }

        return {
            success: true,
            output: JSON.stringify({
                page_id: data.id,
                url: data.url,
                title,
                message: `Notion page created: ${data.url}`
            }),
        };
    },
};

/**
 * Add entry to Notion database
 */
export const addNotionDatabaseEntry: ToolDescriptor = {
    name: "integrations.addNotionDatabaseEntry",
    capability: "integrations.notion",
    description: "Add a new entry to a Notion database",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const userId = context.metadata.userId;
        const accessToken = await getNotionAccessToken(userId);

        if (!accessToken) return { success: false, output: "Notion not connected." };

        const database_id = typeof input.database_id === "string" ? input.database_id : "";
        if (!database_id) return { success: false, output: "Missing 'database_id'." };

        const properties = input.properties as Record<string, any> || {};

        // Need to format properties for Notion API. 
        // We assume input.properties is already in Notion format OR we try to simplify?
        // Simplifying is complex. Let's assume raw Notion format or basic support.
        // For simplicity: We pass properties as is, user prompt must structure it.

        const body = {
            parent: { database_id: database_id },
            properties: properties
        };

        const response = await fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, output: `Notion API Error: ${data.message}` };
        }

        return {
            success: true,
            output: JSON.stringify({
                entry_id: data.id,
                url: data.url,
                message: "Database entry added."
            }),
        };
    },
};

/**
 * Query Notion database
 */
export const queryNotionDatabase: ToolDescriptor = {
    name: "integrations.queryNotionDatabase",
    capability: "integrations.notion",
    description: "Search in a Notion database",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const userId = context.metadata.userId;
        const accessToken = await getNotionAccessToken(userId);
        if (!accessToken) return { success: false, output: "Notion not connected." };

        const database_id = typeof input.database_id === "string" ? input.database_id : "";
        const filter = input.filter || undefined;

        if (!database_id) return { success: false, output: "Missing 'database_id'." };

        const response = await fetch(`https://api.notion.com/v1/databases/${database_id}/query`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28"
            },
            body: JSON.stringify({ filter })
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, output: `Notion Error: ${data.message}` };
        }

        // Simplify output
        const results = (data.results || []).map((page: any) => ({
            id: page.id,
            url: page.url,
            // Simple title extraction if possible, else raw
            properties: page.properties
        }));

        return {
            success: true,
            output: JSON.stringify({
                count: results.length,
                results
            }),
        };
    },
};

/**
 * Update Notion page
 */
export const updateNotionPage: ToolDescriptor = {
    name: "integrations.updateNotionPage",
    capability: "integrations.notion",
    description: "Update an existing Notion page (properties only)",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const userId = context.metadata.userId;
        const accessToken = await getNotionAccessToken(userId);
        if (!accessToken) return { success: false, output: "Notion not connected." };

        const page_id = typeof input.page_id === "string" ? input.page_id : "";
        const properties = input.properties as Record<string, any>;

        if (!page_id || !properties) return { success: false, output: "Missing page_id or properties." };

        const response = await fetch(`https://api.notion.com/v1/pages/${page_id}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28"
            },
            body: JSON.stringify({ properties })
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, output: `Notion Error: ${data.message}` };
        }

        return {
            success: true,
            output: JSON.stringify({
                page_id: data.id,
                updated: true
            }),
        };
    },
};


/**
 * Create a Notion database
 */
export const createNotionDatabase: ToolDescriptor = {
    name: "integrations.createNotionDatabase",
    capability: "integrations.notion.write",
    description: "Create a new database in Notion",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const userId = context.metadata.userId;
        const accessToken = await getNotionAccessToken(userId);
        if (!accessToken) return { success: false, output: "Notion not connected." };

        const parent_page_id = typeof input.parent_page_id === "string" ? input.parent_page_id : "";
        const title = typeof input.title === "string" ? input.title : "Untitled Database";
        const properties = (input.properties as Record<string, any>) || {
            Name: { title: {} },
            Description: { rich_text: {} }
        };

        if (!parent_page_id) return { success: false, output: "Missing 'parent_page_id'. A database must be created inside a page." };

        const body = {
            parent: { page_id: parent_page_id },
            title: [
                {
                    type: "text",
                    text: { content: title }
                }
            ],
            properties: properties
        };

        const response = await fetch("https://api.notion.com/v1/databases", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, output: `Notion Error: ${data.message || response.statusText}` };
        }

        return {
            success: true,
            output: JSON.stringify({
                database_id: data.id,
                url: data.url,
                title,
                message: "Notion database created successfully."
            }),
        };
    },
};

export const notionTools: ToolDescriptor[] = [
    createNotionPage,
    addNotionDatabaseEntry,
    queryNotionDatabase,
    updateNotionPage,
    createNotionDatabase,
];
