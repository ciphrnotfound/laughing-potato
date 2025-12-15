/**
 * HiveTools - Bee-themed Integration Marketplace 🐝
 * Community-contributed integrations for BotHive
 */

import { ToolDescriptor } from "@/lib/agentTypes";

export interface HiveToolMetadata {
    displayName: string;
    category: 'communication' | 'productivity' | 'data' | 'ai' | 'social' | 'finance' | 'developer' | 'entertainment' | 'other';
    author: string;
    version: string;
    requiresAuth?: boolean;
    authType?: 'api_key' | 'oauth2' | 'basic';
    documentationUrl?: string;
    iconUrl?: string;
    tags?: string[];
    isPremium?: boolean;
    isOfficial?: boolean;
    downloads?: number;
    rating?: number;
}

export interface RegisteredHiveTool extends ToolDescriptor {
    metadata: HiveToolMetadata;
    registeredAt: string;
}

/**
 * The Hive - Central registry for all HiveTools
 */
class HiveToolRegistry {
    private tools: Map<string, RegisteredHiveTool> = new Map();
    private toolsByCategory: Map<string, RegisteredHiveTool[]> = new Map();
    private initialized: boolean = false;

    /**
     * 🐝 Register a HiveTool
     */
    register(tool: ToolDescriptor, metadata: HiveToolMetadata): void {
        const registeredTool: RegisteredHiveTool = {
            ...tool,
            metadata,
            registeredAt: new Date().toISOString(),
        };

        // Add to the Hive
        this.tools.set(tool.name, registeredTool);

        // Organize by category
        const categoryTools = this.toolsByCategory.get(metadata.category) || [];
        categoryTools.push(registeredTool);
        this.toolsByCategory.set(metadata.category, categoryTools);

        console.log(`🐝 Added to Hive: ${metadata.displayName} (${tool.name})`);
    }

    /**
     * Get a HiveTool by name
     */
    getHiveTool(name: string): RegisteredHiveTool | undefined {
        return this.tools.get(name);
    }

    /**
     * Get all HiveTools
     */
    getAllHiveTools(): RegisteredHiveTool[] {
        return Array.from(this.tools.values());
    }

    /**
     * Get HiveTools by category
     */
    getHiveToolsByCategory(category: string): RegisteredHiveTool[] {
        return this.toolsByCategory.get(category) || [];
    }

    /**
     * Search the Hive
     */
    searchHive(query: string): RegisteredHiveTool[] {
        const lowerQuery = query.toLowerCase();
        return this.getAllHiveTools().filter(tool => {
            const searchFields = [
                tool.metadata.displayName,
                tool.name,
                tool.description,
                ...(tool.metadata.tags || []),
            ].map(field => field.toLowerCase());

            return searchFields.some(field => field.includes(lowerQuery));
        });
    }

    /**
     * Filter HiveTools
     */
    filterHiveTools(filters: {
        category?: string;
        requiresAuth?: boolean;
        isPremium?: boolean;
        isOfficial?: boolean;
        author?: string;
    }): RegisteredHiveTool[] {
        return this.getAllHiveTools().filter(tool => {
            if (filters.category && tool.metadata.category !== filters.category) return false;
            if (filters.requiresAuth !== undefined && tool.metadata.requiresAuth !== filters.requiresAuth) return false;
            if (filters.isPremium !== undefined && tool.metadata.isPremium !== filters.isPremium) return false;
            if (filters.isOfficial !== undefined && tool.metadata.isOfficial !== filters.isOfficial) return false;
            if (filters.author && tool.metadata.author !== filters.author) return false;
            return true;
        });
    }

    /**
     * Get popular HiveTools (by downloads)
     */
    getPopularHiveTools(limit: number = 10): RegisteredHiveTool[] {
        return this.getAllHiveTools()
            .sort((a, b) => (b.metadata.downloads || 0) - (a.metadata.downloads || 0))
            .slice(0, limit);
    }

    /**
     * Get trending HiveTools (by recent downloads)
     */
    getTrendingHiveTools(limit: number = 10): RegisteredHiveTool[] {
        // For now, same as popular. In production, track downloads over time
        return this.getPopularHiveTools(limit);
    }

    /**
     * Get Hive statistics
     */
    getHiveStats() {
        const tools = this.getAllHiveTools();
        return {
            totalHiveTools: tools.length,
            officialTools: tools.filter(t => t.metadata.isOfficial).length,
            communityTools: tools.filter(t => !t.metadata.isOfficial).length,
            premiumTools: tools.filter(t => t.metadata.isPremium).length,
            freeTools: tools.filter(t => !t.metadata.isPremium).length,
            categories: this.getCategories(),
            totalDownloads: tools.reduce((sum, t) => sum + (t.metadata.downloads || 0), 0),
        };
    }

    /**
     * Get categories with counts
     */
    getCategories(): Array<{ category: string; count: number; icon: string }> {
        const categoryIcons: Record<string, string> = {
            communication: '💬',
            productivity: '📊',
            data: '📁',
            ai: '🤖',
            social: '📱',
            finance: '💰',
            developer: '⚙️',
            entertainment: '🎬',
            other: '🔧',
        };

        const categories: Map<string, number> = new Map();
        this.getAllHiveTools().forEach(tool => {
            const count = categories.get(tool.metadata.category) || 0;
            categories.set(tool.metadata.category, count + 1);
        });

        return Array.from(categories.entries()).map(([category, count]) => ({
            category,
            count,
            icon: categoryIcons[category] || '🔧',
        }));
    }

    /**
     * Initialize the Hive
     */
    async initialize() {
        if (this.initialized) return;

        await this.loadCoreTools();

        this.initialized = true;
        console.log(`🐝 The Hive is active with ${this.tools.size} HiveTools`);
    }

    /**
     * Load core tools
     */
    private async loadCoreTools() {
        try {
            // Load real integrations with proper metadata
            const { registerRealIntegrations } = await import('./real-integrations');
            await registerRealIntegrations();
        } catch (error) {
            console.error('Failed to load core tools:', error);
        }
    }

    private registerToolSet(tools: ToolDescriptor[], baseMetadata: Partial<HiveToolMetadata>) {
        tools.forEach(tool => {
            const metadata: HiveToolMetadata = {
                displayName: this.generateDisplayName(tool.name),
                category: (baseMetadata.category as any) || 'other',
                author: baseMetadata.author || 'Unknown',
                version: '1.0.0',
                isOfficial: baseMetadata.isOfficial || false,
                requiresAuth: false,
                downloads: 0,
                rating: 5,
                ...baseMetadata,
            };

            this.register(tool, metadata);
        });
    }

    private generateDisplayName(name: string): string {
        return name
            .split('.')
            .pop()!
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    clear() {
        this.tools.clear();
        this.toolsByCategory.clear();
        this.initialized = false;
    }

    // Backward compatibility methods for old /api/tools routes
    getTool(name: string) {
        return this.getHiveTool(name);
    }

    getAllTools() {
        return this.getAllHiveTools();
    }

    searchTools(query: string) {
        return this.searchHive(query);
    }

    filterTools(filters: any) {
        return this.filterHiveTools(filters);
    }

    getStats() {
        return this.getHiveStats();
    }
}

// Export as "The Hive" 🐝
export const theHive = new HiveToolRegistry();

// Auto-initialize
// if (typeof window === 'undefined') {
//     theHive.initialize().catch(console.error);
// }
