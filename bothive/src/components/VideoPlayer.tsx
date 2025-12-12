"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Volume2, VolumeX, Maximize2 } from "lucide-react";

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
    title?: string;
}

export function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                videoRef.current.requestFullscreen();
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                            <h3 className="text-sm font-medium text-white/80">{title || "Product Demo"}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        {/* Video Container */}
                        <div className="relative aspect-video bg-black">
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                autoPlay
                                muted={isMuted}
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                            />

                            {/* Controls overlay */}
                            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                <button
                                    onClick={toggleMute}
                                    className="p-2 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors"
                                >
                                    {isMuted ? (
                                        <VolumeX className="w-4 h-4 text-white" />
                                    ) : (
                                        <Volume2 className="w-4 h-4 text-white" />
                                    )}
                                </button>
                                <button
                                    onClick={toggleFullscreen}
                                    className="p-2 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors"
                                >
                                    <Maximize2 className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Inline video player with stylish frame (for hero sections)
interface VideoPlayerProps {
    videoUrl?: string;
    posterUrl?: string;
    className?: string;
}

export function VideoPlayer({ videoUrl, posterUrl, className = "" }: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <div className={`relative group ${className}`}>
            {/* Browser frame */}
            <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-[#1a1a1a] shadow-2xl shadow-black/20">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#0f0f0f] border-b border-white/5">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
                    </div>
                    <div className="flex-1 mx-4">
                        <div className="h-6 bg-white/5 rounded-md flex items-center px-3">
                            <span className="text-[10px] text-white/30 font-mono">app.bothive.io/builder</span>
                        </div>
                    </div>
                </div>

                {/* Video area */}
                <div className="relative aspect-[16/10] bg-[#0a0a0a]">
                    {videoUrl ? (
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            poster={posterUrl}
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        // Placeholder with animated gradient
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                className="absolute inset-0 opacity-30"
                                style={{
                                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)",
                                }}
                                animate={{
                                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                                }}
                                transition={{
                                    duration: 10,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Play className="w-6 h-6 text-white/40 ml-1" />
                                </div>
                                <p className="text-sm text-white/30">Video coming soon</p>
                            </div>
                        </div>
                    )}

                    {/* Play button overlay */}
                    {videoUrl && !isPlaying && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={handlePlay}
                            className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20"
                            >
                                <Play className="w-6 h-6 text-white ml-1" />
                            </motion.div>
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Reflection effect */}
            <div className="absolute -bottom-12 left-4 right-4 h-12 bg-gradient-to-b from-white/[0.02] to-transparent rounded-b-xl blur-sm" />
        </div>
    );
}

export default VideoModal;
