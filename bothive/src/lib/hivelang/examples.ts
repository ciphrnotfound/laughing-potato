/**
 * Simplified HiveLang Integration Examples
 * Using new Python-like syntax NO BRACES for calls
 */

// ============================================
// VERCEL DEPLOYMENT
// ============================================
export const VERCEL_INTEGRATION = `
@integration vercel_deploy
@auth api_key
@category developer_tools
@description "Deploy Next.js, React, and static sites to Vercel"

@capability deploy_project(project_name, git_branch)
    response = http.post("https://api.vercel.com/v13/deployments", headers: {"Authorization": f"Bearer {user.api_key}"}, body: {"name": project_name, "gitSource": {"type": "github", "ref": git_branch}})
    
    if not response.ok {
        error(f"Deployment failed: {response.error.message}")
    }
    
    deployment = response.data
    
    return { "id": deployment.id, "url": f"https://{deployment.url}", "state": deployment.readyState, "created_at": deployment.createdAt }

@capability get_deployments(project_name)
    response = http.get(f"https://api.vercel.com/v6/deployments", params: {"app": project_name}, headers: {"Authorization": f"Bearer {user.api_key}"})
    
    if not response.ok {
        error("Failed to fetch deployments")
    }
    
    return response.data.deployments.slice(0, 5)
`;

// ============================================
// STRIPE PAYMENTS
// ============================================
export const STRIPE_INTEGRATION = `
@integration stripe_payments
@auth api_key
@category payments
@description "Accept payments and manage subscriptions with Stripe"

@capability create_payment(amount, currency, description)
    response = http.post("https://api.stripe.com/v1/payment_intents", headers: {"Authorization": f"Bearer {user.api_key}", "Content-Type": "application/x-www-form-urlencoded"}, body: f"amount={amount}&currency={currency}&description={description}")
    
    if not response.ok {
        error(f"Payment failed: {response.error.message}")
    }
    
    payment = response.data
    
    return { "id": payment.id, "amount": payment.amount, "currency": payment.currency, "status": payment.status, "client_secret": payment.client_secret }

@capability refund_payment(payment_id)
    response = http.post("https://api.stripe.com/v1/refunds", headers: {"Authorization": f"Bearer {user.api_key}", "Content-Type": "application/x-www-form-urlencoded"}, body: f"payment_intent={payment_id}")
    
    return response.ok
`;

// ============================================
// SENDGRID EMAIL
// ============================================
export const SENDGRID_INTEGRATION = `
@integration sendgrid_email
@auth api_key
@category communication
@description "Send transactional and marketing emails"

@capability send_email(to, subject, body, from_email)
    response = http.post("https://api.sendgrid.com/v3/mail/send", headers: {"Authorization": f"Bearer {user.api_key}", "Content-Type": "application/json"}, body: {"personalizations": [{"to": [{"email": to}]}], "from": {"email": from_email}, "subject": subject, "content": [{"type": "text/plain", "value": body}]})
    
    return response.status == 202
`;

// ============================================
// GITHUB API
// ============================================
export const GITHUB_INTEGRATION = `
@integration github_api
@auth api_key
@category developer_tools
@description "Manage repositories, issues, and PRs"

@capability create_issue(repo_owner, repo_name, title, body)
    response = http.post(f"https://api.github.com/repos/{repo_owner}/{repo_name}/issues", headers: {"Authorization": f"token {user.api_key}", "Accept": "application/vnd.github.v3+json"}, body: {"title": title, "body": body})
    
    if not response.ok {
        error(f"Failed to create issue: {response.error.message}")
    }
    
    issue = response.data
    
    return { "id": issue.id, "number": issue.number, "url": issue.html_url, "state": issue.state }

@capability list_issues(repo_owner, repo_name, state)
    response = http.get(f"https://api.github.com/repos/{repo_owner}/{repo_name}/issues", params: {"state": state}, headers: {"Authorization": f"token {user.api_key}", "Accept": "application/vnd.github.v3+json"})
    
    if not response.ok {
        error("Failed to fetch issues")
    }
    
    return response.data
`;

