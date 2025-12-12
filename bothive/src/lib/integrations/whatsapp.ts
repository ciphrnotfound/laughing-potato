import type { ConnectedAccount } from "@/lib/connected-accounts";

export interface SendWhatsAppMessageArgs {
    account: ConnectedAccount;
    phoneNumber: string;
    message: string;
}

export interface SendWhatsAppMessageResult {
    messageId: string;
    status: string;
}

function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    try {
        return JSON.stringify(error);
    } catch {
        return "Unknown error";
    }
}

export async function sendWhatsAppMessage({ account, phoneNumber, message }: SendWhatsAppMessageArgs): Promise<SendWhatsAppMessageResult> {
    if (!account.accessToken) {
        throw new Error("WhatsApp account is missing an access token");
    }

    // For demo purposes, we'll simulate sending a WhatsApp message
    // In production, you'd integrate with WhatsApp Business API or Twilio WhatsApp

    console.log(`📱 Sending WhatsApp message to ${phoneNumber}:`);
    console.log(`Message: ${message}`);

    // Simulate API call
    const response = await fetch("https://graph.facebook.com/v18.0/your-phone-number-id/messages", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${account.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phoneNumber.replace(/[^\d]/g, ''), // Remove non-digits
            type: "text",
            text: {
                body: message
            }
        }),
    });

    if (!response.ok) {
        let detail = `${response.status} ${response.statusText}`;
        try {
            const data = (await response.json()) as { error?: { message?: string } };
            if (data.error?.message) {
                detail = data.error.message;
            }
        } catch (error) {
            detail = extractErrorMessage(error);
        }
        throw new Error(`WhatsApp API error: ${detail}`);
    }

    const data = await response.json();

    return {
        messageId: data.messages?.[0]?.id || 'demo-' + Date.now(),
        status: 'sent'
    };
}

// Alternative implementation using Twilio
export async function sendWhatsAppMessageTwilio({ account, phoneNumber, message }: SendWhatsAppMessageArgs): Promise<SendWhatsAppMessageResult> {
    if (!account.accessToken) {
        throw new Error("Twilio account is missing credentials");
    }

    // Parse Twilio credentials from account metadata
    const accountSid = account.metadata?.twilioAccountSid as string;
    const authToken = account.metadata?.twilioAuthToken as string;
    const fromNumber = account.metadata?.twilioPhoneNumber as string;

    if (!accountSid || !authToken || !fromNumber) {
        throw new Error("Twilio credentials not properly configured");
    }

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            From: `whatsapp:${fromNumber}`,
            To: `whatsapp:${phoneNumber}`,
            Body: message,
        }),
    });

    if (!response.ok) {
        let detail = `${response.status} ${response.statusText}`;
        try {
            const data = await response.json();
            if (data.message) {
                detail = data.message;
            }
        } catch (error) {
            detail = extractErrorMessage(error);
        }
        throw new Error(`Twilio WhatsApp error: ${detail}`);
    }

    const data = await response.json();

    return {
        messageId: data.sid,
        status: data.status
    };
}
