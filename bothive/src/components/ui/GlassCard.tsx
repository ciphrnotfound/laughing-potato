import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    gradient?: boolean;
}

export const GlassCard = ({ children, className, gradient = false, ...props }: GlassCardProps) => {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl transition-all hover:border-border/80 dark:bg-black/40 dark:border-white/10 dark:hover:border-white/20",
                gradient && "bg-gradient-to-br from-white/50 to-white/0 dark:from-white/5 dark:to-white/0",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
