"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import ProfessionalAlert from "@/components/ui/game-alert";

type BlogPost = {
  id: number;
  category: string;
  title: string;
  description: string;
  author: string;
  date: string;
  image: string;
};

const posts: BlogPost[] = [
  {
    id: 1,
    category: "Design",
    title: "UX review presentations",
    description: "How do you create compelling presentations that wow your colleagues and impress your manager?",
    author: "Olivia Rhye",
    date: "20 Jan 2025",
    image: "/appstore.jpg",
  },
  {
    id: 2,
    category: "Product",
    title: "Migrating to Linear 101",
    description: "Linear helps streamline software projects, sprints, tasks, and bug tracking. Here’s how to get started.",
    author: "Phoenix Baker",
    date: "19 Jan 2025",
    image: "/design.jpg",
  },
  {
    id: 3,
    category: "Software Engineering",
    title: "Building your API stack",
    description: "The rise of RESTful APIs has been met by a rise in tools for creating, testing, and managing them.",
    author: "Lana Steiner",
    date: "18 Jan 2025",
    image: "/maxresdefault.jpg",
  },
  {
    id: 4,
    category: "Product",
    title: "PM mental models",
    description: "Mental models are simple expressions of complex processes or relationships.",
    author: "Demi Wilkinson",
    date: "16 Jan 2025",
    image: "/tony.jpg",
  },
  {
    id: 5,
    category: "Software Engineering",
    title: "What is wireframing?",
    description: "Introduction to wireframing and its principles. Learn from the best in the industry.",
    author: "Candice Wu",
    date: "15 Jan 2025",
    image: "/1142efc6-17ef-41b1-a69d-16ed7cc3abb4.jpg",
  },
  {
    id: 6,
    category: "Customer Success",
    title: "Podcast: Creating a better CX",
    description: "Starting a community doesn’t need to be complicated, but how do you get started?",
    author: "Orlando Diggs",
    date: "12 Jan 2025",
    image: "/john.jpg",
  },
  {
    id: 7,
    category: "Design",
    title: "How collaboration makes us better designers",
    description: "Collaboration can make our teams stronger, and our individual designs better.",
    author: "Natali Craig",
    date: "24 Jan 2025",
    image: "/appstore.jpg",
  },
  {
    id: 8,
    category: "Product",
    title: "Our top 10 Javascript frameworks to use",
    description: "JavaScript frameworks make development easy with extensive features and functionalities.",
    author: "Drew Cano",
    date: "23 Jan 2025",
    image: "/design.jpg",
  },
  {
    id: 9,
    category: "Design",
    title: "Beyond the pixels: design systems",
    description: "Considerations when you scale visual systems across complex product portfolios.",
    author: "Enola Luna",
    date: "18 Jan 2025",
    image: "/maxresdefault.jpg",
  },
];

const categories = ["View all", "Design", "Product", "Software Engineering", "Customer Success"] as const;

export default function BlogPage() {
  const cards = [{ type: "newsletter" as const }, ...posts.map((post) => ({ type: "post" as const, post }))];
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    autoClose?: number;
  } | null>(null);

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!newsletterEmail) {
      setAlert({
        variant: "warning",
        title: "Email required",
        message: "Drop in your mission control address so we can keep you briefed.",
        autoClose: 1800,
      });
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setAlert({
        variant: "success",
        title: "Transmission linked",
        message: "You're now receiving Bothive weekly drops. See you in the swarm.",
        autoClose: 2400,
      });
      setNewsletterEmail("");
    }, 900);
  };

  return (
    <main className="relative min-h-screen bg-[#070910] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(42,49,80,0.55),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <header className="space-y-6 text-center">
          <p className="text-sm font-medium text-white/55">Our blog</p>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold sm:text-4xl">The latest writings from our team</h1>
            <p className="mx-auto max-w-2xl text-sm text-white/60">
              The latest industry news, interviews, technologies, and resources.
            </p>
          </div>
          <div className="mx-auto flex w-full max-w-md items-center gap-3 rounded-lg border border-white/10 bg-black/45 px-4 py-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/50">
              <path
                d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm6-2 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm text-white/50">Search</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {categories.map((category, idx) => (
              <button
                key={category}
                type="button"
                className={`${
                  idx === 0
                    ? "rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white"
                    : "rounded-full border border-white/10 px-5 py-2 text-sm text-white/60 hover:border-white/20 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 hover:border-white/20 hover:text-white"
            >
              Most recent
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </header>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, index) => {
            if (card.type === "newsletter") {
              return (
                <div
                  key="newsletter"
                  className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-[#111729] to-[#0C1220] p-6 text-left shadow-[0_20px_50px_rgba(5,6,15,0.45)]"
                >
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-white">Weekly newsletter</p>
                    <p className="text-sm text-white/60">
                      No spam. Just the latest releases and tips, interesting articles, and exclusive interviews in your inbox every
                      week.
                    </p>
                  </div>
                  <form className="mt-6 space-y-3" onSubmit={handleNewsletterSubmit}>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full rounded-lg border border-white/12 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#6C43FF] focus:outline-none focus:ring-2 focus:ring-[#6C43FF1f]"
                      value={newsletterEmail}
                      onChange={(event) => setNewsletterEmail(event.target.value)}
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-[#6C43FF] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Linking..." : "Subscribe"}
                    </button>
                    <p className="text-xs text-white/40">Read about our privacy policy.</p>
                  </form>
                </div>
              );
            }

            return (
              <article
                key={card.post.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F19] shadow-[0_18px_40px_rgba(3,4,10,0.28)]"
              >
                <div className="relative h-40 w-full overflow-hidden bg-black">
                  <Image src={card.post.image} alt={card.post.title} fill className="object-cover" priority={index < 3} />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">{card.post.category}</span>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{card.post.title}</h3>
                    <p className="text-sm text-white/60">{card.post.description}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between text-xs text-white/50">
                    <span className="font-medium text-white/70">{card.post.author}</span>
                    <span>{card.post.date}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <nav className="flex items-center justify-center gap-2 text-sm text-white/50">
          <button type="button" className="rounded-md px-3 py-2 hover:bg-white/5 hover:text-white">
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: 10 }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={`flex h-9 w-9 items-center justify-center rounded-md ${index === 0 ? "bg-white text-black" : "hover:bg-white/5"}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button type="button" className="rounded-md px-3 py-2 hover:bg-white/5 hover:text-white">
            Next
          </button>
        </nav>
      </div>
      <ProfessionalAlert
        open={Boolean(alert)}
        variant={alert?.variant ?? "info"}
        title={alert?.title ?? ""}
        message={alert?.message}
        autoClose={alert?.autoClose}
        onClose={() => setAlert(null)}
      />
    </main>
  );
}

