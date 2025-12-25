import { Toaster } from "sonner";
import { GlassAlertProvider } from "@/components/ui/glass-alert";

export default function ClientLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <GlassAlertProvider>
            {children}
            <Toaster
                position="top-center"
                toastOptions={{
                    classNames: {
                        toast: "bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl rounded-2xl p-4 gap-3",
                        title: "text-[14px] font-semibold",
                        description: "text-[12px] text-white/70",
                        actionButton: "bg-white text-black text-xs font-bold py-2 px-4 rounded-lg",
                        cancelButton: "bg-white/10 text-white text-xs hover:bg-white/20",
                        success: "!bg-emerald-500/10 !border-emerald-500/20 !text-emerald-100 [&_svg]:!text-emerald-400",
                        error: "!bg-red-500/10 !border-red-500/20 !text-red-100 [&_svg]:!text-red-400",
                        warning: "!bg-amber-500/10 !border-amber-500/20 !text-amber-100 [&_svg]:!text-amber-400",
                        info: "!bg-blue-500/10 !border-blue-500/20 !text-blue-100 [&_svg]:!text-blue-400",
                    },
                    unstyled: false,
                }}
            />
        </GlassAlertProvider>
    );
}
