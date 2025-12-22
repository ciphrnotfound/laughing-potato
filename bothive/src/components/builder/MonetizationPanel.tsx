"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign,
    Calendar,
    Plus,
    Trash2,
    GripVertical,
    Eye,
    ChevronDown,
    CreditCard,
    Gift,
    Repeat,
    FileText,
    Mail,
    List,
    CheckSquare,
    Type,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export type PricingModel = 'free' | 'one_time' | 'subscription' | 'both';

export interface SubscriptionConfig {
    monthlyPrice: number;
    yearlyPrice: number;
    trialDays: number;
}

export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'select' | 'checkbox' | 'textarea';
    placeholder?: string;
    required: boolean;
    options?: string[];
}

export interface MonetizationConfig {
    model: PricingModel;
    currency: string;
    oneTimePrice: number;
    subscription: SubscriptionConfig;
    userFormFields: FormField[];
}

interface MonetizationPanelProps {
    config: MonetizationConfig;
    onChange: (config: MonetizationConfig) => void;
}

// Currency data
const CURRENCIES = [
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', flag: '🇬🇭' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
];

const FIELD_TYPES = [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'email', icon: Mail, label: 'Email' },
    { type: 'textarea', icon: FileText, label: 'Long Text' },
    { type: 'select', icon: List, label: 'Dropdown' },
    { type: 'checkbox', icon: CheckSquare, label: 'Checkbox' },
];

