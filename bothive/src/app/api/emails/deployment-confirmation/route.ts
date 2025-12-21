import { NextRequest, NextResponse } from "next/server";

interface EmailRequest {
    userId: string;
    userEmail: string;
    userName: string;
    botId: string;
    botName: string;
    botType: "agent" | "bot";
    category: string;
    deployedAt: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: EmailRequest = await req.json();

        const { userId, userEmail, userName, botId, botName, botType, category, deployedAt } = body;

        // Validate required fields
        if (!userId || !userEmail || !botId || !botName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // TODO: Replace with actual Resend API key from environment variables
        const RESEND_API_KEY = process.env.RESEND_API_KEY;

        if (!RESEND_API_KEY) {
            console.warn("RESEND_API_KEY not configured. Email notification skipped.");
            return NextResponse.json({
                success: false,
                message: "Email service not configured",
            });
        }

        // Email HTML template
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bot Deployed Successfully</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f5f5f5;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background: white;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #6C43FF 0%, #8A63FF 100%);
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .header h1 {
                        color: white;
                        margin: 0;
                        font-size: 28px;
                    }
                    .header p {
                        color: rgba(255,255,255,0.9);
                        margin: 10px 0 0 0;
                        font-size: 16px;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .bot-card {
                        background: #f8f9fa;
                        border-radius: 12px;
                        padding: 24px;
                        margin: 24px 0;
                    }
                    .bot-name {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1a1a1a;
                        margin: 0 0 16px 0;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .detail-label {
                        color: #666;
                        font-size: 14px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .detail-value {
                        color: #1a1a1a;
                        font-weight: 600;
                        font-size: 14px;
                    }
                    .next-steps {
                        background: #f0f4ff;
                        border-left: 4px solid #6C43FF;
                        padding: 20px;
                        margin: 24px 0;
                        border-radius: 8px;
                    }
                    .next-steps h3 {
                        margin: 0 0 12px 0;
                        color: #1a1a1a;
                        font-size: 16px;
                    }
                    .next-steps ul {
                        margin: 0;
                        padding-left: 20px;
                    }
                    .next-steps li {
                        margin: 8px 0;
                        color: #333;
                    }
                    .cta-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #6C43FF 0%, #8A63FF 100%);
                        color: white;
                        text-decoration: none;
                        padding: 14px 32px;
                        border-radius: 8px;
                        font-weight: 600;
                        margin: 24px 0;
                    }
                    .footer {
                        text-align: center;
                        padding: 30px;
                        color: #666;
                        font-size: 14px;
                        border-top: 1px solid #e0e0e0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Deployment Successful!</h1>
                        <p>Your ${botType} is now live on BotHive</p>
                    </div>
                    
                    <div class="content">
                        <p>Hi ${userName || "there"},</p>
                        <p>Great news! Your ${botType} <strong>"${botName}"</strong> has been successfully deployed to the BotHive platform.</p>
                        
                        <div class="bot-card">
                            <div class="bot-name">
                                <span>${botType === "agent" ? "🤖" : "⚡"}</span>
                                ${botName}
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Type</span>
                                <span class="detail-value" style="text-transform: capitalize;">${botType}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Category</span>
                                <span class="detail-value" style="text-transform: capitalize;">${category}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Deployed At</span>
                                <span class="detail-value">${new Date(deployedAt).toLocaleString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Bot ID</span>
                                <span class="detail-value" style="font-family: monospace; font-size: 12px;">${botId}</span>
                            </div>
                        </div>
                        
                        <div class="next-steps">
                            <h3>🚀 What's Next?</h3>
                            <ul>
                                <li>Test your ${botType} in the <strong>Playground</strong></li>
                                <li>Monitor performance in your <strong>Dashboard Analytics</strong></li>
                                <li>Configure integrations and workflows</li>
                                <li>Optionally publish to <strong>HiveStore</strong> for others to discover</li>
                            </ul>
                        </div>
                        
                        <center>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://bothive.app"}/dashboard/bots/${botId}" class="cta-button">
                                View Dashboard →
                            </a>
                        </center>
                        
                        <p style="margin-top: 32px; color: #666; font-size: 14px;">
                            Need help? Visit our <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://bothive.app"}/docs" style="color: #6C43FF;">documentation</a> or reach out to support.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>Happy automating! 🐝</p>
                        <p style="margin: 8px 0 0 0;">The BotHive Team</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email using Resend API
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "Bothive <notifications@bothive.support.cloud>", // Update with your verified domain
                to: [userEmail],
                subject: `🎉 Your ${botType} "${botName}" is Live on BotHive!`,
                html: emailHtml,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Resend API error:", errorData);
            return NextResponse.json(
                { success: false, error: "Failed to send email", details: errorData },
                { status: 500 }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            emailId: data.id,
            message: "Deployment confirmation email sent successfully",
        });

    } catch (error) {
        console.error("Error sending deployment confirmation email:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
