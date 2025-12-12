/**
 * Plugin Marketplace API Route
 * 
 * GET /api/plugins - List all available plugins
 * POST /api/plugins/:id/install - Install a plugin
 * DELETE /api/plugins/:id - Uninstall a plugin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { theHive } from '@/lib/plugins';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

// GET /api/plugins - List all available plugins
export async function GET(req: NextRequest) {
    try {
        // Get auth header for user context
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');
        let userId: string | null = null;

        // If authenticated, get user ID
        if (token) {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_KEY!
            );
            const { data: { user } } = await supabase.auth.getUser(token);
            userId = user?.id ?? null;
        }

        // Fetch all plugins from database
        const { data: plugins, error } = await supabase
            .from('plugins')
            .select('*')
            .order('install_count', { ascending: false });

        if (error) throw error;

        // If user is authenticated, mark which plugins they have installed
        let installedPluginIds: string[] = [];
        if (userId) {
            const { data: installed } = await supabase
                .from('plugin_configs')
                .select('plugin_id')
                .eq('user_id', userId)
                .eq('enabled', true);

            installedPluginIds = installed?.map(p => p.plugin_id) || [];
        }

        // Enrich with installation status
        const enrichedPlugins = plugins?.map(plugin => ({
            ...plugin,
            isInstalled: installedPluginIds.includes(plugin.id),
            configSchema: typeof plugin.config_schema === 'string'
                ? JSON.parse(plugin.config_schema)
                : plugin.config_schema,
        }));

        return NextResponse.json({ plugins: enrichedPlugins });
    } catch (error: any) {
        console.error('Failed to fetch plugins:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch plugins' },
            { status: 500 }
        );
    }
}

// POST /api/plugins - Install a plugin
export async function POST(req: NextRequest) {
    try {
        // Get auth header
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!
        );

        // Verify token and get user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user.id;

        const body = await req.json();
        const { pluginId, config = {} } = body;

        if (!pluginId) {
            return NextResponse.json({ error: 'Plugin ID required' }, { status: 400 });
        }

        // Check if plugin exists
        const { data: plugin } = await supabase
            .from('plugins')
            .select('*')
            .eq('id', pluginId)
            .single();

        if (!plugin) {
            return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
        }

        // Create plugin config for user
        const { data: pluginConfig, error } = await supabase
            .from('plugin_configs')
            .upsert({
                user_id: userId,
                plugin_id: pluginId,
                encrypted_secrets: config,
                enabled: true,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            config: pluginConfig,
            message: `${plugin.display_name} installed successfully!`
        });
    } catch (error: any) {
        console.error('Failed to install plugin:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to install plugin' },
            { status: 500 }
        );
    }
}