// ============================================
// WEATHER API (Simple Example)
// ============================================
export const WEATHER_INTEGRATION = `
@integration weather_api
@auth api_key
@category data
@description "Get weather forecasts and current conditions"

@capability get_current_weather(city)
    response = http.get("https://api.weatherapi.com/v1/current.json", params: {"q": city, "key": user.api_key})
    
    if not response.ok {
        error(f"City not found: {city}")
    }
    
    return response.data.current

@capability get_forecast(city, days)
    response = http.get("https://api.weatherapi.com/v1/forecast.json", params: {"q": city, "days": days, "key": user.api_key})
    
    if not response.ok {
        error("Failed to fetch forecast")
    }
    
    return response.data.forecast
`;

// ============================================
// NOTION (Complex Example)
// ============================================
export const NOTION_INTEGRATION = `
@integration notion
@auth oauth2
@category productivity
@description "Create pages and manage Notion workspace"

@capability create_page(parent_id, title, content)
    response = http.post("https://api.notion.com/v1/pages", headers: {"Authorization": f"Bearer {user.access_token}", "Notion-Version": "2022-06-28", "Content-Type": "application/json"}, body: {"parent": {"page_id": parent_id}, "properties": {"title": {"title": [{"text": {"content": title}}]}}, "children": [{"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": content}}]}}]})
    
    if not response.ok {
        error(f"Failed to create page: {response.error}")
    }
    
    return { "id": response.data.id, "url": response.data.url, "title": title }

@capability get_databases()
    response = http.post("https://api.notion.com/v1/search", headers: {"Authorization": f"Bearer {user.access_token}", "Notion-Version": "2022-06-28"}, body: {"filter": {"property": "object", "value": "database"}})
    
    if not response.ok {
        error("Failed to fetch databases")
    }
    
    databases = []
    for db in response.data.results {
        databases.push({"id": db.id, "title": db.title[0].plain_text || "Untitled"})
    }
    
    return databases

@capability create_database(parent_page_id, title)
    response = http.post("https://api.notion.com/v1/databases", headers: {"Authorization": f"Bearer {user.access_token}", "Notion-Version": "2022-06-28", "Content-Type": "application/json"}, body: {"parent": {"page_id": parent_page_id}, "title": [{"type": "text", "text": {"content": title}}], "properties": {"Name": {"title": {}}, "Description": {"rich_text": {}}}})
    
    if not response.ok {
        error(f"Failed to create database: {response.error}")
    }
    
    return { "id": response.data.id, "url": response.data.url, "title": title }
`;

// ============================================
// YOUTUBE DATA API
// ============================================
export const YOUTUBE_INTEGRATION = `
@integration youtube
@auth oauth2
@category media
@description "Search and manage YouTube videos"

@capability search(query, max_results, type, order)
    response = http.get("https://www.googleapis.com/youtube/v3/search", params: {"part": "snippet", "q": query, "maxResults": max_results or "5", "type": type or "video", "order": order or "relevance", "key": user.api_key}, headers: {"Authorization": f"Bearer {user.access_token}"})
    
    if not response.ok {
        error(f"YouTube search failed: {response.error}")
    }
    
    items = []
    for item in response.data.items {
        items.push({"id": item.id.videoId, "title": item.snippet.title, "description": item.snippet.description, "channel": item.snippet.channelTitle, "thumbnail": item.snippet.thumbnails.default.url, "published": item.snippet.publishedAt})
    }
    
    return { "count": items.length, "items": items }

@capability get_video(video_id)
    response = http.get("https://www.googleapis.com/youtube/v3/videos", params: {"part": "snippet,statistics", "id": video_id, "key": user.api_key})
    
    if not response.ok {
        error("Video not found")
    }
    
    video = response.data.items[0]
    return { "id": video.id, "title": video.snippet.title, "views": video.statistics.viewCount, "likes": video.statistics.likeCount, "channel": video.snippet.channelTitle }
`;

