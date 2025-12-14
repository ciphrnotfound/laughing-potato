import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { INTEGRATION_EXAMPLES } from "@/lib/hivelang/examples";

export async function GET(request: NextRequest) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({
            error: "Missing env vars",
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }, { status: 200 });
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Get system user for developer_id
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
        if (userError || !users || users.length === 0) {
            throw new Error("Could not find any user to act as developer.");
        }
        const systemUserId = users[0].id;
        const results = [`System User ID: ${systemUserId}`];

        // Define all integrations to upsert
        const integrationsToSeed = [
            // Developer Tools
            {
                slug: 'vercel',
                name: 'Vercel',
                description: 'Deploy web projects and manage deployments.',
                icon_url: '/integrations/vercel-icon.svg',
                category: 'developer_tools',
                auth_type: 'api_key',
                documentation_url: 'https://vercel.com/docs/rest-api',
                capabilities: [{ name: "deploy_project" }, { name: "get_deployments" }]
            },
            {
                slug: 'github',
                name: 'GitHub',
                description: 'Manage repositories, issues, and pull requests.',
                icon_url: '/integrations/github-icon.svg',
                category: 'developer_tools',
                auth_type: 'api_key',
                documentation_url: 'https://docs.github.com/en/rest',
                capabilities: [{ name: "create_issue" }, { name: "list_issues" }]
            },
            // Payments
            {
                slug: 'stripe',
                name: 'Stripe',
                description: 'Accept payments and manage subscriptions.',
                icon_url: '/integrations/stripe-icon.svg',
                category: 'payments',
                auth_type: 'api_key',
                documentation_url: 'https://stripe.com/docs/api',
                capabilities: [{ name: "create_payment" }, { name: "refund_payment" }]
            },
            // Communication
            {
                slug: 'sendgrid',
                name: 'SendGrid',
                description: 'Send transactional and marketing emails.',
                icon_url: '/integrations/sendgrid-icon.svg',
                category: 'communication',
                auth_type: 'api_key',
                documentation_url: 'https://docs.sendgrid.com/api-reference',
                capabilities: [{ name: "send_email" }]
            },
            {
                slug: 'slack',
                name: 'Slack',
                description: 'Send messages and manage channels.',
                icon_url: '/integrations/slack-icon.svg',
                category: 'communication',
                auth_type: 'oauth2',
                documentation_url: 'https://api.slack.com/',
                capabilities: [{ name: "send_message" }]
            },
            {
                slug: 'discord',
                name: 'Discord',
                description: 'Post to channels and manage server.',
                icon_url: '/integrations/discord-icon.svg',
                category: 'communication',
                auth_type: 'bot_token',
                documentation_url: 'https://discord.com/developers/docs/intro',
                capabilities: [{ name: "send_message" }]
            },
            {
                slug: 'whatsapp',
                name: 'WhatsApp Business',
                description: 'Send and receive WhatsApp Business messages.',
                icon_url: '/integrations/whatsapp-icon.svg',
                category: 'communication',
                auth_type: 'api_key',
                documentation_url: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
                capabilities: [{ name: "send_message" }, { name: "send_template" }, { name: "get_unread" }]
            },
            {
                slug: 'gmail',
                name: 'Gmail',
                description: 'Read and send emails via Gmail.',
                icon_url: '/integrations/gmail-icon.svg',
                category: 'communication',
                auth_type: 'oauth2',
                documentation_url: 'https://developers.google.com/gmail/api/guides',
                capabilities: [{ name: "list" }, { name: "send" }]
            },
            // Data / Media
            {
                slug: 'weather',
                name: 'Weather API',
                description: 'Get weather forecasts and current conditions.',
                icon_url: '/integrations/weather-icon.svg',
                category: 'data',
                auth_type: 'api_key',
                documentation_url: 'https://www.weatherapi.com/docs/',
                capabilities: [{ name: "get_current_weather" }, { name: "get_forecast" }]
            },
            {
                slug: 'spotify',
                name: 'Spotify',
                description: 'Search tracks and manage playback.',
                icon_url: '/integrations/spotify-icon.svg',
                category: 'media',
                auth_type: 'oauth2',
                documentation_url: 'https://developer.spotify.com/documentation/web-api',
                capabilities: [{ name: "search" }]
            },
            {
                slug: 'youtube',
                name: 'YouTube',
                description: 'Search and manage YouTube videos.',
                icon_url: '/integrations/youtube-icon.svg',
                category: 'media',
                auth_type: 'oauth2',
                documentation_url: 'https://developers.google.com/youtube/v3',
                capabilities: [{ name: "search" }, { name: "get_video" }]
            },
            // Productivity
            {
                slug: 'notion',
                name: 'Notion',
                description: 'Create pages and manage Notion workspace.',
                icon_url: '/integrations/notion-icon.svg',
                category: 'productivity',
                auth_type: 'oauth2',
                documentation_url: 'https://developers.notion.com/',
                capabilities: [{ name: "create_page" }, { name: "get_databases" }]
            },
            {
                slug: 'trello',
                name: 'Trello',
                description: 'Manage boards, lists, and cards.',
                icon_url: '/integrations/trello-icon.svg',
                category: 'productivity',
                auth_type: 'api_key',
                documentation_url: 'https://developer.atlassian.com/cloud/trello/',
                capabilities: [{ name: "create_board" }, { name: "get_lists" }, { name: "create_card" }, { name: "move_card" }, { name: "add_comment" }]
            },
            {
                slug: 'calendar',
                name: 'Google Calendar',
                description: 'Manage events and reminders.',
                icon_url: '/integrations/calendar-icon.svg',
                category: 'productivity',
                auth_type: 'oauth2',
                documentation_url: 'https://developers.google.com/calendar/api/guides/overview',
                capabilities: [{ name: "create_reminder" }, { name: "list_events" }]
            },
            {
                slug: 'google',
                name: 'Google Search',
                description: 'Search the web using Custom Search API.',
                icon_url: '/integrations/google-icon.svg',
                category: 'productivity',
                auth_type: 'api_key',
                documentation_url: 'https://developers.google.com/custom-search/v1/overview',
                capabilities: [{ name: "search" }]
            }
        ];

        for (const integ of integrationsToSeed) {
            const hivelangCode = (INTEGRATION_EXAMPLES as any)[integ.slug];
            if (!hivelangCode) {
                console.warn(`No Hivelang code found for ${integ.slug}`);
                continue;
            }

            const { error } = await supabase
                .from('integrations')
                .upsert({
                    slug: integ.slug,
                    name: integ.name,
                    description: integ.description,
                    icon_url: integ.icon_url,
                    category: integ.category,
                    auth_type: integ.auth_type,
                    requires_api_key: integ.auth_type === 'api_key',
                    documentation_url: integ.documentation_url,
                    status: 'active',
                    is_official: true,
                    is_verified: true,
                    hivelang_code: hivelangCode,
                    developer_id: systemUserId,
                    capabilities: integ.capabilities
                }, { onConflict: 'slug' });

            if (error) {
                console.error(`Error seeding ${integ.slug}:`, error);
                results.push(`Error ${integ.slug}: ${error.message}`);
            } else {
                results.push(`Upserted ${integ.slug}`);
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 200 });
    }
}
