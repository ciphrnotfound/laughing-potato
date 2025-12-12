/**
 * Plugin Loader - Dynamic loading of community-contributed tools
 */

import { ToolDescriptor } from "@/lib/agentTypes";
import { theHive, HiveToolMetadata } from "./registry";
import { toolValidator } from "./validator";

export interface PluginManifest {
    name: string;
    version: string;
    author: string;
    description: string;
    tools: {
        name: string;
        displayName: string;
        category: HiveToolMetadata['category'];
        requiresAuth?: boolean;
        authType?: HiveToolMetadata['authType'];
    }[];
}

export class PluginLoader {
    private loadedPlugins: Map<string, PluginManifest> = new Map();

    /**
     * Load a plugin and register its tools
     */
    async loadPlugin(pluginPath: string, manifest: PluginManifest): Promise<{
        success: boolean;
        toolsLoaded: number;
        errors: string[];
    }> {
        const errors: string[] = [];
        let toolsLoaded = 0;

        try {
            // Dynamically import the plugin
            const plugin = await import(pluginPath);

            // Validate manifest
            if (!manifest.tools || manifest.tools.length === 0) {
                errors.push('Plugin manifest must include at least one tool');
                return { success: false, toolsLoaded: 0, errors };
            }

            // Load each tool
            for (const toolConfig of manifest.tools) {
                const tool: ToolDescriptor | undefined = plugin[toolConfig.name];

                if (!tool) {
                    errors.push(`Tool "${toolConfig.name}" not found in plugin export`);
                    continue;
                }

                // Create metadata
                const metadata: HiveToolMetadata = {
                    displayName: toolConfig.displayName,
                    category: toolConfig.category,
                    author: manifest.author,
                    version: manifest.version,
                    requiresAuth: toolConfig.requiresAuth,
                    authType: toolConfig.authType,
                    isOfficial: false, // Community plugins are not official
                    isPremium: false, // Default to free
                };

                // Validate tool
                const validation = await toolValidator.validate(tool, metadata);

                if (!validation.valid) {
                    errors.push(`Tool "${toolConfig.name}" validation failed: ${validation.errors.join(', ')}`);
                    continue;
                }

                //Register tool
                theHive.register(tool, metadata);
                toolsLoaded++;
            }

            // Store plugin manifest
            if (toolsLoaded > 0) {
                this.loadedPlugins.set(manifest.name, manifest);
            }

            return {
                success: toolsLoaded > 0,
                toolsLoaded,
                errors,
            };
        } catch (error) {
            errors.push(error instanceof Error ? error.message : 'Failed to load plugin');
            return { success: false, toolsLoaded: 0, errors };
        }
    }

    /**
     * Load all plugins from a directory
     */
    async loadPluginsFromDirectory(directory: string): Promise<{
        totalPlugins: number;
        successfulPlugins: number;
        failedPlugins: number;
        totalTools: number;
    }> {
        // This would scan a directory for plugin manifests and load them
        // For now, returning empty stats as this requires filesystem access
        return {
            totalPlugins: 0,
            successfulPlugins: 0,
            failedPlugins: 0,
            totalTools: 0,
        };
    }

    /**
     * Unload a plugin
     */
    unloadPlugin(pluginName: string): boolean {
        const plugin = this.loadedPlugins.get(pluginName);
        if (!plugin) return false;

        // Remove from loaded plugins
        this.loadedPlugins.delete(pluginName);

        // Note: We don't remove tools from registry as they might be in use
        // In a production system, you'd want to track which plugin registered which tools

        return true;
    }

    /**
     * Get loaded plugins
     */
    getLoadedPlugins(): PluginManifest[] {
        return Array.from(this.loadedPlugins.values());
    }

    /**
     * Check if plugin is loaded
     */
    isPluginLoaded(pluginName: string): boolean {
        return this.loadedPlugins.has(pluginName);
    }

    /**
     * Reload a plugin (unload then load)
     */
    async reloadPlugin(pluginPath: string, manifest: PluginManifest): Promise<{
        success: boolean;
        toolsLoaded: number;
        errors: string[];
    }> {
        // Unload if already loaded
        this.unloadPlugin(manifest.name);

        // Load again
        return this.loadPlugin(pluginPath, manifest);
    }

    /**
     * Validate plugin manifest
     */
    validateManifest(manifest: any): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!manifest.name || typeof manifest.name !== 'string') {
            errors.push('Plugin manifest must have a name');
        }

        if (!manifest.version || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
            errors.push('Plugin version must follow semantic versioning (e.g., "1.0.0")');
        }

        if (!manifest.author || typeof manifest.author !== 'string') {
            errors.push('Plugin manifest must have an author');
        }

        if (!Array.isArray(manifest.tools) || manifest.tools.length === 0) {
            errors.push('Plugin manifest must include at least one tool');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}

// Export singleton instance
export const pluginLoader = new PluginLoader();