// ============================================
// GMAIL API
// ============================================
export const GMAIL_INTEGRATION = `
@integration gmail
@auth oauth2
@category communication
@description "Read and send emails via Gmail"

@capability list(max_results, unread_only)
    query = ""
    if unread_only {
        query = "is:unread"
    }
    
    response = http.get("https://gmail.googleapis.com/gmail/v1/users/me/messages", params: {"maxResults": max_results or "10", "q": query}, headers: {"Authorization": f"Bearer {user.access_token}"})
    
    if not response.ok {
        error(f"Gmail error: {response.error}")
    }
    
    items = []
    for msg in response.data.messages {
        detail = http.get(f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg.id}", headers: {"Authorization": f"Bearer {user.access_token}"})
        
        headers_map = {}
        for header in detail.data.payload.headers {
            headers_map[header.name] = header.value
        }
        
        items.push({"id": msg.id, "from": headers_map["From"] or "", "subject": headers_map["Subject"] or "", "snippet": detail.data.snippet, "date": headers_map["Date"] or ""})
    }
    
    return { "count": items.length, "items": items }

@capability send(to, subject, body)
    raw_message = f"To: {to}\\r\\nSubject: {subject}\\r\\nContent-Type: text/plain; charset=utf-8\\r\\n\\r\\n{body}"
    encoded = btoa(raw_message)
    
    response = http.post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", headers: {"Authorization": f"Bearer {user.access_token}", "Content-Type": "application/json"}, body: {"raw": encoded})
    
    if not response.ok {
        error(f"Failed to send email: {response.error}")
    }
    
    return { "id": response.data.id, "sent": true }
`;

// ============================================
// GOOGLE SEARCH (Custom Search API)
// ============================================
export const GOOGLE_SEARCH_INTEGRATION = `
@integration google
@auth api_key
@category productivity
@description "Search the web using Google Custom Search"

@capability search(query, type, num_results)
    file_type = ""
    if type == "pdf" {
        file_type = " filetype:pdf"
    }
    
    response = http.get("https://www.googleapis.com/customsearch/v1", params: {"key": user.api_key, "cx": user.search_engine_id, "q": f"{query}{file_type}", "num": num_results or "10"})
    
    if not response.ok {
        error(f"Google search failed: {response.error}")
    }
    
    items = []
    for item in response.data.items {
        items.push({"title": item.title, "url": item.link, "snippet": item.snippet})
    }
    
    return { "count": items.length, "items": items }
`;

// ============================================
// CALENDAR (Google Calendar)
// ============================================
export const CALENDAR_INTEGRATION = `
@integration calendar
@auth oauth2
@category productivity
@description "Manage Google Calendar events and reminders"

@capability create_reminder(text, time)
    # Parse relative time (e.g., "1h", "30m", "1d")
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
    
    response = http.post("https://www.googleapis.com/calendar/v3/calendars/primary/events", headers: {"Authorization": f"Bearer {user.access_token}", "Content-Type": "application/json"}, body: {"summary": text, "start": {"dateTime": reminder_time}, "end": {"dateTime": reminder_time}, "reminders": {"useDefault": false, "overrides": [{"method": "popup", "minutes": 0}]}})
    
    if not response.ok {
        error(f"Failed to create reminder: {response.error}")
    }
    
    return { "id": response.data.id, "time": reminder_time, "created": true }

@capability list_events(days)
    now = new Date().toISOString()
    end = new Date(Date.now() + (days or 7) * 24 * 60 * 60 * 1000).toISOString()
    
    response = http.get("https://www.googleapis.com/calendar/v3/calendars/primary/events", params: {"timeMin": now, "timeMax": end, "singleEvents": "true", "orderBy": "startTime"}, headers: {"Authorization": f"Bearer {user.access_token}"})
    
    if not response.ok {
        error("Failed to fetch events")
    }
    
    return response.data.items
`;

// ============================================
// WHATSAPP BUSINESS API
// ============================================
export const WHATSAPP_INTEGRATION = `
@integration whatsapp
@auth api_key
@category communication
@description "Send and receive WhatsApp Business messages"

@capability send_message(to, message)
    response = http.post("https://graph.facebook.com/v18.0/{user.phone_number_id}/messages", headers: {"Authorization": f"Bearer {user.access_token}", "Content-Type": "application/json"}, body: {"messaging_product": "whatsapp", "to": to, "type": "text", "text": {"body": message}})
    
    if not response.ok {
        error(f"WhatsApp send failed: {response.error}")
    }
    
    return { "message_id": response.data.messages[0].id, "sent": true }

@capability send_template(to, template_name, language)
    response = http.post("https://graph.facebook.com/v18.0/{user.phone_number_id}/messages", headers: {"Authorization": f"Bearer {user.access_token}", "Content-Type": "application/json"}, body: {"messaging_product": "whatsapp", "to": to, "type": "template", "template": {"name": template_name, "language": {"code": language or "en"}}})
    
    return response.ok

@capability get_unread()
    # This would typically be handled via webhooks
    return user.pending_messages or []
`;

