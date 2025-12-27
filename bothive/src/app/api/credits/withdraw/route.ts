import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Withdrawal rate: 100 HC = ₦800 NGN (20% platform fee)
const HC_TO_NGN_RATE = 8; // 1 HC = ₦8 for withdrawals
const MINIMUM_WITHDRAWAL_HC = 500; // Minimum 500 HC = ₦4,000
const PLATFORM_FEE_PERCENT = 20;

/**
 * GET /api/credits/withdraw
 * Get withdrawal info (balance, minimum, fees)
 */
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerComponentClient({ cookies: () => cookieStore });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get wallet balance
        const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        const balance = wallet?.balance || 0;
        const withdrawableAmount = Math.max(0, balance - 100); // Keep 100 HC minimum
        const ngnValue = withdrawableAmount * HC_TO_NGN_RATE;
        const platformFee = ngnValue * (PLATFORM_FEE_PERCENT / 100);
        const youReceive = ngnValue - platformFee;

        return NextResponse.json({
            balance,
            withdrawableHc: withdrawableAmount,
            minimumHc: MINIMUM_WITHDRAWAL_HC,
            hcToNgnRate: HC_TO_NGN_RATE,
            platformFeePercent: PLATFORM_FEE_PERCENT,
            estimatedNgn: ngnValue,
            platformFeeNgn: platformFee,
            youReceiveNgn: youReceive,
            canWithdraw: withdrawableAmount >= MINIMUM_WITHDRAWAL_HC
        });
    } catch (error) {
        console.error('Withdrawal info error:', error);
        return NextResponse.json({ error: 'Failed to get withdrawal info' }, { status: 500 });
    }
}

/**
 * POST /api/credits/withdraw
 * Request a withdrawal to bank account
 */
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerComponentClient({ cookies: () => cookieStore });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, bankCode, accountNumber, accountName } = await request.json();

        if (!amount || !bankCode || !accountNumber || !accountName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (amount < MINIMUM_WITHDRAWAL_HC) {
            return NextResponse.json({
                error: `Minimum withdrawal is ${MINIMUM_WITHDRAWAL_HC} HC`
            }, { status: 400 });
        }

        // Get wallet balance
        const { data: wallet } = await supabase
            .from('wallets')
            .select('id, balance')
            .eq('user_id', user.id)
            .single();

        if (!wallet || wallet.balance < amount) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // Calculate payout
        const ngnAmount = amount * HC_TO_NGN_RATE;
        const platformFee = ngnAmount * (PLATFORM_FEE_PERCENT / 100);
        const payoutAmount = ngnAmount - platformFee;

        // Deduct from wallet immediately (escrow)
        const { error: deductError } = await supabase
            .from('wallets')
            .update({
                balance: wallet.balance - amount,
                last_updated_at: new Date().toISOString()
            })
            .eq('id', wallet.id);

        if (deductError) {
            throw deductError;
        }

        // Log the pending withdrawal transaction
        await supabase
            .from('transactions')
            .insert({
                wallet_id: wallet.id,
                amount: -amount,
                type: 'withdrawal_pending',
                description: `Withdrawal request: ${amount} HC → ₦${payoutAmount.toLocaleString()}`,
                metadata: {
                    bank_code: bankCode,
                    account_number: accountNumber,
                    account_name: accountName,
                    hc_amount: amount,
                    ngn_amount: ngnAmount,
                    platform_fee: platformFee,
                    payout_amount: payoutAmount,
                    status: 'pending'
                }
            });

        // TODO: In production, use Paystack Transfer API to send funds
        // For now, we just record the request for manual processing
        // 
        // Paystack Transfer would look like:
        // 1. Create transfer recipient: POST /transferrecipient
        // 2. Initiate transfer: POST /transfer
        // 3. Verify transfer via webhook

        return NextResponse.json({
            success: true,
            message: 'Withdrawal request submitted',
            withdrawal: {
                hcAmount: amount,
                ngnAmount: payoutAmount,
                bankCode,
                accountNumber: accountNumber.slice(-4).padStart(accountNumber.length, '*'),
                accountName,
                status: 'pending',
                estimatedArrival: '1-2 business days'
            }
        });
    } catch (error) {
        console.error('Withdrawal request error:', error);
        return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 });
    }
}
