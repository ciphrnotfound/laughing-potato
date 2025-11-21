import { NextRequest, NextResponse } from "next/server";

// WhatsApp Business API webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (in production)
    const signature = request.headers.get("x-hub-signature-256");
    
    // Handle different WhatsApp webhook events
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "messages") {
            const messages = change.value.messages;
            
            for (const message of messages) {
              if (message.type === "text") {
                // Process incoming message
                await processWhatsAppMessage(message);
              }
            }
          }
        }
      }
    }
    
    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// Handle webhook verification (GET request)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }
  
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

async function processWhatsAppMessage(message: any) {
  const from = message.from;
  const text = message.text.body;
  const messageId = message.id;
  const timestamp = message.timestamp;
  
  console.log(`📱 WhatsApp message from ${from}: ${text}`);
  
  // Call your Bothive bot
  try {
    const botResponse = await callBothiveBot({
      message: {
        from: from,
        text: text,
        time: new Date(timestamp * 1000).toISOString()
      }
    });
    
    // Send response back to WhatsApp
    await sendWhatsAppResponse(from, botResponse);
    
  } catch (error) {
    console.error("Bot processing error:", error);
    
    // Send error response
    await sendWhatsAppResponse(from, "Sorry, I'm having trouble processing your message right now.");
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

async function sendWhatsAppResponse(to: string, message: string) {
  // Send message via WhatsApp Business API
  const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      text: {
        body: message
      }
    })
  });
  
  if (!response.ok) {
    throw new Error("Failed to send WhatsApp message");
  }
  
  console.log(`📤 Sent WhatsApp response to ${to}: ${message}`);
}