// ============================================
// TRELLO API
// ============================================
export const TRELLO_INTEGRATION = `
@integration trello
@auth api_key
@category productivity
@description "Manage Trello boards, lists, and cards"

@capability create_board(name, description)
    response = http.post("https://api.trello.com/1/boards", params: {"key": user.api_key, "token": user.token, "name": name, "desc": description or ""})
    
    if not response.ok {
        error(f"Failed to create board: {response.error}")
    }
    
    return { "id": response.data.id, "name": response.data.name, "url": response.data.url }

@capability get_lists(board_id)
    response = http.get(f"https://api.trello.com/1/boards/{board_id}/lists", params: {"key": user.api_key, "token": user.token})
    
    if not response.ok {
        error("Failed to get lists")
    }
    
    items = []
    for list in response.data {
        items.push({"id": list.id, "name": list.name, "pos": list.pos})
    }
    return items

@capability create_card(list_id, title, description, due_date)
    response = http.post("https://api.trello.com/1/cards", params: {"key": user.api_key, "token": user.token, "idList": list_id, "name": title, "desc": description or "", "due": due_date or null})
    
    if not response.ok {
        error(f"Failed to create card: {response.error}")
    }
    
    return { "id": response.data.id, "name": response.data.name, "url": response.data.url }

@capability move_card(card_id, target_list_id)
    response = http.put(f"https://api.trello.com/1/cards/{card_id}", params: {"key": user.api_key, "token": user.token, "idList": target_list_id})
    
    return response.ok

@capability add_comment(card_id, text)
    response = http.post(f"https://api.trello.com/1/cards/{card_id}/actions/comments", params: {"key": user.api_key, "token": user.token, "text": text})
    
    return response.ok
`;

