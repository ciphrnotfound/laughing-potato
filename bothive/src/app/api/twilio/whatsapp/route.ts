import { NextRequest, NextResponse } from "next/server";
import { twiml } from "twilio";

// Twilio WhatsApp webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const from = formData.get("From") as string;
    const to = formData.get("To") as string;
    const body = formData.get("Body") as string;
    const messageSid = formData.get("MessageSid") as string;
    
    console.log(`📱 Twilio WhatsApp from ${from}: ${body}`);
    
    // Call your Bothive bot
    let botResponse = "Thanks for your message! I'll get back to you soon.";
    
    try {
      botResponse = await callBothiveBot({
        message: {
          from: from,
          text: body,
          time: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Bot processing error:", error);
    }
    
    // Create TwiML response
    const twimlResponse = new twiml.MessagingResponse();
    const message = twimlResponse.message();
    message.body(botResponse);
    
    return new NextResponse(twimlResponse.toString(), {
      headers: {
        "Content-Type": "text/xml"
      }
    });
    
  } catch (error) {
    console.error("Twilio webhook error:", error);
    
    // Return error response
    const twimlResponse = new twiml.MessagingResponse();
    const message = twimlResponse.message();
    message.body("Sorry, I'm having trouble processing your message right now.");
    
    return new NextResponse(twimlResponse.toString(), {
      headers: {
        "Content-Type": "text/xml"
      }
    });
  }
}

async function callBothiveBot(input: any) {
  // Call your Bothive bot API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bot/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      botId: "your-whatsapp-bot-id",
      input: input
    })
  });
  
  if (!response.ok) {
    throw new Error("Bot call failed");
  }
  
  const result = await response.json();
  return result.output;
}
