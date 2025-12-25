"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Package, DollarSign, Code2, Upload } from 'lucide-react';
import { HeroBackground } from '@/components/HeroBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGlassAlert } from '@/components/ui/glass-alert';

// Form Steps
import BasicInfoStep from '@/components/integration-form/BasicInfoStep';
import PricingStep from '@/components/integration-form/PricingStep';
import TechnicalStep from '@/components/integration-form/TechnicalStep';
import ReviewStep from '@/components/integration-form/ReviewStep';

export type IntegrationFormData = {
    // Basic Info
    name: string;
    slug: string;
    category: string;
    shortDescription: string;
    longDescription: string;
    iconUrl: string;
    coverImageUrl: string;
    screenshots: string[];

    // Pricing
    pricingModel: 'free' | 'one_time' | 'subscription';
    price: number;
    currency: string;
    paystackPlanCode?: string;

    // Technical
    integrationType: 'api' | 'oauth' | 'webhook';
    authMethod: 'api_key' | 'oauth2' | 'none';
    apiBaseUrl?: string;
    documentationUrl?: string;
    sdkPackageUrl?: string;
    entryPoint?: string;
    capabilities: string[];
};

const initialData: IntegrationFormData = {
    name: '',
    slug: '',
    category: 'productivity',
    shortDescription: '',
    longDescription: '',
    iconUrl: '',
    coverImageUrl: '',
    screenshots: [],
    pricingModel: 'free',
    price: 0,
    currency: 'USD',
    integrationType: 'api',
    authMethod: 'api_key',
    capabilities: [],
};

const steps = [
    { id: 'basic', title: 'Basic Info', icon: Package },
    { id: 'pricing', title: 'Pricing', icon: DollarSign },
    { id: 'technical', title: 'Technical', icon: Code2 },
    { id: 'review', title: 'Review', icon: Check },
];

export default function SubmitIntegrationPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<IntegrationFormData>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showAlert } = useGlassAlert();

    const updateFormData = (data: Partial<IntegrationFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/integrations/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Submission failed');

            await showAlert("Submission Recorded", "Your integration has been sent to the triage queue for review.", "success");
            router.push('/developer?success=true');
        } catch (error) {
            console.error('Failed to submit integration:', error);
            await showAlert("Transmission Failure", "An error occurred while sending your integration to the core.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <HeroBackground className="min-h-screen w-full overflow-hidden pb-6 pt-16 sm:pt-24">
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-foreground mb-2"
                    >
                        Submit New Integration
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground"
                    >
                        Share your tool with thousands of BotHive users
                    </motion.p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-muted -z-10" />

                        {steps.map((step, index) => {
                            const isCompleted = index < currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                                            isCompleted || isCurrent
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-muted-foreground/30 bg-background text-muted-foreground"
                                        )}
                                    >
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <span className={cn(
                                        "text-xs font-medium transition-colors duration-300",
                                        isCurrent ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <GlassCard className="p-6 sm:p-8 mb-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {currentStep === 0 && (
                                <BasicInfoStep data={formData} updateData={updateFormData} />
                            )}
                            {currentStep === 1 && (
                                <PricingStep data={formData} updateData={updateFormData} />
                            )}
                            {currentStep === 2 && (
                                <TechnicalStep data={formData} updateData={updateFormData} />
                            )}
                            {currentStep === 3 && (
                                <ReviewStep data={formData} />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0 || isSubmitting}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors",
                                currentStep === 0
                                    ? "text-muted-foreground opacity-50 cursor-not-allowed"
                                    : "text-foreground hover:bg-muted"
                            )}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>

                        {currentStep === steps.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Submit Integration
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                            >
                                Next Step
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </GlassCard>
            </div>
        </HeroBackground>
    );
}
