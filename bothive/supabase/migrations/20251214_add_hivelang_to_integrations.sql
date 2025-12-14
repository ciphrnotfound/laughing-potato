-- Update Integrations with Real HiveLang Code
-- This migration adds executable hivelang_code to existing integrations
-- and creates new integrations (WhatsApp, Trello, Google Search)

-- ============================================
-- UPDATE: YouTube with HiveLang Code
-- ============================================
UPDATE integrations
SET hivelang_code = $HIVELANG$
@integration youtube
@auth oauth2
@category media
@description "Search and manage YouTube videos"

@capability search(query, max_results, type, order)
    response = http.get("https://www.googleapis.com/youtube/v3/search",
        params = {
            "part": "snippet",
            "q": query,
            "maxResults": max_results or "5",
            "type": type or "video",
            "order": order or "relevance",
            "key": user.api_key
        },
        headers = {
            "Authorization": f"Bearer {user.access_token}"
        }
    )
    
    if not response.ok {
        error(f"YouTube search failed: {response.error}")
    }
    
    items = []
    for item in response.data.items {
        items.push({
            "id": item.id.videoId,
            "title": item.snippet.title,
            "description": item.snippet.description,
            "channel": item.snippet.channelTitle,
            "thumbnail": item.snippet.thumbnails.default.url,
            "published": item.snippet.publishedAt
        })
    }
    
    return {
        "count": items.length,
        "items": items
    }

@capability get_video(video_id)
    response = http.get("https://www.googleapis.com/youtube/v3/videos",
        params = {
            "part": "snippet,statistics",
            "id": video_id,
            "key": user.api_key
        }
    )
    
    if not response.ok {
        error("Video not found")
    }
    
    video = response.data.items[0]
    return {
        "id": video.id,
        "title": video.snippet.title,
        "views": video.statistics.viewCount,
        "likes": video.statistics.likeCount,
        "channel": video.snippet.channelTitle
    }
$HIVELANG$
WHERE slug = 'youtube';

-- ============================================
-- UPDATE: Gmail with HiveLang Code
-- ============================================
UPDATE integrations
SET hivelang_code = $HIVELANG$
@integration gmail
@auth oauth2
@category communication
@description "Read and send emails via Gmail"

@capability list(max_results, unread_only)
    query = ""
    if unread_only {
        query = "is:unread"
    }
    
    response = http.get("https://gmail.googleapis.com/gmail/v1/users/me/messages",
        params = {
            "maxResults": max_results or "10",
            "q": query
        },
        headers = {
            "Authorization": f"Bearer {user.access_token}"
        }
    )
    
    if not response.ok {
        error(f"Gmail error: {response.error}")
    }
    
    items = []
    for msg in response.data.messages {
        detail = http.get(f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg.id}",
            headers = {"Authorization": f"Bearer {user.access_token}"}
        )
        
        headers_map = {}
        for header in detail.data.payload.headers {
            headers_map[header.name] = header.value
        }
        
        items.push({
            "id": msg.id,
            "from": headers_map["From"] or "",
            "subject": headers_map["Subject"] or "",
            "snippet": detail.data.snippet,
            "date": headers_map["Date"] or ""
        })
    }
    
    return {
        "count": items.length,
        "items": items
    }

@capability send(to, subject, body)
    raw_message = f"To: {to}\r\nSubject: {subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n{body}"
    encoded = btoa(raw_message)
    
    response = http.post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        headers = {
            "Authorization": f"Bearer {user.access_token}",
            "Content-Type": "application/json"
        },
        body = {
            "raw": encoded
        }
    )
    
    if not response.ok {
        error(f"Failed to send email: {response.error}")
    }
    
    return {
        "id": response.data.id,
        "sent": true
    }
$HIVELANG$
WHERE slug = 'gmail';

-- ============================================
-- UPDATE: Calendar with HiveLang Code
-- ============================================
UPDATE integrations
SET hivelang_code = $HIVELANG$
@integration calendar
@auth oauth2
@category productivity
@description "Manage Google Calendar events and reminders"

