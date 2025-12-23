-- Seed Official Integrations
INSERT INTO integrations (slug, name, description, category, type, features, pricing_model, setup_time, is_active, developer_id)
VALUES 
(
  'slack', 
  'Slack', 
  'Team communication and collaboration platform with message automation and workflow triggers.', 
  'communication', 
  'oauth', 
  '["Message posting", "Channel monitoring", "Workflow triggers"]'::jsonb, 
  'freemium', 
  '2 minutes', 
  true,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'github', 
  'GitHub', 
  'Code hosting and version control with repository management and PR automation.', 
  'developer', 
  'oauth', 
  '["Issue tracking", "PR automation", "Repo stats"]'::jsonb, 
  'freemium', 
  '2 minutes', 
  true,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'twitter', 
  'Twitter/X', 
  'Social media platform for automated posting and engagement tracking.', 
  'social', 
  'oauth', 
  '["Automated posting", "Trend monitoring"]'::jsonb, 
  'free', 
  '3 minutes', 
  true,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'openai', 
  'OpenAI', 
  'Advanced AI models for content generation and analysis.', 
  'ai', 
  'api_key', 
  '["Text generation", "Image generation", "Embeddings"]'::jsonb, 
  'paid', 
  '1 minute', 
  true,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'notion', 
  'Notion', 
  'All-in-one workspace for notes, docs, and project management.', 
  'productivity', 
  'oauth', 
  '["Page creation", "Database queries", "Table updates"]'::jsonb, 
  'freemium', 
  '3 minutes', 
  true,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'discord', 
  'Discord', 
  'Voice, video, and text communication platform for communities.', 
  'communication', 
  'api_key', 
  '["Webhook sending", "Message posting"]'::jsonb, 
  'free', 
  '2 minutes', 
  true,
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  type = EXCLUDED.type,
  features = EXCLUDED.features;
