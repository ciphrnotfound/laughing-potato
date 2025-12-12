# 💳 Paystack Setup Guide

Follow these steps to connect BotHive to Paystack.

## 1. Get API Keys
1. Log in to your [Paystack Dashboard](https://dashboard.paystack.com/).
2. Go to **Settings** > **API Keys & Webhooks**.
3. You will see **Test Secret Key** and **Test Public Key** (use these for development).
4. Copy them and add to your `.env` file:
   PAYSTACK_SECRET_KEY=sk_test_placeholder_key_replace_me
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_placeholder_key_replace_me
   ```

## 2. Set Up Webhook
This allows BotHive to know when a payment is successful.

1. On the same **API Keys & Webhooks** page in Paystack.
2. Scroll down to **Webhooks**.
3. **Webhook URL**:
   - **Local Development**: You need a tunnel (like ngrok).
     - Run: `npx ngrok http 3000`
     - URL: `https://your-ngrok-url.ngrok-free.app/api/webhooks/paystack`
   - **Production**: `https://your-domain.com/api/webhooks/paystack`
4. Click **Save Changes**.

## 3. Run Database Migration
If you haven't already, update your database to use Paystack columns:
1. Copy the content of `supabase/migrations/20241129_switch_to_paystack.sql`.
2. Run it in your Supabase SQL Editor.

## 4. Verify Setup
1. Restart your dev server: `npm run dev`.
2. The application will now use Paystack for payments!

## 5. Going Live (Later)
When you are ready to accept real money:
1. Complete your business compliance on Paystack (submit NIN/BVN).
2. Switch Paystack dashboard to **Live Mode**.
3. Update your `.env` with the **Live** keys (`sk_live_...`, `pk_live_...`).
