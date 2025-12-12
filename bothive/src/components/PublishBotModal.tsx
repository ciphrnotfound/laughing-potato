import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserBot } from "@/lib/agentTypes";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

interface PublishBotModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bot: UserBot | null;
}

export function PublishBotModal({ open, onOpenChange, bot }: PublishBotModalProps) {
    if (!bot) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#0b0d1f] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Publish {bot.name}</DialogTitle>
                    <DialogDescription className="text-white/60">
                        Make your bot available on the Hive Store.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p className="text-sm text-white/70">
                        Publishing will create a public listing for your bot. Users will be able to discover and install it.
                    </p>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/70 hover:text-white hover:bg-white/10">
                        Cancel
                    </Button>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500">
                        <Rocket className="mr-2 h-4 w-4" />
                        Publish Now
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
