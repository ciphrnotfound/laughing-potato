/**
 * Example Plugin Manifests
 * Shows how to package tools into plugins
 */

import { PluginManifest } from "../loader";

/**
 * Notion Plugin Manifest
 */
export const notionPluginManifest: PluginManifest = {
    name: "notion-integration",
    version: "1.0.0",
    author: "BotHive Team",
    description: "Official Notion integration for BotHive - Create, query, and update Notion pages",
    tools: [
        {
            name: "notionCreatePage",
            displayName: "Create Notion Page",
            category: "productivity",
            requiresAuth: true,
            authType: "oauth2",
        },
        {
            name: "notionQueryDatabase",
            displayName: "Query Notion Database",
            category: "productivity",
            requiresAuth: true,
            authType: "oauth2",
        },
        {
            name: "notionUpdatePage",
            displayName: "Update Notion Page",
            category: "productivity",
            requiresAuth: true,
            authType: "oauth2",
        },
    ],
};

/**
 * Airtable Plugin Manifest
 */
export const airtablePluginManifest: PluginManifest = {
    name: "airtable-integration",
    version: "1.0.0",
    author: "BotHive Team",
    description: "Official Airtable integration for BotHive - Manage your Airtable bases",
    tools: [
        {
            name: "airtableCreateRecord",
            displayName: "Create Airtable Record",
            category: "data",
            requiresAuth: true,
            authType: "api_key",
        },
        {
            name: "airtableListRecords",
            displayName: "List Airtable Records",
            category: "data",
            requiresAuth: true,
            authType: "api_key",
        },
        {
            name: "airtableUpdateRecord",
            displayName: "Update Airtable Record",
            category: "data",
            requiresAuth: true,
            authType: "api_key",
        },
    ],
};
