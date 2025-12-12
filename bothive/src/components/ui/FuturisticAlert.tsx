"use client";

import React, { useEffect, useState, memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, XOctagon, Zap, Shield, Wifi, Database, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-context';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';
type AlertIcon = 'default' | 'shield' | 'wifi' | 'database' | 'settings';

interface FuturisticAlertProps {
    open: boolean;
    variant?: AlertVariant;
    title: string;
    message?: string;
    onClose?: () => void;
    primaryAction?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    autoClose?: boolean | number;
    durationMs?: number;
    customIcon?: AlertIcon;
    showThemeToggle?: boolean;
}

const variantConfig = {
    error: {
        icon: XOctagon,
        gradient: 'from-red-500/30 via-red-600/20 to-red-700/10',
        border: 'border-red-500/40',
        glow: 'shadow-[0_0_60px_-10px_rgba(239,68,68,0.7),0_0_120px_-20px_rgba(239,68,68,0.4)]',
        iconColor: 'text-red-500',
        accentColor: 'bg-red-500',
        scanlineColor: 'bg-red-500/20',
        particleColor: '#ef4444',
    },
    success: {
        icon: CheckCircle,
        gradient: 'from-emerald-500/30 via-emerald-600/20 to-emerald-700/10',
        border: 'border-emerald-500/40',
        glow: 'shadow-[0_0_60px_-10px_rgba(16,185,129,0.7),0_0_120px_-20px_rgba(16,185,129,0.4)]',
        iconColor: 'text-emerald-500',
        accentColor: 'bg-emerald-500',
        scanlineColor: 'bg-emerald-500/20',
        particleColor: '#10b981',
    },
    warning: {
        icon: AlertTriangle,
        gradient: 'from-amber-500/30 via-amber-600/20 to-amber-700/10',
        border: 'border-amber-500/40',
        glow: 'shadow-[0_0_60px_-10px_rgba(245,158,11,0.7),0_0_120px_-20px_rgba(245,158,11,0.4)]',
        iconColor: 'text-amber-500',
        accentColor: 'bg-amber-500',
        scanlineColor: 'bg-amber-500/20',
        particleColor: '#f59e0b',
    },
    info: {
        icon: Info,
        gradient: 'from-blue-500/30 via-blue-600/20 to-blue-700/10',
        border: 'border-blue-500/40',
        glow: 'shadow-[0_0_60px_-10px_rgba(59,130,246,0.7),0_0_120px_-20px_rgba(59,130,246,0.4)]',
        iconColor: 'text-blue-500',
        accentColor: 'bg-blue-500',
        scanlineColor: 'bg-blue-500/20',
        particleColor: '#3b82f6',
    },
};

const customIcons = {
    default: null,
    shield: Shield,
    wifi: Wifi,
    database: Database,
    settings: Settings,
};

// Optimized particle component with memo
const Particle = memo(({ color, delay, index }: { color: string; delay: number; index: number }) => {
    const animationProps = useMemo(() => {
        const randomValues = Array.from({ length: 3 }, () => Math.random());
        return {
            opacity: [0, 1, 0],
            x: (randomValues[0] * 200 - 100),
            y: (randomValues[1] * -150 - 50),
            scale: [0, 1.5, 0],
        };
    }, []);

    return (
        <motion.div
            className="absolute w-1 h-1 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={animationProps}
            transition={{
                duration: 2,
                delay,
                repeat: Infinity,
                ease: 'easeOut',
            }}
        />
    );
});

Particle.displayName = 'Particle';

export function FuturisticAlert({
    open,
    variant = 'info',
    title,
    message,
    onClose,
    primaryAction,
    secondaryAction,
    autoClose = false,
    durationMs = 5000,
    customIcon,
    showThemeToggle = false,
}: FuturisticAlertProps) {
    const [isVisible, setIsVisible] = useState(open);
    const [mounted, setMounted] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const config = variantConfig[variant];
    const Icon = customIcon && customIcons[customIcon] ? customIcons[customIcon]! : config.icon;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setIsVisible(open);
    }, [open]);

    useEffect(() => {
        const shouldAutoClose = typeof autoClose === 'number' ? autoClose : (autoClose === true ? durationMs : 0);
        if (shouldAutoClose && open) {
            const timer = setTimeout(() => {
                onClose?.();
            }, shouldAutoClose);
            return () => clearTimeout(timer);
        }
    }, [autoClose, open, durationMs, onClose]);

    // Memoize particle positions for performance
    const particlePositions = useMemo(() => {
        const randomValues = Array.from({ length: 6 }, () => Math.random() * 100);
        return randomValues;
    }, []);

    if (!mounted) return null;

    const content = (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
                        onClick={onClose}
                    />

                    {/* Alert Card */}
                    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25,
                                mass: 0.8
                            }}
                            className="pointer-events-auto w-full max-w-md"
                        >
                            <div
                                className={cn(
                                    'relative overflow-hidden rounded-2xl backdrop-blur-xl',
                                    theme === 'dark'
                                        ? 'bg-gradient-to-br from-black/95 via-black/90 to-black/85'
                                        : 'bg-gradient-to-br from-white/95 via-white/90 to-white/85',
                                    'border-2',
                                    config.border,
                                    config.glow
                                )}
                            >
                                {/* Animated scanlines */}
                                <motion.div
                                    className={cn('absolute inset-x-0 h-px', config.scanlineColor)}
                                    animate={{
                                        y: [0, 400],
                                        opacity: [0.8, 0.2, 0.8],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                />
                                <motion.div
                                    className={cn('absolute inset-x-0 h-px', config.scanlineColor)}
                                    animate={{
                                        y: [0, 400],
                                        opacity: [0.6, 0.1, 0.6],
                                    }}
                                    transition={{
                                        duration: 3,
                                        delay: 0.5,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                />

                                {/* Gradient background overlay with pulse */}
                                <motion.div
                                    className={cn('absolute inset-0 bg-gradient-to-br', config.gradient)}
                                    animate={{
                                        opacity: [0.3, 0.5, 0.3],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />

                                {/* Corner accents with glow animation */}
                                <div className="absolute top-0 left-0 w-24 h-24">
                                    <motion.div
                                        className={cn('absolute top-0 left-0 w-px h-20', config.accentColor)}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <motion.div
                                        className={cn('absolute top-0 left-0 h-px w-20', config.accentColor)}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                    />
                                    <motion.div
                                        className={cn('absolute top-0 left-0 w-2 h-2 rounded-full', config.accentColor)}
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                </div>
                                <div className="absolute bottom-0 right-0 w-24 h-24">
                                    <motion.div
                                        className={cn('absolute bottom-0 right-0 w-px h-20', config.accentColor)}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                    />
                                    <motion.div
                                        className={cn('absolute bottom-0 right-0 h-px w-20', config.accentColor)}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                                    />
                                    <motion.div
                                        className={cn('absolute bottom-0 right-0 w-2 h-2 rounded-full', config.accentColor)}
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
                                    />
                                </div>

                                {/* Optimized floating particles - reduced from 8 to 6 */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    {particlePositions.map((left, i) => (
                                        <div
                                            key={i}
                                            className="absolute"
                                            style={{
                                                left: `${left}%`,
                                                bottom: 0,
                                            }}
                                        >
                                            <Particle color={config.particleColor} delay={i * 0.4} index={i} />
                                        </div>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className="relative z-10 p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Animated icon with enhanced effects */}
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 200,
                                                damping: 15,
                                                delay: 0.1
                                            }}
                                            className="relative"
                                        >
                                            <motion.div
                                                className={cn(
                                                    'flex-shrink-0 w-14 h-14 rounded-xl',
                                                    'flex items-center justify-center',
                                                    theme === 'dark'
                                                        ? 'bg-gradient-to-br from-white/15 to-white/5'
                                                        : 'bg-gradient-to-br from-black/15 to-black/5',
                                                    'border-2',
                                                    theme === 'dark' ? 'border-white/25' : 'border-black/25',
                                                    'shadow-inner'
                                                )}
                                                animate={{
                                                    boxShadow: [
                                                        `0 0 20px ${config.particleColor}40`,
                                                        `0 0 40px ${config.particleColor}60`,
                                                        `0 0 20px ${config.particleColor}40`,
                                                    ],
                                                }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <motion.div
                                                    animate={{ rotate: variant === 'error' ? [0, 5, -5, 0] : 0 }}
                                                    transition={{ duration: 0.5, repeat: variant === 'error' ? Infinity : 0, repeatDelay: 2 }}
                                                >
                                                    <Icon className={cn('w-7 h-7', config.iconColor)} />
                                                </motion.div>
                                            </motion.div>
                                        </motion.div>

                                        {/* Text content */}
                                        <div className="flex-1 min-w-0 pt-1">
                                            <motion.h3
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className={cn(
                                                    'text-xl font-bold mb-2',
                                                    theme === 'dark' ? 'text-white' : 'text-black'
                                                )}
                                            >
                                                {title}
                                            </motion.h3>
                                            {message && (
                                                <motion.p
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className={cn(
                                                        'text-sm leading-relaxed',
                                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                    )}
                                                >
                                                    {message}
                                                </motion.p>
                                            )}

                                            {/* Actions */}
                                            {(primaryAction || secondaryAction) && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.4 }}
                                                    className="flex items-center gap-3 mt-5"
                                                >
                                                    {primaryAction && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={primaryAction.onClick}
                                                            className={cn(
                                                                'px-5 py-2.5 rounded-lg font-semibold text-sm',
                                                                'bg-gradient-to-r from-white/20 to-white/10',
                                                                'border border-white/30 hover:border-white/40',
                                                                theme === 'dark' ? 'text-white' : 'text-black',
                                                                'backdrop-blur-sm',
                                                                'transition-all duration-200',
                                                                'flex items-center gap-2',
                                                                'shadow-lg'
                                                            )}
                                                        >
                                                            <Zap className="w-4 h-4" />
                                                            {primaryAction.label}
                                                        </motion.button>
                                                    )}
                                                    {secondaryAction && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={secondaryAction.onClick}
                                                            className={cn(
                                                                'px-5 py-2.5 rounded-lg font-medium text-sm transition-colors',
                                                                theme === 'dark'
                                                                    ? 'text-gray-300 hover:text-white'
                                                                    : 'text-gray-700 hover:text-black'
                                                            )}
                                                        >
                                                            {secondaryAction.label}
                                                        </motion.button>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Theme toggle (if enabled) */}
                                        {showThemeToggle && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={toggleTheme}
                                                className={cn(
                                                    'flex-shrink-0 w-9 h-9 rounded-lg',
                                                    'flex items-center justify-center',
                                                    'hover:bg-white/15 border border-white/10 hover:border-white/20',
                                                    theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black',
                                                    'transition-all duration-200',
                                                    'backdrop-blur-sm'
                                                )}
                                                aria-label="Toggle theme"
                                            >
                                                {theme === 'dark' ? '☀️' : '🌙'}
                                            </motion.button>
                                        )}

                                        {/* Close button */}
                                        {onClose && (
                                            <motion.button
                                                whileHover={{ scale: 1.2, rotate: 90 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={onClose}
                                                className={cn(
                                                    'flex-shrink-0 w-9 h-9 rounded-lg',
                                                    'flex items-center justify-center',
                                                    'hover:bg-white/15 border border-white/10 hover:border-white/20',
                                                    theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black',
                                                    'transition-all duration-200',
                                                    'backdrop-blur-sm'
                                                )}
                                                aria-label="Close"
                                            >
                                                <X className="w-5 h-5" />
                                            </motion.button>
                                        )}
                                    </div>

                                    {/* Progress bar for auto-close */}
                                    {autoClose && (
                                        <motion.div
                                            className={cn(
                                                'absolute bottom-0 left-0 right-0 h-1',
                                                theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                                            )}
                                            initial={{ scaleX: 0 }}
                                            style={{ transformOrigin: 'left' }}
                                        >
                                            <motion.div
                                                className={cn('h-full', config.accentColor, 'shadow-lg')}
                                                style={{
                                                    boxShadow: `0 0 10px ${config.particleColor}`,
                                                    transformOrigin: 'right'
                                                }}
                                                initial={{ scaleX: 1 }}
                                                animate={{ scaleX: 0 }}
                                                transition={{
                                                    duration: (typeof autoClose === 'number' ? autoClose : durationMs) / 1000,
                                                    ease: 'linear',
                                                }}
                                            />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Holographic grid overlay */}
                                <div
                                    className="absolute inset-0 pointer-events-none opacity-[0.05]"
                                    style={{
                                        backgroundImage: `
                                            linear-gradient(to right, ${theme === 'dark' ? 'white' : 'black'} 1px, transparent 1px),
                                            linear-gradient(to bottom, ${theme === 'dark' ? 'white' : 'black'} 1px, transparent 1px)
                                        `,
                                        backgroundSize: '20px 20px',
                                    }}
                                />

                                {/* Noise texture */}
                                <div
                                    className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
}

export default FuturisticAlert;