@capability create_reminder(text, time)
    now = Date.now()
    delay_ms = 0
    
    if time.endsWith("h") {
        delay_ms = parseInt(time) * 60 * 60 * 1000
    }
    if time.endsWith("m") {
        delay_ms = parseInt(time) * 60 * 1000
    }
    if time.endsWith("d") {
        delay_ms = parseInt(time) * 24 * 60 * 60 * 1000
    }
    
    reminder_time = new Date(now + delay_ms).toISOString()
    
    response = http.post("https://www.googleapis.com/calendar/v3/calendars/primary/events",
        headers = {
            "Authorization": f"Bearer {user.access_token}",
            "Content-Type": "application/json"
        },
        body = {
            "summary": text,
            "start": {"dateTime": reminder_time},
            "end": {"dateTime": reminder_time},
            "reminders": {
                "useDefault": false,
                "overrides": [{"method": "popup", "minutes": 0}]
            }
        }
    )
    
    if not response.ok {
        error(f"Failed to create reminder: {response.error}")
    }
    
    return {
        "id": response.data.id,
        "time": reminder_time,
        "created": true
    }

@capability list_events(days)
    now = new Date().toISOString()
    end = new Date(Date.now() + (days or 7) * 24 * 60 * 60 * 1000).toISOString()
    
    response = http.get("https://www.googleapis.com/calendar/v3/calendars/primary/events",
        params = {
            "timeMin": now,
            "timeMax": end,
            "singleEvents": "true",
            "orderBy": "startTime"
        },
        headers = {
            "Authorization": f"Bearer {user.access_token}"
        }
    )
    
    if not response.ok {
        error("Failed to fetch events")
    }
    
    return response.data.items
$HIVELANG$
WHERE slug = 'calendar';

-- ============================================
-- INSERT: WhatsApp Integration (NEW)
-- ============================================
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
    status,
    is_official,
    is_verified,
    hivelang_code
) VALUES (
    'f6g7h8i9-j0k1-l2m3-n4o5-p6q7r8s9t0u1',
    (SELECT id FROM auth.users LIMIT 1),
    'WhatsApp Business',
    'whatsapp',
    'Send and receive WhatsApp Business messages. Perfect for customer support and notification bots.',
    '/integrations/whatsapp-icon.svg',
    'communication',
    'api_key',
    true,
    'Get your WhatsApp Business API access from Meta Developer Portal: https://developers.facebook.com/docs/whatsapp/cloud-api/',
    '[
        {"name": "send_message", "description": "Send a text message", "params": ["to", "message"], "returns": "object"},
        {"name": "send_template", "description": "Send a template message", "params": ["to", "template_name", "language"], "returns": "boolean"},
        {"name": "get_unread", "description": "Get unread messages (via webhook)", "params": [], "returns": "array"}
    ]'::jsonb,
    'https://developers.facebook.com/docs/whatsapp/cloud-api',
    'active',
    true,
    true,
    $HIVELANG$
@integration whatsapp
@auth api_key
@category communication
@description "Send and receive WhatsApp Business messages"

@capability send_message(to, message)
    response = http.post(f"https://graph.facebook.com/v18.0/{user.phone_number_id}/messages",
        headers = {
            "Authorization": f"Bearer {user.access_token}",
            "Content-Type": "application/json"
        },
        body = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": message}
        }
    )
    
    if not response.ok {
        error(f"WhatsApp send failed: {response.error}")
    }
    
    return {
        "message_id": response.data.messages[0].id,
        "sent": true
    }

@capability send_template(to, template_name, language)
    response = http.post(f"https://graph.facebook.com/v18.0/{user.phone_number_id}/messages",
        headers = {
            "Authorization": f"Bearer {user.access_token}",
            "Content-Type": "application/json"
        },
        body = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language or "en"}
            }
        }
    )
    
    return response.ok

@capability get_unread()
    return user.pending_messages or []
$HIVELANG$
) ON CONFLICT (slug) DO UPDATE SET hivelang_code = EXCLUDED.hivelang_code;

-- ============================================
-- INSERT: Trello Integration (NEW)
-- ============================================
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
    status,
    is_official,
    is_verified,
    hivelang_code
) VALUES (
    'g7h8i9j0-k1l2-m3n4-o5p6-q7r8s9t0u1v2',
    (SELECT id FROM auth.users LIMIT 1),
    'Trello',
    'trello',
    'Manage Trello boards, lists, and cards. Perfect for project management and task automation bots.',
    '/integrations/trello-icon.svg',
    'productivity',
    'api_key',
    true,
    'Get your Trello API key and token from: https://trello.com/power-ups/admin',
    '[
        {"name": "create_board", "description": "Create a new board", "params": ["name", "description"], "returns": "object"},
        {"name": "get_lists", "description": "Get all lists in a board", "params": ["board_id"], "returns": "array"},
        {"name": "create_card", "description": "Create a new card", "params": ["list_id", "title", "description", "due_date"], "returns": "object"},
        {"name": "move_card", "description": "Move a card to another list", "params": ["card_id", "target_list_id"], "returns": "boolean"},
        {"name": "add_comment", "description": "Add a comment to a card", "params": ["card_id", "text"], "returns": "boolean"}
    ]'::jsonb,
    'https://developer.atlassian.com/cloud/trello/',
    'active',
    true,
    true,
    $HIVELANG$
