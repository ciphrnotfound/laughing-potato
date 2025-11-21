import { NextRequest, NextResponse } from "next/server";
import { runGrokCommand } from "@/lib/grok";

// Bot runner API - connects external platforms to Bothive bots
export async function POST(request: NextRequest) {
  try {
    const { botId, input } = await request.json();
    
    if (!botId || !input) {
      return NextResponse.json(
        { error: "Missing botId or input" },
        { status: 400 }
      );
    }
    
    // Get bot configuration (you'd store this in a database)
    const botConfig = await getBotConfig(botId);
    
    if (!botConfig) {
      return NextResponse.json(
        { error: "Bot not found" },
        { status: 404 }
      );
    }
    
    // Execute the bot's Hivelang code
    const result = await executeHivelangBot(botConfig.hivelangCode, input);
    
    return NextResponse.json({
      success: true,
      output: result.output,
      data: result.data
    });
    
  } catch (error) {
    console.error("Bot runner error:", error);
    return NextResponse.json(
      { error: "Bot execution failed" },
      { status: 500 }
    );
  }
}

async function getBotConfig(botId: string) {
  // In a real app, this would fetch from your database
  // For now, return the WhatsApp bot config
  if (botId === "whatsapp-manager") {
    return {
      id: "whatsapp-manager",
      hivelangCode: `
bot WhatsAppManager
  description "Manages WhatsApp messages, auto-replies, and customer support"

  memory shared
    messages store key "chat_history"
    responses store key "auto_responses"
    customers store key "customer_data"
  end

  on input when input.message?
    # Parse incoming WhatsApp message
    set sender to input.message.from
    set content to input.message.text
    set timestamp to input.message.time
    
    # Store the message
    messages.append key "chat_history" value {
      from: sender,
      message: content,
      time: timestamp,
      direction: "incoming"
    }
    
    # Categorize message intent
    set intent to categorize_intent(content)
    
    # Handle different message types
    if intent is "greeting"
      set response to "Hello! 👋 Welcome to our WhatsApp support. How can I help you today?"
    elsif intent is "question"
      if content contains "price" or content contains "cost"
        set response to "Our pricing starts at $29/month for basic plans. Would you like detailed pricing information?"
      elsif content contains "hours" or content contains "time"
        set response to "We're open Monday-Friday 9AM-6PM, Saturday 10AM-2PM. Closed on Sundays."
      else
        set response to "That's a great question! Let me connect you with the right person who can help you with that."
      end
    elsif intent is "complaint"
      set response to "We're sorry to hear you're experiencing issues. Our support team will look into this immediately. Ticket ID: TKT-" + string(now())[-6:]
    elsif intent is "appointment"
      set response to "I'd be happy to help you schedule an appointment! 📅\\n\\nAvailable times:\\n• Monday-Friday: 9AM-6PM\\n• Saturday: 10AM-2PM\\n\\nWhat works best for you?"
    elsif intent is "urgent"
      set response to "🚨 This is marked as urgent. Our team is prioritizing your request and will respond within 30 minutes."
    else
      set response to "Thank you for your message! I'll help you with that. Could you provide a bit more detail so I can assist you better?"
    end
    
    # Store outgoing message
    messages.append key "chat_history" value {
      to: sender,
      message: response,
      time: now(),
      direction: "outgoing"
    }
    
    say response
  end

  function categorize_intent(text)
    set lower_text to lower(text)
    
    if lower_text contains "hello" or lower_text contains "hi" or lower_text contains "hey"
      return "greeting"
    elsif lower_text contains "?" or lower_text contains "how" or lower_text contains "what"
      return "question"
    elsif lower_text contains "problem" or lower_text contains "issue" or lower_text contains "wrong"
      return "complaint"
    elsif lower_text contains "appointment" or lower_text contains "schedule" or lower_text contains "meeting"
      return "appointment"
    elsif lower_text contains "urgent" or lower_text contains "asap" or lower_text contains "emergency"
      return "urgent"
    else
      return "general"
    end
  end
end`
    };
  }
  
  return null;
}

async function executeHivelangBot(hivelangCode: string, input: any) {
  // This is a simplified Hivelang interpreter
  // In a real implementation, you'd parse and execute the Hivelang properly
  
  try {
    // For now, we'll use Grok to interpret the Hivelang
    const prompt = `
Execute this Hivelang code with the given input:

Hivelang Code:
${hivelangCode}

Input:
${JSON.stringify(input, null, 2)}

Please execute the bot logic and return only the bot's response/output. Focus on the "say" statements and any return values.
`;
    
    const output = await runGrokCommand(prompt, ["llama-3.1-70b-versatile"]);
    
    return {
      output: output.trim(),
      data: {
        executed: true,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error("Hivelang execution error:", error);
    return {
      output: "Error executing bot logic",
      data: { error: error.message }
    };
  }
}