// ============================================
// ULTIMATE STUDY BUDDY SWARM
// A comprehensive multi-agent study assistant
// ============================================
export const STUDY_BUDDY_SWARM = `
bot StudyBuddySwarm
  description "Your ultimate AI study companion with specialized agents"
  
  memory session
    var handled boolean
  end

  # ═══════════════════════════════════════════════════════════════
  # RESEARCH AGENT - Finds learning materials
  # ═══════════════════════════════════════════════════════════════
  agent ResearchAgent
    on input
      if task == "find_resources"
        parallel
          call youtube.search with query: f"{topic} tutorial explained", max_results: "5" as videos
          
          call google.search with query: f"{topic} study guide pdf", type: "pdf" as pdfs
          
          call google.search with query: f"{topic} lecture notes", type: "web" as notes

          call spotify.search with query: f"lofi study music", type: "playlist" as playlists
        end
        
        return { "videos": videos.items, "pdfs": pdfs.items, "notes": notes.items, "music": playlists, "topic": topic }
      end
    end
  end

  # ═══════════════════════════════════════════════════════════════
  # PROJECT MANAGER AGENT - Manages study tasks in Trello
  # ═══════════════════════════════════════════════════════════════
  agent ProjectManagerAgent
    on input
      if task == "create_study_plan"
        # Create a study board
        call trello.create_board with name: f"📚 Study: {subject}", description: f"Study plan for {subject} - managed by Study Buddy" as board
        
        remember studyPlan { "boardId": board.id, "subject": subject }
        
        # Get the default lists
        call trello.get_lists with board_id: board.id as lists
        
        # Create cards for each topic
        loop topic in topics
          call trello.create_card with list_id: lists[0].id, title: topic.name, description: topic.description, due_date: topic.deadline
        end
        
        say "📋 Created study board: " + board.url
        return board
      end
    end
    
    on input
      if task == "mark_complete"
        call trello.move_card with card_id: cardId, target_list_id: doneListId
        
        set $studyStreak to $studyStreak + 1
        say "✅ Marked complete! 🔥 Study streak: " + $studyStreak
      end
    end
  end

  # ═══════════════════════════════════════════════════════════════
  # COMMUNICATION AGENT - Handles notifications via WhatsApp/Email/Slack/Discord
  # ═══════════════════════════════════════════════════════════════
  agent CommunicationAgent
    on input
      if task == "notify"
        try
          parallel
              if whatsapp
                  call whatsapp.send_message with to: phone, message: message
              end

              if email
                  call gmail.send with to: email_address, subject: f"📚 Study Buddy Alert", body: message
              end

              if slack
                  call slack.send_message with channel: slack_channel, text: message
              end

              if discord
                  call discord.send_message with channel_id: discord_channel_id, content: message
              end
          end
          say "📣 Notifications sent!"
        onerror
          say "⚠️ Some notifications failed: " + error
        end
      end
    end
    
    on input
      if task == "check_messages"
        parallel
          call whatsapp.get_unread as whatsappMsgs
          call gmail.list with max_results: "5", unread_only: "true" as emails
        end
        
        say "📬 You have " + whatsappMsgs.length + " WhatsApp messages"
        say "📧 You have " + emails.count + " unread emails"
        
        return { "whatsapp": whatsappMsgs, "email": emails.items }
      end
    end
  end

  # ═══════════════════════════════════════════════════════════════
  # KNOWLEDGE AGENT - Manages Notion
  # ═══════════════════════════════════════════════════════════════
  agent KnowledgeAgent
    on input
      if task == "create_schedule"
        say "🔍 Searching for Notion parent pages..."
        
        # In a real scenario, we'd list pages to find a good parent.
        # For now, we'll try to find a page named "Dashboard" or just ask the user.
        # call notion.search with query: "Dashboard" as searchResults
        
        # let parentId = ""
        # if searchResults and searchResults.length > 0
        #   parentId = searchResults[0].id
        # end
        
        # Since search tool might not be ready, let's prompt if we can't find one, or try a safe default if the tool supports root creation (it usually doesn't).
        
        say "To create a database, I need a 'Parent Page' to put it in."
        say "I'll try to create it, but if it fails, please provide a Page ID."
        
        # Placeholder ID - tool should handle this error gracefully
        call integrations.createNotionDatabase with title: "Study Plan: " + topic, parent_page_id: "SEARCH_OR_ASK" as db
        
        if not db or db.error
            say "⚠️ Could not create database. " + (db.error or "Unknown error")
            say "Tip: Create a page in Notion called 'Study Home', copy its ID, and tell me: 'Use Notion Page ID: XXXXX'"
            return null
        end

        say "✅ Created study database: " + db.url
        
        # Add a sample entry
        call integrations.addNotionDatabaseEntry with database_id: db.id, properties: {"Name": {"title": [{"text": {"content": "Week 1: Foundations"}}]}} as entry
        
        return db
      end
    end
    
    on input
       if input contains "Notion API Key"
          # Store key in memory (pseudo-code, this would need a 'set_credential' tool effectively)
          say "🔒 Key received (mock). Please use the Integrations dashboard for real connection."
       end
    end
  end
    end
  end

  # ═══════════════════════════════════════════════════════════════
  # SCHEDULER AGENT - Manages study reminders & Pomodoro
  # ═══════════════════════════════════════════════════════════════
  agent SchedulerAgent
    on input
      if task == "set_reminder"
        call calendar.create_reminder with text: f"📚 Study: {topic}", time: time as reminder
        
        say "⏰ Reminder set for " + reminder.time
        
        # Notify
        delegate to CommunicationAgent with task: "notify", whatsapp: "true", phone: phone, slack: "true", slack_channel: "#study-alerts", message: f"⏰ Reminder set: Study {topic} at {time}"
        
        return reminder
      end
    end
    
    on input
      if task == "pomodoro"
        say "🍅 Starting 25-minute Pomodoro session for: " + topic
        
        # Start music
        call spotify.search with query: "focus flow", type: "playlist" as playlists
        say f"🎵 Playing some focus music: {playlists[0].name}"
        
        wait 25m
        
        delegate to CommunicationAgent with task: "notify", whatsapp: "true", phone: phone, discord: "true", discord_channel_id: "123456789", message: "🎉 Pomodoro complete! Take a 5-minute break."
        
        say "🎉 Time's up! Take a break."
      end
    end
  end

  # ═══════════════════════════════════════════════════════════════
  # TUTOR AGENT - Explains concepts and creates quizzes
  # ═══════════════════════════════════════════════════════════════
  agent TutorAgent
    on input
      if task == "explain"
        call ai.generate with prompt: f"Explain {topic} in simple terms for a student. Use analogies and examples.", format: "markdown" as explanation
        say "📖 Here's your explanation:\\n" + explanation
        return explanation
      end
    end
    
    on input
      if task == "quiz"
        call ai.generate with prompt: f"Create a {count or 5} question quiz about {topic}. Include answers at the end.", format: "json" as quiz
        return quiz
      end
    end
  end

  # ═══════════════════════════════════════════════════════════════
  # MAIN ORCHESTRATOR
  # ═══════════════════════════════════════════════════════════════
  on input
    set $handled to false
    
    if input contains "study plan" or input contains "create"
      set $handled to true
      say "📅 Let's organize your study plan!"
      delegate to ProjectManagerAgent with task: "create_study_plan", subject: "Math", topics: [{"name": "Calculus", "deadline": "tomorrow"}]
    end
  end

  on input
    if input contains "schedule" or input contains "notion"
      set $handled to true
      say "📝 Creating Notion schedule..."
      delegate to KnowledgeAgent with task: "create_schedule", topic: input
    end
  end

  on input
    if input contains "find" or input contains "search" or input contains "youtube" or input contains "video" or input contains "scan" or input contains "look"
      set $handled to true
      say "🔍 Searching for materials..."
      delegate to ResearchAgent with task: "find_resources", topic: input
    end
  end

  on input
    if input contains "pomodoro" or input contains "start"
      set $handled to true
      delegate to SchedulerAgent with task: "pomodoro", topic: "General Study"
    end
  end

  on input
    if input contains "quiz" or input contains "test"
      set $handled to true
      delegate to TutorAgent with task: "quiz", topic: input
    end
  end

  on input
    if input contains "explain"
      set $handled to true
      delegate to TutorAgent with task: "explain", topic: input
    end
  end

  on input
    if $handled == false
      call general.respond with { prompt: input } as response
      say response.output
    end
  end
end
`;

