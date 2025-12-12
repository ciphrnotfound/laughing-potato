import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";

/**
 * Notion Integration Tools
 * Requires NOTION_API_KEY in .env.local
 */

interface CreatePageInput {
    title: string;
    content: string;
    parent_page_id?: string;
    meeting_link?: string;
    attendees?: string[];
}

interface CreateDatabaseEntryInput {
    database_id: string;
    properties: Record<string, any>;
}

/**
 * Create a Notion page
 */
export const createNotionPage: ToolDescriptor = {
    name: "integrations.createNotionPage",
    capability: "integrations.notion",
    description: "Create a new page in Notion workspace",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const title = typeof input.title === "string" ? input.title : "Untitled";
        const content = typeof input.content === "string" ? input.content : "";
        const meeting_link = typeof input.meeting_link === "string" ? input.meeting_link : undefined;
        const attendees = Array.isArray(input.attendees) ? input.attendees.map(String) : undefined;

        // Mock implementation for demo
        // In production, this would call Notion API
        const pageId = `page_${Date.now()}`;
        const pageUrl = `https://notion.so/${pageId}`;

        return {
            success: true,
            output: JSON.stringify({
                page_id: pageId,
                url: pageUrl,
                title,
                created_time: new Date().toISOString(),
                message: `Notion page "${title}" created successfully`,
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
        const database_id = typeof input.database_id === "string" ? input.database_id : "";
        const properties = input.properties as Record<string, any> | undefined;

        // Mock implementation
        const entryId = `entry_${Date.now()}`;

        return {
            success: true,
            output: JSON.stringify({
                entry_id: entryId,
                database_id,
                properties,
                url: `https://notion.so/${entryId}`,
                message: "Database entry created successfully",
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
    description: "Search and filter entries in a Notion database",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const database_id = typeof input.database_id === "string" ? input.database_id : "";
        const filter = input.filter;

        // Mock implementation
        return {
            success: true,
            output: JSON.stringify({
                results: [
                    {
                        id: "entry_1",
                        properties: {
                            Name: { title: [{ text: { content: "Sample Entry" } }] },
                        },
                    },
                ],
                has_more: false,
                count: 1,
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
    description: "Update an existing Notion page",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const page_id = typeof input.page_id === "string" ? input.page_id : "";
        const title = typeof input.title === "string" ? input.title : undefined;
        const content = typeof input.content === "string" ? input.content : undefined;

        // Mock implementation
        return {
            success: true,
            output: JSON.stringify({
                page_id,
                updated: { title, content },
                last_edited_time: new Date().toISOString(),
                message: "Page updated successfully",
            }),
        };
    },
};

export const notionTools: ToolDescriptor[] = [
    createNotionPage,
    addNotionDatabaseEntry,
    queryNotionDatabase,
    updateNotionPage,
];
