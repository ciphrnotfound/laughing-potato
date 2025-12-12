-- Seed Ivy League Essay Swarm Bots
-- Updated with Full HiveLang Integration

-- 1. Ensure the user exists (to satisfy FK constraints in triggers)
-- The error mentioned user_id f79aaaa9-abfb-42a4-bf7b-f857a0ea39e4
INSERT INTO auth.users (id, email)
VALUES ('f79aaaa9-abfb-42a4-bf7b-f857a0ea39e4', 'ivy_admin@bothive.ai')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, full_name, email, status)
VALUES ('f79aaaa9-abfb-42a4-bf7b-f857a0ea39e4', 'Ivy System Admin', 'ivy_admin@bothive.ai', 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. Ivy League Essay Swarm (The Orchestrator & All-in-One Swarm)
-- Note: In the HiveLang architecture, the single "Bot" contains the nested "Agents".
-- So we only need ONE record for the Swarm, containing the full HiveLang source.

insert into public.bots (id, name, description, model, system_prompt, status, user_id)
values (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    'Ivy League Essay Swarm',
    'Elite multi-agent system (Ivy, Strategist, Critic) powered by HiveLang.',
    'gpt-4o',
    'bot IvySwarm
  description "Elite Ivy League Essay Coaching System (Multi-Agent Swarm)"

  agent Interviewer
    on input
      if input contains "docs.google.com"
         say "Reading your draft..."
         call integration.gdocs.read with { docId: input } as docContent
         say "Draft read. Switching to The Critic."
         call agent.delegate with { agent: "Critic", task: docContent }
      else
         call ai.respond with {
           systemPrompt: "You are Ivy, an elite college admissions interviewer. Goal: extract deep, vulnerable stories. Ask ONE probing question at a time. Dig for intellectual vitality.",
           userMessage: input
         } as response
         say "{response}"
      end
    end
  end

  agent Strategist
    on input
      call analysis.structure with { text: input } as structureAnalysis
      call ai.respond with {
        systemPrompt: "You are The Strategist. Analyze notes. Propose 2-3 angles. Create bulleted OUTLINE (Hook -> Inciting Incident -> Growth).",
        userMessage: "User Notes: " + input + "\n\nStructure Analysis: " + structureAnalysis
      } as response
      say "{response}"
    end
  end

  agent Critic
    on input
      call analysis.style with { text: input } as styleReport
      call ai.respond with {
        systemPrompt: "You are The Critic (ex-Yale). Hate clichés. Use Style Report. Highlight Show Dont Tell violations. Rate Vulnerability/Vitality. Be harsh.",
        userMessage: "Draft: " + input + "\n\nStyle Report: " + styleReport
      } as response
      say "{response}"
    end
  end

  on input
    call ai.respond with {
      systemPrompt: "Orchestrator. Reply INTERVIEWER, STRATEGIST, CRITIC, or CHAT based on user intent.",
      userMessage: input,
      temperature: 0.1
    } as decision

    if decision == "INTERVIEWER"
      say "Connecting to Interviewer..."
      call agent.delegate with { agent: "Interviewer", task: input }
    end
    if decision == "STRATEGIST"
      say "Connecting to Strategist..."
      call agent.delegate with { agent: "Strategist", task: input }
    end
    if decision == "CRITIC"
      say "Connecting to Critic..."
      call agent.delegate with { agent: "Critic", task: input }
    end
    if decision == "CHAT"
       say "Hi! I am the Ivy Swarm. My team: Interviewer, Strategist, Critic. How can we help?"
    end
  end
end',
    'active',
    'f79aaaa9-abfb-42a4-bf7b-f857a0ea39e4' -- Associate with the admin user
) on conflict (id) do update set 
    system_prompt = excluded.system_prompt,
    description = excluded.description;
