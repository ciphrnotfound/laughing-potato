-- Add missing Trello and WhatsApp Business integrations

-- Trello Integration
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
  'f5g6h7i8-j9k0-l1m2-n3o4-p5q6r7s8t9u0',
  (SELECT id FROM auth.users LIMIT 1),
  'Trello',
  'trello',
  'Manage boards, cards, and workflows in Trello. Perfect for project management and task automation bots.',
  '/integrations/trello-icon.svg',
  'productivity',
  'api_key',
  true,
  'Get your API key from Trello: https://trello.com/app-key (you\'ll also need a token)',
  '[
    {
      "name": "create_board",
      "description": "Create a new Trello board",
      "params": ["name", "description"],
      "returns": "object"
    },
    {
      "name": "create_card",
      "description": "Create a new card in a list",
      "params": ["list_id", "name", "description"],
      "returns": "object"
    },
    {
      "name": "move_card",
      "description": "Move a card between lists",
      "params": ["card_id", "target_list_id"],
      "returns": "object"
    },
    {
      "name": "get_lists",
      "description": "Get all lists in a board",
      "params": ["board_id"],
      "returns": "array"
    },
    {
      "name": "add_comment",
      "description": "Add a comment to a card",
      "params": ["card_id", "text"],
      "returns": "object"
    },
    {
      "name": "update_card",
      "description": "Update card properties",
      "params": ["card_id", "updates"],
      "returns": "object"
    }
  ]'::jsonb,
  'https://developer.atlassian.com/cloud/trello/',
  '@bot trello_manager
@integrations ["trello"]

@on_message
if contains(message, "create board"):
  board_name = extract_board_name(message)
  board = integration.trello.create_board({
    name: board_name,
    description: "Created by BotHive"
  })
  respond("Created Trello board: " + board.url)',
  'active',
  true,
  true
) ON CONFLICT (slug) DO NOTHING;

-- WhatsApp Business Integration
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
  is_verified,
  is_paid,
  price_per_month,
  free_tier_limit
) VALUES (
  'g6h7i8j9-k0l1-m2n3-o4p5-q6r7s8t9u0v1',
  (SELECT id FROM auth.users LIMIT 1),
  'WhatsApp Business',
  'whatsapp',
  'Send and receive WhatsApp messages for business automation. Perfect for customer support and notification bots.',
  '/integrations/whatsapp-icon.svg',
  'communication',
  'api_key',
  true,
  'Get your WhatsApp Business API credentials from Meta Business Suite or a Business Solution Provider',
  '[
    {
      "name": "send_message",
      "description": "Send a WhatsApp message",
      "params": ["phone_number", "message"],
      "returns": "object"
    },
    {
      "name": "send_template_message",
      "description": "Send a template message",
      "params": ["phone_number", "template_name", "parameters"],
      "returns": "object"
    },
    {
      "name": "get_message_status",
      "description": "Get delivery status of a message",
      "params": ["message_id"],
      "returns": "object"
    },
    {
      "name": "get_templates",
      "description": "Get available message templates",
      "params": [],
      "returns": "array"
    }
  ]'::jsonb,
  'https://developers.facebook.com/docs/whatsapp/business-management-api',
  '@bot whatsapp_assistant
@integrations ["whatsapp"]

@on_message
if contains(message, "send whatsapp"):
  phone = extract_phone_number(message)
  text = extract_message_text(message)
  result = integration.whatsapp.send_message({
    phone_number: phone,
    message: text
  })
  respond("WhatsApp message sent successfully!")',
  'active',
  true,
  true,
  true, -- is_paid
  19.99, -- price_per_month
  100 -- free_tier_limit (100 free messages per month)
) ON CONFLICT (slug) DO NOTHING;