"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, User, ArrowUpRight, Sparkles } from "lucide-react";
import Navbar2 from "@/components/Navbar2";
import Footer from "@/components/Footer";

import { BLOG_POSTS, CATEGORIES } from "@/lib/blogData";

function BlogCard({ post, featured = false }: { post: typeof BLOG_POSTS[0]; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.id}`}>
      <motion.article
        whileHover={{ y: -4 }}
        className={`group relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-white/[0.02] ${featured ? "h-full" : ""
          }`}
      >
        {/* Image placeholder */}
        {featured && (
          <div className="aspect-[16/9] bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-violet-500/30" />
          </div>
        )}

        <div className="p-6">
          {/* Category & Meta */}
          <div className="flex items-center gap-3 text-xs mb-4">
            <span className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">
              {post.category}
            </span>
            <span className="text-black/40 dark:text-white/40 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.date}
            </span>
            <span className="text-black/40 dark:text-white/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h3 className={`font-semibold text-[#0a0a0f] dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-2 ${featured ? "text-xl md:text-2xl" : "text-lg"
            }`}>
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed mb-4">
            {post.excerpt}
          </p>

          {/* Author & CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs text-black/50 dark:text-white/50">{post.author}</span>
            </div>
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Read more <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = React.useState("All");

  const filteredPosts = activeCategory === "All"
    ? BLOG_POSTS
    : BLOG_POSTS.filter(post => post.category === activeCategory);

  const featuredPosts = BLOG_POSTS.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#030014] text-[#0a0a0f] dark:text-white">
      <Navbar2 />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs font-medium text-violet-600 dark:text-violet-400 mb-4">
              Blog
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
              Insights & Updates
            </h1>
            <p className="text-lg text-black/50 dark:text-white/50">
              News, engineering deep-dives, and thoughts on the future of AI agents.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {featuredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <BlogCard post={post} featured />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category
                  ? "bg-[#0a0a0f] dark:bg-white text-white dark:text-black"
                  : "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 px-6 border-t border-black/5 dark:border-white/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Stay in the loop
          </h2>
          <p className="text-black/50 dark:text-white/50 mb-8">
            Get the latest articles and product updates delivered to your inbox.
          </p>
          <form className="flex gap-3">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#0a0a0f] dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
