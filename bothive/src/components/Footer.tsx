"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Github, Twitter, Linkedin, ArrowUpRight } from "lucide-react";
import { useRef, useEffect, useState, useMemo } from "react";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API", href: "/docs/api" },
      { label: "Blog", href: "/blog" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/bothive", label: "Twitter" },
  { icon: Github, href: "https://github.com/bothive", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/company/bothive", label: "LinkedIn" },
];

// Shooting Star Component
function ShootingStar({ delay }: { delay: number }) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setKey(k => k + 1);
    }, 6000 + delay * 1000);
    return () => clearInterval(interval);
  }, [delay]);
  const starStyle = useMemo(() => ({
    left: `${20 + Math.random() * 60}%`,
    top: `${10 + Math.random() * 30}%`,
    boxShadow: '0 0 6px 1px rgba(255,255,255,0.6)',
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  return (
    <motion.div
      key={key}
      className="absolute w-[2px] h-[2px] bg-white rounded-full"
      style={starStyle}
      initial={{
        opacity: 0,
        x: 0,
        y: 0,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: 150,
        y: 150,
      }}
      transition={{
        duration: 1.2,
        delay: delay,
        ease: "easeOut",
      }}
    >
      {/* Trail */}
      <div
        className="absolute top-0 right-0 h-[1px] w-[60px] origin-right"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 100%)',
          transform: 'rotate(-45deg) translateX(30px)',
        }}
      />
    </motion.div>
  );
}

// Stars background
function StarsBackground() {
  /* eslint-disable react-hooks/exhaustive-deps */
  const stars = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 1.5,
    opacity: 0.2 + Math.random() * 0.4,
  })), []);
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: star.id % 3 === 0 ? 'rgba(167, 139, 250, 0.8)' : 'white', // Some stars are purple
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 0.3, star.opacity],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Shooting stars */}
      <ShootingStar delay={0} />
      <ShootingStar delay={2} />
      <ShootingStar delay={4} />
    </div>
  );
}

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredChar, setHoveredChar] = useState<number | null>(null);

  const brandText = "BOTHIVE";

  return (
    <footer ref={ref} className="relative bg-gradient-to-b from-[#0a0812] via-[#080510] to-[#050508] border-t border-violet-500/10 overflow-hidden">
      {/* Stars background */}
      <StarsBackground />

      {/* Purple ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Animated gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <motion.div
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
          animate={{ x: ["-100%", "400%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12">
          {/* Brand */}
          <motion.div
            className="col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <motion.div
                className="relative w-10 h-10"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Image
                  src="/colored-logo (2).png"
                  alt="Bothive"
                  fill
                  className="object-contain"
                />
              </motion.div>
              <span className="text-xl font-semibold text-white group-hover:text-white/80 transition-colors">
                Bothive
              </span>
            </Link>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed mb-6">
              The operating system for the AI workforce. Build, deploy, and scale autonomous agents.
            </p>

            {/* Newsletter */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 rounded-xl bg-white text-[#050508] text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section], sectionIndex) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + sectionIndex * 0.1, duration: 0.6 }}
            >
              <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-5">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.2 + sectionIndex * 0.1 + linkIndex * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.div
          className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Bothive Inc. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, i) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 + i * 0.1 }}
                whileHover={{ scale: 1.2, y: -2 }}
                className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.05] transition-all"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Large brand text with character animation */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="relative w-full overflow-hidden py-8 select-none"
      >
        <div className="flex justify-center">
          <div className="flex">
            {brandText.split('').map((char, index) => (
              <motion.span
                key={index}
                className="font-black tracking-[-0.05em] cursor-default"
                style={{
                  fontSize: 'clamp(80px, 20vw, 280px)',
                  lineHeight: 0.85,
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(255,255,255,0.08)',
                }}
                onMouseEnter={() => setHoveredChar(index)}
                onMouseLeave={() => setHoveredChar(null)}
                animate={{
                  WebkitTextStroke: hoveredChar === index
                    ? '2px rgba(255,255,255,0.4)'
                    : '1px rgba(255,255,255,0.08)',
                  textShadow: hoveredChar === index
                    ? '0 0 40px rgba(255,255,255,0.2)'
                    : '0 0 0px rgba(255,255,255,0)',
                }}
                whileHover={{
                  y: -10,
                  transition: { type: 'spring', stiffness: 400, damping: 15 }
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Horizontal scan line effect */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
          }}
          animate={{
            top: ['20%', '80%', '20%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </footer>
  );
}
