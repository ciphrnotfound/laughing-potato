"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Download, Star, Shield, Zap, Globe, CheckCircle,
    MessageSquare, ArrowLeft, Share2, ExternalLink,
    CreditCard, Lock
} from 'lucide-react';
import { HeroBackground } from '@/components/HeroBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PaystackService } from '@/lib/paystack-service';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Integration {
    id: string;
    name: string;
    slug: string;
    short_description: string;
    long_description: string;
    icon_url: string;
    cover_image_url: string;
    screenshots: string[];
    pricing_model: 'free' | 'one_time' | 'subscription';
    price: number;
    currency: string;
    paystack_plan_code: string;
    developer_id: string;
    rating: number;
    review_count: number;
    total_installs: number;
    capabilities: string[];
    updated_at: string;
}

export default function IntegrationDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [integration, setIntegration] = useState<Integration | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchIntegration();
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const fetchIntegration = async () => {
        try {
            const { data, error } = await supabase
                .from('marketplace_integrations')
                .select('*')
                .eq('slug', params.slug)
                .single();

            if (error) throw error;
            setIntegration(data);
        } catch (error) {
            console.error('Error fetching integration:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (!integration) return;

        setPurchasing(true);
        try {
            // 1. Initialize Paystack Transaction
            const response = await fetch('/api/integrations/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    integrationId: integration.id,
                    email: user.email,
                }),
            });

            const data = await response.json();

            if (data.authorization_url) {
                // Redirect to Paystack
                window.location.href = data.authorization_url;
            } else if (data.success) {
                // Free installation success
                router.push('/integrations?success=true');
            }
        } catch (error) {
            console.error('Purchase failed:', error);
            // TODO: Show error toast
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <HeroBackground className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </HeroBackground>
        );
    }

    if (!integration) {
        return (
            <HeroBackground className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Integration not found</h1>
                <Link href="/hivetools" className="text-primary hover:underline">
                    Back to Marketplace
                </Link>
            </HeroBackground>
        );
    }

    return (
        <HeroBackground className="min-h-screen w-full overflow-hidden pb-12 pt-20">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    href="/hivetools"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Marketplace
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Card */}
                        <GlassCard className="p-8 relative overflow-hidden">
                            {/* Background Blur/Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

                            <div className="relative flex gap-6">
                                <div className="w-24 h-24 rounded-2xl bg-background/50 border border-white/10 flex items-center justify-center overflow-hidden shadow-xl shrink-0">
                                    {integration.icon_url ? (
                                        <img src={integration.icon_url} alt={integration.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Zap className="w-10 h-10 text-primary" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h1 className="text-3xl font-bold text-foreground mb-2">{integration.name}</h1>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    {integration.rating.toFixed(1)} ({integration.review_count} reviews)
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Download className="w-4 h-4" />
                                                    {integration.total_installs.toLocaleString()} installs
                                                </span>
                                            </div>
                                        </div>
                                        <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {integration.short_description}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Screenshots Carousel */}
                        {integration.screenshots && integration.screenshots.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">Preview</h2>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {integration.screenshots.map((url, i) => (
                                        <div key={i} className="w-[400px] aspect-video rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-lg">
                                            <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description & Capabilities */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">About this integration</h2>
                                <div className="prose prose-invert max-w-none text-muted-foreground">
                                    <p>{integration.long_description || integration.short_description}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">Capabilities</h2>
                                <div className="space-y-3">
                                    {integration.capabilities?.map((cap, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{cap}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Pricing & Actions */}
                    <div className="space-y-6">
                        <GlassCard className="p-6 sticky top-24">
                            <div className="mb-6">
                                <div className="text-sm text-muted-foreground mb-1">Price</div>
                                <div className="flex items-baseline gap-2">
                                    {integration.pricing_model === 'free' ? (
                                        <span className="text-3xl font-bold text-foreground">Free</span>
                                    ) : (
                                        <>
                                            <span className="text-3xl font-bold text-foreground">
                                                {integration.currency === 'NGN' ? '₦' : '$'}
                                                {integration.price.toLocaleString()}
                                            </span>
                                            {integration.pricing_model === 'subscription' && (
                                                <span className="text-muted-foreground">/month</span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={purchasing}
                                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 mb-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {purchasing ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {integration.pricing_model === 'free' ? (
                                            <>
                                                <Download className="w-5 h-5" />
                                                Install Now
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5" />
                                                Purchase Now
                                            </>
                                        )}
                                    </>
                                )}
                            </button>

                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    <span>Verified by BotHive</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Lock className="w-4 h-4 text-blue-500" />
                                    <span>Secure Payment via Paystack</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Globe className="w-4 h-4" />
                                    <span>Works globally</span>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h3 className="font-semibold text-foreground mb-4">Developer</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                    <span className="font-bold text-muted-foreground">D</span>
                                </div>
                                <div>
                                    <div className="font-medium text-foreground">Developer Name</div>
                                    <div className="text-xs text-muted-foreground">Joined 2024</div>
                                </div>
                            </div>
                            <button className="w-full py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Contact Developer
                            </button>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </HeroBackground>
    );
}
