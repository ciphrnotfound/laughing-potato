import { NextRequest, NextResponse } from "next/server";

// Serverless WhatsApp Reminder Cron Job
export async function GET(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString();
    const hour = new Date().getHours();
    
    console.log(`⏰ [${timestamp}] Running WhatsApp reminder check (Hour: ${hour})...`);
    
    // Check if within active hours (9 AM - 9 PM by default)
    if (hour < 9 || hour > 21) {
      console.log('😴 Outside active hours (9 AM - 9 PM), skipping...');
      return NextResponse.json({ 
        status: "skipped", 
        reason: "outside_active_hours",
        time: timestamp 
      });
    }
    
    // Simulate checking for active WhatsApp reminder bots
    const reminderBots = await getActiveReminderBots();
    const results = [];
    
    for (const bot of reminderBots) {
      try {
        const result = await runWhatsAppReminderBot(bot);
        results.push({
          botId: bot.id,
          status: "success",
          messageSent: result.messageSent,
          timestamp: result.timestamp
        });
        
        console.log(`✅ Sent reminder for bot ${bot.id}`);
      } catch (error) {
        console.error(`❌ Failed to send reminder for bot ${bot.id}:`, error);
        results.push({
          botId: bot.id,
          status: "error",
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return NextResponse.json({
      status: "completed",
      time: timestamp,
      hour: hour,
      botsProcessed: reminderBots.length,
      results: results
    });
    
  } catch (error) {
    console.error("WhatsApp reminder cron error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        error: error.message,
        time: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Verify cron request (optional security)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  // Simple auth check - in production use proper secrets
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Run the same logic as GET
  return GET(request);
}

async function getActiveReminderBots() {
  // In a real app, this would query your database
  // For now, return mock reminder bots
  return [
    {
      id: "whatsapp-task-reminder",
      phoneNumber: "+1234567890",
      tasks: ["Complete project proposal", "Review code changes"],
      reminderStyle: "motivational",
      activeHours: { start: 9, end: 21 }
    },
    {
      id: "team-standup-reminder",
      phoneNumber: "+0987654321", 
      tasks: ["Daily standup at 10 AM"],
      reminderStyle: "professional",
      activeHours: { start: 8, end: 18 }
    }
  ];
}

async function runWhatsAppReminderBot(bot) {
  // Generate reminder message
  const taskList = bot.tasks.join(", ");
  const hour = new Date().getHours();
  
  let message = "";
  
  if (bot.reminderStyle === "motivational") {
    message = `⚡ Hourly check-in! You've got this! 🎯\n\nTasks to focus on:\n${taskList}\n\nKeep pushing forward! 💪`;
  } else if (bot.reminderStyle === "professional") {
    message = `📋 Task Reminder - ${new Date().toLocaleTimeString()}\n\nPending items:\n${taskList}\n\nStatus update needed.`;
  } else {
    message = `⏰ Reminder: ${taskList}`;
  }
  
  // In production, this would call the WhatsApp API
  console.log(`📱 Would send to ${bot.phoneNumber}: ${message}`);
  
  return {
    messageSent: message,
    phoneNumber: bot.phoneNumber,
    timestamp: new Date().toISOString()
  };
}
