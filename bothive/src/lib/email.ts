import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_123456789';
const resend = new Resend(RESEND_API_KEY);

export const EmailService = {
  /**
   * Send a Welcome Email on Signup
   */
  async sendWelcomeEmail(email: string, name: string) {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 [MOCK EMAIL] Welcome sent to:', email);
      return;
    }

    try {
      await resend.emails.send({
        from: 'Bothive <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to the Hive 🐝',
        html: `
          <div style="font-family: -apple-system, sans-serif; background: #000; color: #fff; padding: 40px; border-radius: 16px;">
            <h1 style="color: #fff;">Welcome, ${name}! 🐝</h1>
            <p style="color: #a1a1aa;">You've officially joined the swarm. Your digital workforce is ready.</p>
            <a href="https://bothive.app/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Enter Dashboard →</a>
          </div>
        `
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  },

  /**
   * Send Payment Receipt - Premium Dark Theme
   */
  async sendPaymentSuccessEmail(email: string, amount: number, plan: string, reference?: string) {
    const hasApiKey = !!process.env.RESEND_API_KEY;
    console.log('[EMAIL] Attempting to send payment email. Has API Key:', hasApiKey, 'To:', email);

    if (!hasApiKey) {
      console.log('📧 [MOCK EMAIL] Payment receipt sent to:', email);
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const amountStr = amount === 0 ? 'FREE' : `₦${(amount / 100).toLocaleString()}`;

    try {
      console.log('[EMAIL] Sending real email via Resend...');
      const result = await resend.emails.send({
        from: 'Bothive <onboarding@resend.dev>',
        to: email,
        subject: `🐝 Welcome to ${plan} — You're In!`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%); border: 1px solid #222; border-radius: 24px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; background: radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15) 0%, transparent 60%);">
              
              <!-- Animated Checkmark GIF -->
              <img src="https://cdn.dribbble.com/users/129972/screenshots/3964116/75_smile.gif" alt="Success" style="width: 80px; height: 80px; margin-bottom: 20px;" />
              
              <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Welcome to ${plan}
              </h1>
              <p style="margin: 0; font-size: 16px; color: #71717a;">
                Your upgrade is complete
              </p>
            </td>
          </tr>
          
          <!-- Success Badge -->
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 16px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #22C55E 0%, #10B981 100%); border-radius: 50%; text-align: center; line-height: 40px;">
                            <span style="color: white; font-size: 18px; font-weight: bold;">✓</span>
                          </div>
                        </td>
                        <td style="vertical-align: middle; text-align: left;">
                          <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #22C55E;">Payment Confirmed</p>
                          <p style="margin: 0; font-size: 13px; color: #6B7280;">${dateStr}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Receipt -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #18181b; border: 1px solid #27272a; border-radius: 16px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #52525b;">Receipt Details</p>
                    
                    <table width="100%" style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #27272a;">
                      <tr>
                        <td style="font-size: 14px; color: #a1a1aa;">Amount</td>
                        <td align="right" style="font-size: 14px; font-weight: 600; color: #ffffff;">${amountStr}</td>
                      </tr>
                    </table>
                    
                    <table width="100%" style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #27272a;">
                      <tr>
                        <td style="font-size: 14px; color: #a1a1aa;">Plan</td>
                        <td align="right">
                          <span style="display: inline-block; padding: 4px 10px; background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); border-radius: 6px; font-size: 12px; font-weight: 600; color: white;">${plan}</span>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%">
                      <tr>
                        <td style="font-size: 14px; color: #a1a1aa;">Reference</td>
                        <td align="right" style="font-size: 12px; font-family: monospace; color: #71717a;">${reference || 'N/A'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- What's Unlocked -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="margin: 0 0 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #52525b;">What you've unlocked</p>
              <table width="100%">
                <tr><td style="padding: 8px 0; color: #d4d4d8; font-size: 14px;"><span style="color: #8B5CF6; margin-right: 8px;">◆</span> Unlimited AI Bots & Workflows</td></tr>
                <tr><td style="padding: 8px 0; color: #d4d4d8; font-size: 14px;"><span style="color: #8B5CF6; margin-right: 8px;">◆</span> Full HiveMind Intelligence</td></tr>
                <tr><td style="padding: 8px 0; color: #d4d4d8; font-size: 14px;"><span style="color: #8B5CF6; margin-right: 8px;">◆</span> Priority Support & Early Features</td></tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <a href="https://bothive.app/dashboard" style="display: block; padding: 16px 32px; background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); color: white; text-decoration: none; text-align: center; border-radius: 12px; font-size: 15px; font-weight: 600; box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);">
                Open Your Dashboard →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #52525b;">Questions? Just reply to this email.</p>
              <p style="margin: 0; font-size: 12px; color: #3f3f46;">Bothive • Build your digital workforce</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
  
</body>
</html>
        `
      });
      console.log('[EMAIL] ✅ Email sent successfully! ID:', result?.data?.id);
    } catch (error: any) {
      console.error('[EMAIL] ❌ Failed to send payment email:', error?.message || error);
    }
  },

  /**
   * Send Deployment Notification
   */
  async sendDeployNotification(email: string, botName: string) {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 [MOCK EMAIL] Deploy notification sent to:', email);
      return;
    }

    try {
      await resend.emails.send({
        from: 'Bothive <onboarding@resend.dev>',
        to: email,
        subject: `🚀 ${botName} is now live`,
        html: `
          <div style="font-family: -apple-system, sans-serif; background: #000; color: #fff; padding: 40px; border-radius: 16px;">
            <h1 style="color: #fff;">🚀 Deployment Successful</h1>
            <p style="color: #a1a1aa;"><strong style="color: #fff;">${botName}</strong> is now active and running.</p>
            <a href="https://bothive.app/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View Dashboard →</a>
          </div>
        `
      });
    } catch (error) {
      console.error('Failed to send deploy email:', error);
    }
  }
};
