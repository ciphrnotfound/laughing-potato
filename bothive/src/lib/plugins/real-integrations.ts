/**
 * Real Integration Definitions
 * Actual integrations with proper metadata and icons
 */

import { theHive, HiveToolMetadata } from './registry';
import {
    tiktokReplyComment,
    tiktokMaintainStreak,
    tiktokGetTrends,
} from './examples/tiktok';
import {
    youtubeSummarizeVideo,
    youtubeAnalyzeComments,
    youtubeGetAnalytics,
} from './examples/youtube';
import {
    githubCreateIssue,
    githubAutoMergePR,
    githubGetRepoStats,
} from './examples/github';
import {
    notionCreatePage,
    notionQueryDatabase,
    notionUpdatePage,
} from './examples/notion';
import {
    airtableCreateRecord,
    airtableListRecords,
    airtableUpdateRecord,
} from './examples/airtable';

/**
 * Register all real integrations
 */
export async function registerRealIntegrations() {
    // TikTok Integration
    theHive.register(tiktokReplyComment, {
        displayName: 'TikTok - Auto Reply',
        category: 'social',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'oauth2',
        documentationUrl: 'https://docs.bothive.app/integrations/tiktok',
        tags: ['tiktok', 'social', 'comments', 'engagement'],
        downloads: 1234,
        rating: 4.8,
    });

    theHive.register(tiktokMaintainStreak, {
        displayName: 'TikTok - Maintain Streak',
        category: 'social',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'oauth2',
        tags: ['tiktok', 'posting', 'automation', 'streak'],
        downloads: 892,
        rating: 4.7,
    });

    theHive.register(tiktokGetTrends, {
        displayName: 'TikTok - Get Trends',
        category: 'social',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'oauth2',
        tags: ['tiktok', 'trends', 'analytics'],
        downloads: 2156,
        rating: 4.9,
    });

    // YouTube Integration
    theHive.register(youtubeSummarizeVideo, {
        displayName: 'YouTube - AI Summarizer',
        category: 'entertainment',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: true,
        requiresAuth: true,
        authType: 'api_key',
        tags: ['youtube', 'ai', 'summary', 'productivity'],
        downloads: 3421,
        rating: 4.9,
    });

    theHive.register(youtubeAnalyzeComments, {
        displayName: 'YouTube - Comment Analyzer',
        category: 'entertainment',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'oauth2',
        tags: ['youtube', 'analytics', 'sentiment'],
        downloads: 1678,
        rating: 4.6,
    });

    theHive.register(youtubeGetAnalytics, {
        displayName: 'YouTube - Channel Analytics',
        category: 'entertainment',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'oauth2',
        tags: ['youtube', 'analytics', 'metrics'],
        downloads: 2893,
        rating: 4.8,
    });

    // GitHub Integration
    theHive.register(githubCreateIssue, {
        displayName: 'GitHub - Create Issue',
        category: 'developer',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'api_key',
        tags: ['github', 'issues', 'tracking'],
        downloads: 4521,
        rating: 4.7,
    });

    theHive.register(githubAutoMergePR, {
        displayName: 'GitHub - Auto Merge PRs',
        category: 'developer',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: true,
        requiresAuth: true,
        authType: 'api_key',
        tags: ['github', 'pull-requests', 'ci/cd', 'automation'],
        downloads: 2134,
        rating: 4.9,
    });

    theHive.register(githubGetRepoStats, {
        displayName: 'GitHub - Repo Stats',
        category: 'developer',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'api_key',
        tags: ['github', 'analytics', 'metrics'],
        downloads: 3891,
        rating: 4.8,
    });

    // Notion Integration
    theHive.register(notionCreatePage, {
        displayName: 'Notion - Create Page',
        category: 'productivity',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'oauth2',
        tags: ['notion', 'notes', 'productivity'],
        downloads: 5621,
        rating: 4.8,
    });

    theHive.register(notionQueryDatabase, {
        displayName: 'Notion - Query Database',
        category: 'productivity',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'oauth2',
        tags: ['notion', 'database', 'query'],
        downloads: 4231,
        rating: 4.7,
    });

    theHive.register(notionUpdatePage, {
        displayName: 'Notion - Update Page',
        category: 'productivity',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'oauth2',
        tags: ['notion', 'update', 'productivity'],
        downloads: 3456,
        rating: 4.6,
    });

    // Airtable Integration
    theHive.register(airtableCreateRecord, {
        displayName: 'Airtable - Create Record',
        category: 'data',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'api_key',
        tags: ['airtable', 'database', 'create'],
        downloads: 2891,
        rating: 4.7,
    });

    theHive.register(airtableListRecords, {
        displayName: 'Airtable - List Records',
        category: 'data',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'api_key',
        tags: ['airtable', 'database', 'query'],
        downloads: 3421,
        rating: 4.8,
    });

    theHive.register(airtableUpdateRecord, {
        displayName: 'Airtable - Update Record',
        category: 'data',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'api_key',
        tags: ['airtable', 'database', 'update'],
        downloads: 2567,
        rating: 4.6,
    });

    // Gmail Integration
    const { gmailSendEmail, gmailReadInbox } = await import('./examples/gmail');

    theHive.register(gmailSendEmail, {
        displayName: 'Gmail - Send Email',
        category: 'communication',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'oauth2',
        tags: ['gmail', 'email', 'send'],
        downloads: 6234,
        rating: 4.9,
    });

    theHive.register(gmailReadInbox, {
        displayName: 'Gmail - Read Inbox',
        category: 'communication',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'oauth2',
        tags: ['gmail', 'email', 'read'],
        downloads: 5123,
        rating: 4.7,
    });

    // Slack Integration
    const { slackSendMessage, slackCreateChannel } = await import('./examples/slack');

    theHive.register(slackSendMessage, {
        displayName: 'Slack - Send Message',
        category: 'communication',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'oauth2',
        tags: ['slack', 'messaging', 'team'],
        downloads: 7891,
        rating: 4.8,
    });

    theHive.register(slackCreateChannel, {
        displayName: 'Slack - Create Channel',
        category: 'communication',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'oauth2',
        tags: ['slack', 'channels', 'workspace'],
        downloads: 3421,
        rating: 4.6,
    });

    // Discord Integration
    const { discordSendMessage, discordCreateWebhook } = await import('./examples/discord');

    theHive.register(discordSendMessage, {
        displayName: 'Discord - Send Message',
        category: 'communication',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'api_key',
        tags: ['discord', 'messaging', 'community'],
        downloads: 5678,
        rating: 4.7,
    });

    theHive.register(discordCreateWebhook, {
        displayName: 'Discord - Create Webhook',
        category: 'communication',
        author: 'BotHive Team',
        version: '1.0.0',
        isOfficial: true,
        isPremium: false,
        requiresAuth: true,
        authType: 'api_key',
        tags: ['discord', 'webhooks', 'automation'],
        downloads: 4123,
        rating: 4.8,
    });

    console.log('✅ Registered 21 real integrations');
}

// Auto-register on server
if (typeof window === 'undefined') {
    registerRealIntegrations().catch(console.error);
}