export default function MonetizationPanel({ config, onChange }: MonetizationPanelProps) {
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const [showFormPreview, setShowFormPreview] = useState(false);
    const [newFieldType, setNewFieldType] = useState<FormField['type']>('text');

    const selectedCurrency = CURRENCIES.find(c => c.code === config.currency) || CURRENCIES[0];

    const updateConfig = (updates: Partial<MonetizationConfig>) => {
        onChange({ ...config, ...updates });
    };

    const addFormField = () => {
        const newField: FormField = {
            id: `field_${Date.now()}`,
            label: `New ${newFieldType} field`,
            type: newFieldType,
            placeholder: '',
            required: false,
            options: newFieldType === 'select' ? ['Option 1', 'Option 2'] : undefined,
        };
        updateConfig({ userFormFields: [...config.userFormFields, newField] });
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        updateConfig({
            userFormFields: config.userFormFields.map(f =>
                f.id === id ? { ...f, ...updates } : f
            )
        });
    };

    const removeField = (id: string) => {
        updateConfig({
            userFormFields: config.userFormFields.filter(f => f.id !== id)
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <CreditCard className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Monetization</h2>
                    <p className="text-xs text-white/50">Set pricing and user requirements</p>
                </div>
            </div>

            {/* Currency Selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Currency
                </label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{selectedCurrency.flag}</span>
                            <span className="text-white font-medium">{selectedCurrency.code}</span>
                            <span className="text-white/50 text-sm">{selectedCurrency.symbol}</span>
                        </div>
                        <ChevronDown className={cn(
                            "h-4 w-4 text-white/40 transition-transform",
                            showCurrencyPicker && "rotate-180"
                        )} />
                    </button>

                    <AnimatePresence>
                        {showCurrencyPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute z-20 top-full left-0 right-0 mt-2 p-2 rounded-xl bg-[#1a1a1f] border border-white/10 shadow-2xl max-h-60 overflow-y-auto"
                            >
                                {CURRENCIES.map((currency) => (
                                    <button
                                        key={currency.code}
                                        type="button"
                                        onClick={() => {
                                            updateConfig({ currency: currency.code });
                                            setShowCurrencyPicker(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                            config.currency === currency.code
                                                ? "bg-emerald-500/20 text-emerald-400"
                                                : "hover:bg-white/5 text-white"
                                        )}
                                    >
                                        <span className="text-lg">{currency.flag}</span>
                                        <span className="font-medium">{currency.code}</span>
                                        <span className="text-white/50 text-sm flex-1 text-left">{currency.name}</span>
                                        <span className="text-white/30">{currency.symbol}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Pricing Model */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/70">Pricing Model</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'free', icon: Gift, label: 'Free', desc: 'Open to everyone' },
                        { id: 'one_time', icon: DollarSign, label: 'One-time', desc: 'Single purchase' },
                        { id: 'subscription', icon: Repeat, label: 'Subscription', desc: 'Recurring billing' },
                        { id: 'both', icon: CreditCard, label: 'Both', desc: 'User chooses' },
                    ].map(option => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => updateConfig({ model: option.id as PricingModel })}
                            className={cn(
                                "p-4 rounded-xl border text-left transition-all",
                                config.model === option.id
                                    ? "border-emerald-500/50 bg-emerald-500/10"
                                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                            )}
                        >
                            <option.icon className={cn(
                                "h-5 w-5 mb-2",
                                config.model === option.id ? "text-emerald-400" : "text-white/40"
                            )} />
                            <div className="text-sm font-medium text-white">{option.label}</div>
                            <div className="text-[10px] text-white/40 mt-0.5">{option.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* One-time Price */}
            {(config.model === 'one_time' || config.model === 'both') && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                >
                    <label className="text-sm font-medium text-white/70">One-time Price</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">
                            {selectedCurrency.symbol}
                        </span>
                        <input
                            type="number"
                            value={config.oneTimePrice || ''}
                            onChange={(e) => updateConfig({ oneTimePrice: Number(e.target.value) })}
                            placeholder="0.00"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>
                </motion.div>
            )}

            {/* Subscription Pricing */}
            {(config.model === 'subscription' || config.model === 'both') && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/10"
                >
                    <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                        <Calendar className="h-4 w-4" />
                        Subscription Settings
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-xs text-white/50">Monthly Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                                    {selectedCurrency.symbol}
                                </span>
                                <input
                                    type="number"
                                    value={config.subscription?.monthlyPrice || ''}
                                    onChange={(e) => updateConfig({
                                        subscription: {
                                            ...config.subscription,
                                            monthlyPrice: Number(e.target.value)
                                        }
                                    })}
                                    placeholder="0"
                                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-white/50">Yearly Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                                    {selectedCurrency.symbol}
                                </span>
                                <input
                                    type="number"
                                    value={config.subscription?.yearlyPrice || ''}
                                    onChange={(e) => updateConfig({
                                        subscription: {
                                            ...config.subscription,
                                            yearlyPrice: Number(e.target.value)
                                        }
                                    })}
                                    placeholder="0"
                                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-white/50">Free Trial (days)</label>
                        <input
                            type="number"
                            value={config.subscription?.trialDays || ''}
                            onChange={(e) => updateConfig({
                                subscription: {
                                    ...config.subscription,
                                    trialDays: Number(e.target.value)
                                }
                            })}
                            placeholder="0"
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                        />
                        <p className="text-[10px] text-white/30">Leave at 0 for no trial period</p>
                    </div>

                    {config.subscription?.yearlyPrice > 0 && config.subscription?.monthlyPrice > 0 && (
                        <div className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
                            📊 Yearly saves {Math.round((1 - config.subscription.yearlyPrice / (config.subscription.monthlyPrice * 12)) * 100)}% compared to monthly
                        </div>
                    )}
                </motion.div>
            )}

            {/* User Form Builder */}
            <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                        <FileText className="h-4 w-4" />
                        User Intake Form
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowFormPreview(!showFormPreview)}
                        className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                            showFormPreview
                                ? "bg-violet-500/20 text-violet-400"
                                : "text-white/40 hover:text-white/60"
                        )}
                    >
                        <Eye className="h-3 w-3" />
                        Preview
                    </button>
                </div>
                <p className="text-xs text-white/40">
                    Collect information from users before they can use your bot
                </p>

                {/* Add Field Button */}
                <div className="flex items-center gap-2">
                    <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as FormField['type'])}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
                    >
                        {FIELD_TYPES.map(ft => (
                            <option key={ft.type} value={ft.type}>{ft.label}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={addFormField}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </button>
                </div>

                {/* Form Fields List */}
                <AnimatePresence>
                    {config.userFormFields.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-2"
                        >
                            {config.userFormFields.map((field, index) => (
                                <motion.div
                                    key={field.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="h-4 w-4 text-white/20 cursor-grab" />
                                        <input
                                            type="text"
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            className="flex-1 px-2 py-1 rounded bg-transparent border-b border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
                                        />
                                        <span className="text-[10px] text-white/30 uppercase px-2 py-0.5 rounded bg-white/5">
                                            {field.type}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => updateField(field.id, { required: !field.required })}
                                            className={cn(
                                                "text-[10px] px-2 py-0.5 rounded transition-colors",
                                                field.required
                                                    ? "bg-amber-500/20 text-amber-400"
                                                    : "bg-white/5 text-white/40 hover:text-white/60"
                                            )}
                                        >
                                            {field.required ? 'Required' : 'Optional'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeField(field.id)}
                                            className="p-1 rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {field.type !== 'checkbox' && (
                                        <input
                                            type="text"
                                            value={field.placeholder || ''}
                                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                            placeholder="Placeholder text..."
                                            className="w-full px-2 py-1 rounded bg-white/5 border border-white/5 text-white/60 text-xs focus:outline-none focus:border-violet-500/30"
                                        />
                                    )}

                                    {field.type === 'select' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-white/40">Options (one per line)</label>
                                            <textarea
                                                value={field.options?.join('\n') || ''}
                                                onChange={(e) => updateField(field.id, {
                                                    options: e.target.value.split('\n').filter(o => o.trim())
                                                })}
                                                rows={3}
                                                className="w-full px-2 py-1 rounded bg-white/5 border border-white/5 text-white/60 text-xs focus:outline-none focus:border-violet-500/30 resize-none"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {config.userFormFields.length === 0 && (
                    <div className="text-center py-6 text-white/30 text-sm">
                        No fields added yet. Users can use the bot immediately.
                    </div>
                )}

                {/* Form Preview */}
                <AnimatePresence>
                    {showFormPreview && config.userFormFields.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 space-y-4"
                        >
                            <div className="text-xs font-medium text-violet-400">📋 Form Preview</div>
                            {config.userFormFields.map(field => (
                                <div key={field.id} className="space-y-1">
                                    <label className="text-sm text-white">
                                        {field.label}
                                        {field.required && <span className="text-red-400 ml-1">*</span>}
                                    </label>
                                    {field.type === 'text' && (
                                        <input
                                            type="text"
                                            placeholder={field.placeholder}
                                            disabled
                                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white/50 text-sm"
                                        />
                                    )}
                                    {field.type === 'email' && (
                                        <input
                                            type="email"
                                            placeholder={field.placeholder}
                                            disabled
                                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white/50 text-sm"
                                        />
                                    )}
                                    {field.type === 'textarea' && (
                                        <textarea
                                            placeholder={field.placeholder}
                                            disabled
                                            rows={3}
                                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white/50 text-sm resize-none"
                                        />
                                    )}
                                    {field.type === 'select' && (
                                        <select disabled className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white/50 text-sm">
                                            <option>{field.placeholder || 'Select an option...'}</option>
                                            {field.options?.map((opt, i) => (
                                                <option key={i}>{opt}</option>
                                            ))}
                                        </select>
                                    )}
                                    {field.type === 'checkbox' && (
                                        <label className="flex items-center gap-2 text-sm text-white/60">
                                            <input type="checkbox" disabled className="rounded" />
                                            {field.placeholder || 'Check this option'}
                                        </label>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Platform Fee Notice */}
            {config.model !== 'free' && (
                <div className="text-[10px] text-white/30 text-center pt-2">
                    Platform takes a 10% fee on all transactions
                </div>
            )}
        </div>
    );
}

// Default configuration export
export const DEFAULT_MONETIZATION_CONFIG: MonetizationConfig = {
    model: 'free',
    currency: 'NGN',
    oneTimePrice: 0,
    subscription: {
        monthlyPrice: 0,
        yearlyPrice: 0,
        trialDays: 0,
    },
    userFormFields: [],
};
