/**
 * Template Library Index
 * 
 * Central export for all Hivelang v3 templates
 */

export * from './hivestore-templates';

// Re-export for convenience
import {
    HIVESTORE_TEMPLATES,
    getAllTemplates,
    getTemplateById,
    getTemplatesByCategory,
    getFreeTemplates,
    getPremiumTemplates,
    searchTemplates,
    type HivestoreTemplate
} from './hivestore-templates';

export {
    HIVESTORE_TEMPLATES as default,
    getAllTemplates,
    getTemplateById,
    getTemplatesByCategory,
    getFreeTemplates,
    getPremiumTemplates,
    searchTemplates
};

export type { HivestoreTemplate };

/**
 * Template categories for filtering
 */
export const TEMPLATE_CATEGORIES = [
    { id: 'all', name: 'All Templates', icon: '✨' },
    { id: 'productivity', name: 'Productivity', icon: '🚀' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'developer', name: 'Developer', icon: '👨‍💻' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'creative', name: 'Creative', icon: '✍️' },
    { id: 'automation', name: 'Automation', icon: '⚡' },
] as const;

/**
 * Get template count by category
 */
export function getTemplateCounts(): Record<string, number> {
    return HIVESTORE_TEMPLATES.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        acc['all'] = (acc['all'] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
}
