import React from 'react';
import { IntegrationFormData } from '@/app/developer/submit/page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GlassCard } from '@/components/ui/GlassCard';
import { DollarSign, CreditCard, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    data: IntegrationFormData;
    updateData: (data: Partial<IntegrationFormData>) => void;
}

export default function PricingStep({ data, updateData }: Props) {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Label className="text-base">Pricing Model</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'free', title: 'Free', icon: DollarSign, desc: 'Free for everyone' },
                        { id: 'one_time', title: 'One-Time', icon: CreditCard, desc: 'Single payment' },
                        { id: 'subscription', title: 'Subscription', icon: Calendar, desc: 'Recurring billing' },
                    ].map((model) => (
                        <div
                            key={model.id}
                            onClick={() => updateData({ pricingModel: model.id as any })}
                            className={cn(
                                "cursor-pointer relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200",
                                data.pricingModel === model.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                        >
                            <model.icon className={cn(
                                "w-6 h-6 mb-2",
                                data.pricingModel === model.id ? "text-primary" : "text-muted-foreground"
                            )} />
                            <h3 className="font-semibold text-foreground">{model.title}</h3>
                            <p className="text-xs text-muted-foreground">{model.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {data.pricingModel !== 'free' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.price}
                                    onChange={(e) => updateData({ price: parseFloat(e.target.value) })}
                                    className="pl-7 bg-background/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <select
                                id="currency"
                                value={data.currency}
                                onChange={(e) => updateData({ currency: e.target.value })}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="NGN">NGN (₦)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paystackPlanCode">
                            {data.pricingModel === 'subscription' ? 'Paystack Plan Code' : 'Paystack Product Code'}
                        </Label>
                        <Input
                            id="paystackPlanCode"
                            placeholder={data.pricingModel === 'subscription' ? "PLN_xxxxxxxxx" : "PROD_xxxxxxxxx"}
                            value={data.paystackPlanCode || ''}
                            onChange={(e) => updateData({ paystackPlanCode: e.target.value })}
                            className="bg-background/50 font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                            Create this in your Paystack Dashboard and paste the code here.
                        </p>
                    </div>

                    <GlassCard className="p-4 bg-primary/5 border-primary/20">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Your estimated earnings (85%):</span>
                            <span className="font-bold text-foreground">
                                ${(data.price * 0.85).toFixed(2)}
                            </span>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
