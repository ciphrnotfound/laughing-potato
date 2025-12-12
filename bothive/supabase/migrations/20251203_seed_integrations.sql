-- Seed Official Integrations
-- These are BotHive's official integrations available to all developers

-- YouTube Integration
INSERT INTO integrations (
  id,
  developer_id,
  name,
  slug,
  description,
  icon_url,
  category,
  auth_type,
  requires_api_key,
  api_key_instructions,
  capabilities,
  documentation_url,
  code_example,
  status,
  is_official,
  is_verified
) VALUES (
  'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  (SELECT id FROM auth.users LIMIT 1), -- System user
  'YouTube API',
  'youtube',
  'Access YouTube videos, transcripts, and metadata. Perfect for content summarization and video analysis bots.',
  '/integrations/youtube-icon.svg',
  'media',
  'api_key',
  true,
  'Get your free API key from Google Cloud Console: https://console.cloud.google.com/apis/credentials',
  '[
    {
      "name": "get_video_info",
      "description": "Get video metadata including title, description, views, likes",
      "params": ["video_id"],
      "returns": "object"
    },
    {
      "name": "get_transcript",
      "description": "Get video transcript/captions",
      "params": ["video_id", "language"],
      "returns": "string"
    },
    {
      "name": "search_videos",
      "description": "Search for videos by query",
      "params": ["query", "max_results"],
      "returns": "array"
    }
  ]'::jsonb,
  'https://developers.google.com/youtube/v3',
  '@bot video_summarizer
@integrations ["youtube"]

@on_message
if contains(message, "youtube.com"):
  video_id = extract_youtube_id(message)
  transcript = integration.youtube.get_transcript(video_id)
  summary = ai.summarize(transcript)
  respond(summary)',
  'active',
  true,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Notion Integration
INSERT INTO integrations (
  id,
  developer_id,
  name,
  slug,
  description,
  icon_url,
  category,
  auth_type,
  oauth_config,
  capabilities,
  documentation_url,
  code_example,
  status,
  is_official,
  is_verified
) VALUES (
  'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7',
  (SELECT id FROM auth.users LIMIT 1),
  'Notion',
  'notion',
  'Create pages, databases, and organize your knowledge in Notion. Perfect for note-taking and productivity bots.',
  '/integrations/notion-icon.svg',
  'productivity',
  'oauth2',
  '{
    "client_id": "YOUR_CLIENT_ID",
    "scopes": ["read_content", "update_content"],
    "auth_url": "https://api.notion.com/v1/oauth/authorize",
    "token_url": "https://api.notion.com/v1/oauth/token"
  }'::jsonb,
  '[
    {
      "name": "create_page",
      "description": "Create a new page in a database",
      "params": ["database_id", "title", "content"],
      "returns": "object"
    },
    {
      "name": "update_page",
      "description": "Update an existing page",
      "params": ["page_id", "content"],
      "returns": "object"
    },
    {
      "name": "search_pages",
      "description": "Search for pages by title or content",
      "params": ["query"],
      "returns": "array"
    }
  ]'::jsonb,
  'https://developers.notion.com',
  '@bot notion_organizer
@integrations ["notion"]

@on_message
notion_page = integration.notion.create_page({
  database_id: user.notion_db,
  title: "New Note",
  content: message
})
respond("Created: " + notion_page.url)',
  'active',
  true,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Gmail Integration
INSERT INTO integrations (
  id,
  developer_id,
  name,
  slug,
  description,
  icon_url,
  category,
  auth_type,
  oauth_config,
  capabilities,
  documentation_url,
  status,
  is_official,
  is_verified
) VALUES (
  'c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8',
  (SELECT id FROM auth.users LIMIT 1),
  'Gmail',
  'gmail',
  'Send and read emails, manage your inbox. Perfect for email automation and assistant bots.',
  '/integrations/gmail-icon.svg',
  'communication',
  'oauth2',
  '{
    "client_id": "YOUR_CLIENT_ID",
    "scopes": ["https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.readonly"],
    "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
    "token_url": "https://oauth2.googleapis.com/token"
  }'::jsonb,
  '[
    {
      "name": "send_email",
      "description": "Send an email",
      "params": ["to", "subject", "body"],
      "returns": "object"
    },
    {
      "name": "get_inbox",
      "description": "Get recent emails from inbox",
      "params": ["limit"],
      "returns": "array"
    },
    {
      "name": "search_emails",
      "description": "Search emails by query",
      "params": ["query"],
      "returns": "array"
    }
  ]'::jsonb,
  'https://developers.google.com/gmail/api',
  'active',
  true,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Google Calendar Integration
INSERT INTO integrations (
  id,
  developer_id,
  name,
  slug,
  description,
  icon_url,
  category,
  auth_type,
  oauth_config,
  capabilities,
  status,
  is_official,
  is_verified
) VALUES (
  'd4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9',
  (SELECT id FROM auth.users LIMIT 1),
  'Google Calendar',
  'calendar',
  'Create and manage calendar events. Perfect for scheduling and reminder bots.',
  '/integrations/calendar-icon.svg',
  'productivity',
  'oauth2',
  '{
    "client_id": "YOUR_CLIENT_ID",
    "scopes": ["https://www.googleapis.com/auth/calendar"],
    "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
    "token_url": "https://oauth2.googleapis.com/token"
  }'::jsonb,
  '[
    {
      "name": "create_event",
      "description": "Create a calendar event",
      "params": ["title", "start", "end", "description"],
      "returns": "object"
    },
    {
      "name": "get_upcoming_events",
      "description": "Get upcoming events",
      "params": ["days"],
      "returns": "array"
    },
    {
      "name": "delete_event",
      "description": "Delete an event",
      "params": ["event_id"],
      "returns": "boolean"
    }
  ]'::jsonb,
  'active',
  true,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Image OCR Integration
INSERT INTO integrations (
  id,
  developer_id,
  name,
  slug,
  description,
  icon_url,
  category,
  auth_type,
  capabilities,
  status,
  is_official,
  is_verified,
  free_tier_limit
) VALUES (
  'e5f6g7h8-i9j0-k1l2-m3n4-o5p6q7r8s9t0',
  (SELECT id FROM auth.users LIMIT 1),
  'Image OCR',
  'ocr',
  'Extract text from images and handwritten notes. Perfect for study and note-taking bots.',
  '/integrations/ocr-icon.svg',
  'ai',
  'none',
  '[
    {
      "name": "extract_text",
      "description": "Extract printed text from image",
      "params": ["image_url"],
      "returns": "string"
    },
    {
      "name": "analyze_handwriting",
      "description": "Extract handwritten text from image",
      "params": ["image_url"],
      "returns": "string"
    }
  ]'::jsonb,
  'active',
  true,
  true,
  100
) ON CONFLICT (slug) DO NOTHING;
