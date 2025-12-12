/**
 * Example Plugin: Notion Integration
 * Shows developers how to create a BotHive tool plugin
 */

import { ToolDescriptor } from "@/lib/agentTypes";

/**
 * Create a new page in Notion
 */
export const notionCreatePage: ToolDescriptor = {
    name: "notion.createPage",
    capability: "integrations.notion",
    description: "Create a new page in a Notion database with specified properties",

    async run(input, context) {
        try {
            const { databaseId, title, properties } = input as {
                databaseId: string;
                title: string;
                properties?: Record<string, any>;
            };

            if (!databaseId || !title) {
                return {
                    success: false,
                    output: "Missing required fields: databaseId and title are required",
                };
            }

            // In a real implementation, this would call the Notion API
            // For now, returning a mock response
            const mockPageId = `page-${Date.now()}`;

            return {
                success: true,
                output: `✓ Created Notion page "${title}" (ID: ${mockPageId})`,
                data: {
                    pageId: mockPageId,
                    databaseId,
                    title,
                    url: `https://notion.so/${mockPageId}`,
                },
            };
        } catch (error) {
            return {
                success: false,
                output: `Failed to create Notion page: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};

/**
 * Query Notion database
 */
export const notionQueryDatabase: ToolDescriptor = {
    name: "notion.queryDatabase",
    capability: "integrations.notion",
    description: "Query a Notion database with filters and sorting",

    async run(input, context) {
        try {
            const { databaseId, filter, sorts } = input as {
                databaseId: string;
                filter?: any;
                sorts?: any[];
            };

            if (!databaseId) {
                return {
                    success: false,
                    output: "Missing required field: databaseId",
                };
            }

            // Mock results
            const mockResults = [
                { id: "1", title: "Task 1", status: "In Progress" },
                { id: "2", title: "Task 2", status: "Done" },
            ];

            return {
                success: true,
                output: `Found ${mockResults.length} pages in Notion database`,
                data: {
                    results: mockResults,
                    hasMore: false,
                },
            };
        } catch (error) {
            return {
                success: false,
                output: `Failed to query Notion database: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};

/**
 * Update Notion page
 */
export const notionUpdatePage: ToolDescriptor = {
    name: "notion.updatePage",
    capability: "integrations.notion",
    description: "Update properties of an existing Notion page",

    async run(input, context) {
        try {
            const { pageId, properties } = input as {
                pageId: string;
                properties: Record<string, any>;
            };

            if (!pageId || !properties) {
                return {
                    success: false,
                    output: "Missing required fields: pageId and properties are required",
                };
            }

            return {
                success: true,
                output: `✓ Updated Notion page ${pageId}`,
                data: {
                    pageId,
                    updatedProperties: Object.keys(properties),
                },
            };
        } catch (error) {
            return {
                success: false,
                output: `Failed to update Notion page: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};
