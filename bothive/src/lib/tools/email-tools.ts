import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";
import nodemailer from "nodemailer";

/**
 * Email Tools using SMTP
 * Requires EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD in .env.local
 */

interface SendEmailInput {
    to: string;
    subject: string;
    body: string;
    from?: string;
}

interface SendBulkEmailInput {
    recipients: string[];
    subject: string;
    body: string;
    from?: string;
}

/**
 * Create SMTP transporter from environment variables
 */
function createTransporter() {
    const config = {
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    };

    if (!config.auth.user || !config.auth.pass) {
        throw new Error(
            "Email not configured. Add EMAIL_USER and EMAIL_PASSWORD to .env.local"
        );
    }

    return nodemailer.createTransporter(config);
}

/**
 * Send a single email
 */
export const sendEmail: ToolDescriptor = {
    name: "email.send",
    capability: "integrations.email",
    description: "Send an email to a recipient",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const to = typeof input.to === "string" ? input.to : "";
        const subject = typeof input.subject === "string" ? input.subject : "No Subject";
        const body = typeof input.body === "string" ? input.body : "";
        const from =
            typeof input.from === "string"
                ? input.from
                : process.env.EMAIL_FROM || process.env.EMAIL_USER;

        if (!to || !body) {
            return {
                success: false,
                output: "Missing required fields: to, body",
            };
        }

        try {
            const transporter = createTransporter();
            const info = await transporter.sendMail({
                from,
                to,
                subject,
                text: body,
                html: body.replace(/\n/g, "<br>"),
            });

            return {
                success: true,
                output: JSON.stringify({
                    message_id: info.messageId,
                    to,
                    subject,
                    sent: true,
                }),
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Email send failed";
            return {
                success: false,
                output: `Failed to send email: ${message}`,
            };
        }
    },
};

/**
 * Send emails to multiple recipients
 */
export const sendBulkEmail: ToolDescriptor = {
    name: "email.sendBulk",
    capability: "integrations.email",
    description: "Send the same email to multiple recipients",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const recipients = Array.isArray(input.recipients)
            ? input.recipients.map(String)
            : [];
        const subject = typeof input.subject === "string" ? input.subject : "No Subject";
        const body = typeof input.body === "string" ? input.body : "";
        const from =
            typeof input.from === "string"
                ? input.from
                : process.env.EMAIL_FROM || process.env.EMAIL_USER;

        if (recipients.length === 0 || !body) {
            return {
                success: false,
                output: "Missing required fields: recipients, body",
            };
        }

        try {
            const transporter = createTransporter();
            const results = [];

            for (const recipient of recipients) {
                try {
                    const info = await transporter.sendMail({
                        from,
                        to: recipient,
                        subject,
                        text: body,
                        html: body.replace(/\n/g, "<br>"),
                    });

                    results.push({
                        to: recipient,
                        sent: true,
                        message_id: info.messageId,
                    });
                } catch (error) {
                    results.push({
                        to: recipient,
                        sent: false,
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                }
            }

            const sentCount = results.filter((r) => r.sent).length;

            return {
                success: true,
                output: JSON.stringify({
                    sent_count: sentCount,
                    failed_count: recipients.length - sentCount,
                    total: recipients.length,
                    results,
                }),
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Bulk email failed";
            return {
                success: false,
                output: `Failed to send bulk emails: ${message}`,
            };
        }
    },
};

/**
 * Send email with calendar attachment
 */
export const sendEmailWithCalendar: ToolDescriptor = {
    name: "email.sendWithCalendar",
    capability: "integrations.email",
    description: "Send an email with a calendar invite (.ics file)",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const to = typeof input.to === "string" ? input.to : "";
        const subject = typeof input.subject === "string" ? input.subject : "Calendar Invite";
        const body = typeof input.body === "string" ? input.body : "";
        const event = input.event as
            | { title: string; start: string; end: string; location?: string }
            | undefined;
        const from =
            typeof input.from === "string"
                ? input.from
                : process.env.EMAIL_FROM || process.env.EMAIL_USER;

        if (!to || !event || !event.title || !event.start || !event.end) {
            return {
                success: false,
                output: "Missing required fields: to, event (title, start, end)",
            };
        }

        try {
            const transporter = createTransporter();

            // Create simple ICS file content
            const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BotHive//EN
BEGIN:VEVENT
UID:${Date.now()}@bothive.app
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${event.start.replace(/[-:]/g, "").split(".")[0]}Z
DTEND:${event.end.replace(/[-:]/g, "").split(".")[0]}Z
SUMMARY:${event.title}
LOCATION:${event.location || ""}
DESCRIPTION:${body}
END:VEVENT
END:VCALENDAR`;

            const info = await transporter.sendMail({
                from,
                to,
                subject,
                text: body,
                html: body.replace(/\n/g, "<br>"),
                attachments: [
                    {
                        filename: "invite.ics",
                        content: icsContent,
                        contentType: "text/calendar",
                    },
                ],
            });

            return {
                success: true,
                output: JSON.stringify({
                    message_id: info.messageId,
                    to,
                    subject,
                    calendar_attached: true,
                }),
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Email send failed";
            return {
                success: false,
                output: `Failed to send email with calendar: ${message}`,
            };
        }
    },
};

export const emailTools: ToolDescriptor[] = [
    sendEmail,
    sendBulkEmail,
    sendEmailWithCalendar,
];
