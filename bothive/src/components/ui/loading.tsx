/**
 * Glitchy honeycomb hive loading animation
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ===== DOT LOADER =====
export function DotLoader({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
    const sizes = {
        sm: "h-1.5 w-1.5",
        md: "h-2 w-2",
        lg: "h-3 w-3",
    };
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className={cn("rounded-full bg-purple-500", sizes[size])}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: index * 0.15, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
}

// ===== SPINNER LOADER =====
export function SpinnerLoader({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
    const sizes = {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-3",
    };
    return (
        <div
            className={cn(
                "animate-spin rounded-full border-purple-500 border-t-transparent",
                sizes[size],
                className
            )}
        />
    );
}

// ===== SKELETON LOADER =====
interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    width?: string;
    height?: string;
    animated?: boolean;
}
export function Skeleton({
    className,
    variant = "rectangular",
    width,
    height,
    animated = true,
}: SkeletonProps) {
    const baseClass = "bg-gradient-to-r from-white/5 via-white/10 to-white/5";
    const variantClasses = {
        text: "rounded h-4",
        circular: "rounded-full",
        rectangular: "rounded-lg",
    };
    return (
        <div
            className={cn(baseClass, variantClasses[variant], animated && "animate-shimmer bg-[length:200%_100%]", className)}
            style={{ width, height }}
        />
    );
}

// ===== CARD SKELETON =====
export function CardSkeleton({ isDark = false }: { isDark?: boolean }) {
    return (
        <div className={cn("rounded-2xl border p-6 space-y-4", isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200")}>
            <Skeleton variant="circular" width="40px" height="40px" />
            <Skeleton variant="text" width="60%" height="14px" />
            <Skeleton variant="text" width="40%" height="32px" />
            <Skeleton variant="text" width="50%" height="12px" />
        </div>
    );
}

// ===== TABLE ROW SKELETON =====
export function TableRowSkeleton({ columns = 4, isDark = false }: { columns?: number; isDark?: boolean }) {
    return (
        <div className={cn("flex items-center gap-4 p-4 rounded-lg", isDark ? "bg-white/5" : "bg-gray-100")}
        >
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} variant="text" width={i === 0 ? "30%" : "20%"} height="16px" />
            ))}
        </div>
    );
}

// ===== LOADING OVERLAY =====
interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
    variant?: "dots" | "spinner" | "logo";
    fullScreen?: boolean;
}
export function LoadingOverlay({
    visible,
    message = "Loading...",
    variant = "dots",
    fullScreen = false,
}: LoadingOverlayProps) {
    if (!visible) return null;
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
                "flex flex-col items-center justify-center gap-4 backdrop-blur-sm bg-black/50",
                fullScreen ? "fixed inset-0 z-50" : "absolute inset-0 z-10 rounded-lg"
            )}
        >
            {variant === "logo" ? (
                <LogoLoader size="md" />
            ) : variant === "dots" ? (
                <DotLoader size="lg" />
            ) : (
                <SpinnerLoader size="lg" />
            )}
            {message && <p className="text-sm text-white/80 font-medium">{message}</p>}
        </motion.div>
    );
}

// ===== PULSE LOADER =====
export function PulseLoader({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
    const sizes = { sm: "h-2 w-2", md: "h-3 w-3", lg: "h-4 w-4" };
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className={cn("rounded-full bg-purple-500", sizes[size])}
                    animate={{ y: ["0%", "-50%", "0%"] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: index * 0.1, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
}

// ===== BUTTON LOADER =====
export function ButtonLoader({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <SpinnerLoader size="sm" />
            <span>Loading...</span>
        </div>
    );
}

// ===== GLITCHY HIVE LOADER =====
export function LogoLoader({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
    const sizes = { sm: 60, md: 90, lg: 120 };
    const containerSize = sizes[size];
    const hexSize = containerSize / 3;
    const hexagons = [
        { x: 0, y: 0, delay: 0.5 },
        { x: -1, y: 0, delay: 1.0 },
        { x: 1, y: 0, delay: 1.5 },
        { x: -0.5, y: -0.87, delay: 2.0 },
        { x: 0.5, y: -0.87, delay: 2.5 },
        { x: -0.5, y: 0.87, delay: 3.0 },
        { x: 0.5, y: 0.87, delay: 3.5 },
    ];
    return (
        <motion.div
            className={cn("relative flex items-center justify-center", className)}
            style={{ width: containerSize, height: containerSize }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
        >
            {hexagons.map((hex, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        left: `${50 + hex.x * 28}%`,
                        top: `${50 + hex.y * 28}%`,
                        transform: "translate(-50%, -50%)",
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 1, 0.7, 1, 0.3, 1],
                        scale: [0, 1, 0.95, 1.05, 0.9, 1],
                        rotate: [0, 0, 5, -5, 0, 0],
                    }}
                    transition={{ duration: 2.5, delay: hex.delay, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                >
                    <svg width={hexSize} height={hexSize} viewBox="0 0 100 100">
                        <motion.path
                            d="M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z"
                            fill="none"
                            stroke="#7C3AED"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            animate={{ strokeDasharray: ["0, 300", "150, 150", "300, 0"], opacity: [0.3, 1, 0.5, 1] }}
                            transition={{ duration: 2, delay: hex.delay * 0.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        {/* Glitch effect */}
                        <motion.path
                            d="M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z"
                            fill="none"
                            stroke="#A78BFA"
                            strokeWidth="1"
                            animate={{ opacity: [0, 0, 0.8, 0, 0.6, 0], translateX: [0, 2, -2, 1, 0], translateY: [0, -1, 1, -1, 0] }}
                            transition={{ duration: 2.5, delay: hex.delay + 0.5, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                </motion.div>
            ))}
            {/* Center glow pulse */}
            <motion.div
                className="absolute inset-0 rounded-full opacity-20"
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)" }}
            />
        </motion.div>
    );
}

// ===== PAGE LOADER (NO TEXT) =====
export function PageLoader() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#070910] to-[#0C1024]">
            <LogoLoader size="lg" />
        </div>
    );
}

// ===== INLINE LOGO LOADER =====
export function InlineLogoLoader({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-4 py-12", className)}>
            <LogoLoader size="md" />
        </div>
    );
}