@integration trello
@auth api_key
@category productivity
@description "Manage Trello boards, lists, and cards"

@capability create_board(name, description)
    response = http.post("https://api.trello.com/1/boards",
        params = {
            "key": user.api_key,
            "token": user.token,
            "name": name,
            "desc": description or ""
        }
    )
    
    if not response.ok {
        error(f"Failed to create board: {response.error}")
    }
    
    return {
        "id": response.data.id,
        "name": response.data.name,
        "url": response.data.url
    }

@capability get_lists(board_id)
    response = http.get(f"https://api.trello.com/1/boards/{board_id}/lists",
        params = {
            "key": user.api_key,
            "token": user.token
        }
    )
    
    if not response.ok {
        error("Failed to get lists")
    }
    
    items = []
    for list in response.data {
        items.push({
            "id": list.id,
            "name": list.name,
            "pos": list.pos
        })
    }
    return items

@capability create_card(list_id, title, description, due_date)
    response = http.post("https://api.trello.com/1/cards",
        params = {
            "key": user.api_key,
            "token": user.token,
            "idList": list_id,
            "name": title,
            "desc": description or "",
            "due": due_date or null
        }
    )
    
    if not response.ok {
        error(f"Failed to create card: {response.error}")
    }
    
    return {
        "id": response.data.id,
        "name": response.data.name,
        "url": response.data.url
    }

@capability move_card(card_id, target_list_id)
    response = http.put(f"https://api.trello.com/1/cards/{card_id}",
        params = {
            "key": user.api_key,
            "token": user.token,
            "idList": target_list_id
        }
    )
    
    return response.ok

@capability add_comment(card_id, text)
    response = http.post(f"https://api.trello.com/1/cards/{card_id}/actions/comments",
        params = {
            "key": user.api_key,
            "token": user.token,
            "text": text
        }
    )
    
    return response.ok
$HIVELANG$
) ON CONFLICT (slug) DO UPDATE SET hivelang_code = EXCLUDED.hivelang_code;

-- ============================================
-- INSERT: Google Search Integration (NEW)
-- ============================================
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
    status,
    is_official,
    is_verified,
    hivelang_code
) VALUES (
    'h8i9j0k1-l2m3-n4o5-p6q7-r8s9t0u1v2w3',
    (SELECT id FROM auth.users LIMIT 1),
    'Google Search',
    'google',
    'Search the web using Google Custom Search API. Perfect for research and data gathering bots.',
    '/integrations/google-icon.svg',
    'productivity',
    'api_key',
    true,
    'Get your API key from Google Cloud Console and create a Custom Search Engine at: https://programmablesearchengine.google.com/',
    '[
        {"name": "search", "description": "Search the web", "params": ["query", "type", "num_results"], "returns": "object"}
    ]'::jsonb,
    'https://developers.google.com/custom-search/v1/overview',
    'active',
    true,
    true,
    $HIVELANG$
@integration google
@auth api_key
@category productivity
@description "Search the web using Google Custom Search"

@capability search(query, type, num_results)
    file_type = ""
    if type == "pdf" {
        file_type = " filetype:pdf"
    }
    
    response = http.get("https://www.googleapis.com/customsearch/v1",
        params = {
            "key": user.api_key,
            "cx": user.search_engine_id,
            "q": f"{query}{file_type}",
            "num": num_results or "10"
        }
    )
    
    if not response.ok {
        error(f"Google search failed: {response.error}")
    }
    
    items = []
    for item in response.data.items {
        items.push({
            "title": item.title,
            "url": item.link,
            "snippet": item.snippet
        })
    }
    
    return {
        "count": items.length,
        "items": items
    }
$HIVELANG$
) ON CONFLICT (slug) DO UPDATE SET hivelang_code = EXCLUDED.hivelang_code;
