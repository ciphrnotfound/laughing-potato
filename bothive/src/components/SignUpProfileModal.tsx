"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Building2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SignUpProfileValues {
  preferredName: string;
  pronouns: string;
  teamName: string;
  favoriteAgentStyle: "technical" | "playful" | "balanced";
}

interface SignUpProfileModalProps {
  open: boolean;
  initialValues?: Partial<SignUpProfileValues>;
  onSubmit: (values: SignUpProfileValues) => Promise<void> | void;
  onClose: () => void;
}

const defaultValues: SignUpProfileValues = {
  preferredName: "",
  pronouns: "",
  teamName: "",
  favoriteAgentStyle: "balanced",
};

export function SignUpProfileModal({ open, initialValues, onSubmit, onClose }: SignUpProfileModalProps) {
  const [values, setValues] = useState<SignUpProfileValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof SignUpProfileValues, nextValue: string) => {
    setValues(prev => ({ ...prev, [field]: nextValue }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:border-violet-400 focus:outline-none";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#070910] p-8 text-white shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-white/70 transition hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-6 space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                Let us know you
              </span>
              <h2 className="text-2xl font-semibold">How should the hive welcome you?</h2>
              <p className="text-sm text-white/60">
                Tell us a bit more so every Bothive experience feels personal.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  <User className="h-4 w-4" /> Preferred Name
                </label>
                <input
                  type="text"
                  value={values.preferredName}
                  onChange={event => handleChange("preferredName", event.target.value)}
                  placeholder="What should we call you?"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  Pronouns (optional)
                </label>
                <input
                  type="text"
                  value={values.pronouns}
                  onChange={event => handleChange("pronouns", event.target.value)}
                  placeholder="e.g. she/her, they/them"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  <Building2 className="h-4 w-4" /> Team / Org Name
                </label>
                <input
                  type="text"
                  value={values.teamName}
                  onChange={event => handleChange("teamName", event.target.value)}
                  placeholder="Where do you build from?"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  Agent Vibe
                </label>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {([
                    { id: "technical", label: "Technical" },
                    { id: "balanced", label: "Balanced" },
                    { id: "playful", label: "Playful" },
                  ] as const).map(option => (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => handleChange("favoriteAgentStyle", option.id)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 transition",
                        values.favoriteAgentStyle === option.id
                          ? "border-violet-400 bg-violet-500/10 text-white"
                          : "border-white/10 text-white/70 hover:border-white/30"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/30"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] px-6 py-3 text-sm font-semibold text-white shadow-lg transition disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