// ============================================
// SLACK INTEGRATION
// ============================================
export const SLACK_INTEGRATION = `
@integration slack
@auth oauth2
@category communication
@description "Send messages and manage channels in Slack"

@capability send_message(channel, text)
    response = http.post("https://slack.com/api/chat.postMessage", headers: {"Authorization": f"Bearer {user.access_token}", "Content-Type": "application/json"}, body: {"channel": channel, "text": text})
    
    if not response.ok {
        error(f"Slack post failed: {response.error}")
    }
    
    return response.data.ok
`;

// ============================================
// DISCORD INTEGRATION
// ============================================
export const DISCORD_INTEGRATION = `
@integration discord
@auth bot_token
@category communication
@description "Post to Discord channels and manage server"

@capability send_message(channel_id, content)
    response = http.post(f"https://discord.com/api/v10/channels/{channel_id}/messages", headers: {"Authorization": f"Bot {user.bot_token}", "Content-Type": "application/json"}, body: {"content": content})
    
    if not response.ok {
        error(f"Discord send failed: {response.error}")
    }
    
    return response.data
`;

// ============================================
// SPOTIFY INTEGRATION
// ============================================
export const SPOTIFY_INTEGRATION = `
@integration spotify
@auth oauth2
@category media
@description "Search tracks and manage playback"

@capability search(query, type)
    response = http.get("https://api.spotify.com/v1/search", params: {"q": query, "type": type or "track", "limit": "5"}, headers: {"Authorization": f"Bearer {user.access_token}"})
    
    if not response.ok {
        error("Spotify search failed")
    }
    
    return response.data.tracks.items
`;

export const INTEGRATION_EXAMPLES = {
  vercel: VERCEL_INTEGRATION,
  stripe: STRIPE_INTEGRATION,
  sendgrid: SENDGRID_INTEGRATION,
  github: GITHUB_INTEGRATION,
  weather: WEATHER_INTEGRATION,
  notion: NOTION_INTEGRATION,
  // Study Buddy integrations
  youtube: YOUTUBE_INTEGRATION,
  gmail: GMAIL_INTEGRATION,
  google: GOOGLE_SEARCH_INTEGRATION,
  calendar: CALENDAR_INTEGRATION,
  whatsapp: WHATSAPP_INTEGRATION,
  trello: TRELLO_INTEGRATION,
  slack: SLACK_INTEGRATION,
  discord: DISCORD_INTEGRATION,
  spotify: SPOTIFY_INTEGRATION,
};

// Bot/Swarm Templates
export const BOT_TEMPLATES = {
  study_buddy_swarm: STUDY_BUDDY_SWARM,
};
