import React from 'react';
import { IntegrationFormData } from '@/app/developer/submit/page';
import { GlassCard } from '@/components/ui/GlassCard';
import { Package, DollarSign, Code2, CheckCircle } from 'lucide-react';

interface Props {
    data: IntegrationFormData;
}

export default function ReviewStep({ data }: Props) {
    return (
        <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                    <h3 className="font-semibold text-foreground">Ready to Submit?</h3>
                    <p className="text-sm text-muted-foreground">
                        Your integration will be reviewed by our team before going live. This usually takes 24-48 hours.
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                <GlassCard className="p-4">
                    <div className="flex items-center gap-2 mb-3 text-primary">
                        <Package className="w-4 h-4" />
                        <h3 className="font-semibold">Basic Info</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground block">Name</span>
                            <span className="font-medium">{data.name}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Category</span>
                            <span className="font-medium capitalize">{data.category}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-muted-foreground block">Description</span>
                            <span className="text-muted-foreground">{data.shortDescription}</span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-2 mb-3 text-primary">
                        <DollarSign className="w-4 h-4" />
                        <h3 className="font-semibold">Pricing</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground block">Model</span>
                            <span className="font-medium capitalize">{data.pricingModel.replace('_', ' ')}</span>
                        </div>
                        {data.pricingModel !== 'free' && (
                            <div>
                                <span className="text-muted-foreground block">Price</span>
                                <span className="font-medium">
                                    {data.currency === 'USD' ? '$' : data.currency}
                                    {data.price.toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-2 mb-3 text-primary">
                        <Code2 className="w-4 h-4" />
                        <h3 className="font-semibold">Technical</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground block">Type</span>
                            <span className="font-medium capitalize">{data.integrationType}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Auth</span>
                            <span className="font-medium capitalize">{data.authMethod.replace('_', ' ')}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-muted-foreground block">Capabilities</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {data.capabilities.map((cap, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-xs">
                                        {cap}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
