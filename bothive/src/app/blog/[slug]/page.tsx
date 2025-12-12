"use client";

import React from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { BLOG_POSTS } from "@/lib/blogData";
import Navbar2 from "@/components/Navbar2";
import Footer from "@/components/Footer";

export default function BlogPostPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const post = BLOG_POSTS.find((p) => p.id === slug);

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#030014] text-black dark:text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Post not found</h1>
                    <Link href="/blog" className="text-violet-500 hover:underline">Return to Blog</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#030014] text-[#0a0a0f] dark:text-white">
            <Navbar2 />

            <main className="pt-32 pb-24 px-6">
                <article className="max-w-3xl mx-auto">
                    {/* Back Link */}
                    <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-black/50 dark:text-white/50 hover:text-violet-500 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>

                    {/* Header */}
                    <header className="mb-12">
                        <div className="flex items-center gap-3 text-xs mb-6">
                            <span className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">
                                {post.category}
                            </span>
                            <span className="text-black/40 dark:text-white/40 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {post.date}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-4 text-sm border-t border-b border-black/5 dark:border-white/5 py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="font-medium">{post.author}</span>
                            </div>
                            <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                            <div className="flex items-center gap-1 text-black/50 dark:text-white/50">
                                <Clock className="w-4 h-4" />
                                {post.readTime}
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-violet-500 hover:prose-a:text-violet-400 prose-img:rounded-xl">
                        <ReactMarkdown>{post.content || post.excerpt}</ReactMarkdown>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
