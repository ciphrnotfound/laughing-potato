# 🍋 Lemon Squeezy Setup Guide

Follow these steps to connect BotHive to Lemon Squeezy.

## 1. Create an Account & Store
1. Go to [lemonsqueezy.com](https://www.lemonsqueezy.com/) and sign up.
2. Create a new **Store** (you can name it "BotHive" or your project name).
3. Complete the store setup (you might need a parent/guardian for the payout/identity verification part since you are 15).

## 2. Get API Keys
1. Go to **Settings** > **API**.
2. Click **Create API Key**.
3. Name it "BotHive App".
4. Copy the key and paste it into your `.env` file as `LEMONSQUEEZY_API_KEY`.

## 3. Get Store ID
1. Go to **Settings** > **Stores**.
2. Copy the **Store ID** (it's a number, e.g., `12345`).
3. Paste it into your `.env` file as `LEMONSQUEEZY_STORE_ID`.

## 4. Set Up Webhook
This allows BotHive to know when a purchase happens.

1. Go to **Settings** > **Webhooks**.
2. Click **Create Webhook**.
3. **URL**: 
   - For local development: You need a tunnel (like ngrok). Run `npx ngrok http 3000` and use that URL + `/api/webhooks/lemonsqueezy`.
   - Example: `https://your-ngrok-url.ngrok-free.app/api/webhooks/lemonsqueezy`
   - For production: `https://your-domain.com/api/webhooks/lemonsqueezy`
4. **Secret**: Create a random string (e.g., "bothive_secret_123") and paste it into `.env` as `LEMONSQUEEZY_WEBHOOK_SECRET`.
5. **Events**: Check these boxes:
   - `order_created`
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
6. Click **Save Webhook**.

## 5. Run Database Migration
Make sure you have run the SQL migration to update your database schema:
1. Copy the content of `supabase/migrations/20241129_switch_to_lemonsqueezy.sql`.
2. Run it in your Supabase SQL Editor.

## 6. Create Products (Later)
When you are ready to sell:
1. Create a Product in Lemon Squeezy.
2. Create Variants (e.g., Monthly, Yearly).
3. Copy the `Variant ID` and use it when creating integrations in BotHive.
