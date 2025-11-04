"use client";

import React from "react";

const plans = [
  {
    id: "basic",
    title: "Pricing",
    price: "$29/mo",
    features: ["Collaboration basics", "Automated summaries", "Activity monitoring", "Monthly reports"],
    cta: "Join waitlist",
  },
  {
    id: "pro",
    title: "Pro",
    price: "$79/mo",
    features: ["All Basic features", "Content suggestions", "Link & workflow optimization", "Priority integrations"],
    cta: "Join waitlist",
    featured: true,
  },
  {
    id: "business",
    title: "Business",
    price: "$149/mo",
    features: ["All Pro features", "Multi-user access", "API integration", "Dedicated support"],
    cta: "Join waitlist",
  },
];

export default function Pricing() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="relative mx-auto max-w-6xl px-6">
        <h2 className="text-center text-4xl md:text-6xl font-extrabold text-white">Pricing</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-zinc-300">
          Choose the right plan to meet your Bothive collaboration needs and start collaborating today.
        </p>

        <div className="mx-auto mt-8 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="h-6 w-11 rounded-full bg-white/10 p-1">
              <div className="h-4 w-4 rounded-full bg-purple-400 ml-0.5" />
            </div>
            <span className="text-sm text-zinc-400">team</span>
          </div>
        </div>

        {/* Cards: centered row; cards constrained to 320px so they are less wide */}
        <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`relative w-full max-w-[320px] overflow-hidden rounded-2xl border border-white/10 p-6 shadow-lg transition-transform ${
                p.featured ? "scale-105 -translate-y-1 bg-transparent" : "bg-black/60"
              }`}
            >
              {/* left/right purple vignette */}
              {p.id === "basic" && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(400px_200px_at_15%_50%,rgba(124,58,237,0.12),transparent_40%)]" />
              )}
              {p.id === "business" && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(400px_200px_at_85%_50%,rgba(124,58,237,0.12),transparent_40%)]" />
              )}

              {/* featured card glow + background image */}
              {p.featured && (
                <>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl -z-10 blur-3xl bg-[radial-gradient(300px_120px_at_50%_30%,rgba(168,85,247,0.32),rgba(109,40,217,0.22),transparent_60%)] opacity-80" />
                  <div className="absolute inset-0 rounded-2xl  bg-cover bg-center opacity-40 mix-blend-overlay" />

                  {/* grid overlay for featured card */}
                 <GridLines/>
                </>
              )}

              {/* card inner ring */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/8" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm text-zinc-300">{p.price}</p>

                  <hr className="my-6 border-t border-white/10" />

                  <ul className="space-y-3 text-sm text-zinc-300">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <svg className="mt-1 h-4 w-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  {p.featured ? (
                    <div className="relative flex justify-center">
                      <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 h-5 w-56 rounded-full bg-purple-600 opacity-30 blur-3xl" />
                      <button className="mx-auto w-56 relative inline-block rounded-[12px] py-3 text-sm font-semibold text-white bg-linear-to-b from-[#7c3aed] to-[#5b21b6] shadow-[0_12px_40px_rgba(124,58,237,0.36)] border border-white/10 overflow-hidden">
                        <span className="absolute inset-0 rounded-[12px] bg-white/5 opacity-6 mix-blend-overlay" />
                        <span className="relative z-10">{p.cta}</span>
                      </button>
                    </div>
                  ) : (
                    <button className="w-full rounded-md py-3 text-sm font-medium bg-transparent ring-1 ring-white/10 text-white/90">{p.cta}</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function GridLines() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="220" height="160" patternUnits="userSpaceOnUse">
          <path d="M 220 0 L 0 0 0 160" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
        </pattern>
        <linearGradient id="fade" x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
        </linearGradient>
      </defs>
      {/* Outer grid */}
      <rect width="100%" height="100%" fill="url(#grid)" />
      {/* Horizontal accent line */}
      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#fade)" strokeWidth="1" />
    </svg>
  );
}
// "use client"
//
// import React from "react";
//
// export default function Pricing() {
// 	const plans = [
// 		{
// 			id: "basic",
// 			title: "Pricing",
// 			price: "$29/mo",
// 			features: [
// 				"Collaboration basics",
// 				"Automated summaries",
// 				"Activity monitoring",
// 				"Monthly reports",
// 			],
// 			cta: "Join waitlist",
// 		},
// 		{
// 			id: "pro",
// 			title: "Pro",
// 			price: "$79/mo",
// 			features: [
// 				"All Basic features",
// 				"Content suggestions",
// 				"Link & workflow optimization",
// 				"Priority integrations",
// 			],
// 			cta: "Join waitlist",
// 			featured: true,
// 		},
// 		{
// 			id: "business",
// 			title: "Business",
// 			price: "$149/mo",
// 			features: [
// 				"All Pro features",
// 				"Multi-user access",
// 				"API integration",
// 				"Dedicated support",
// 			],
// 			cta: "Join waitlist",
// 		},
// 	];
//
// 	return (
// 		<section className="relative overflow-hidden py-20">
// 			{/* radial ambient glow behind cards */}
// 				<div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
// 					<div
// 						className="h-[480px] w-[1200px] rounded-[40px] opacity-90 blur-[56px] bg-[radial-gradient(40%_40%_at_50%_50%,rgba(168,85,247,0.28)_0%,rgba(109,40,217,0.38)_30%,rgba(76,29,149,0.25)_60%,rgba(0,0,0,0)_78%)] shadow-[0_0_220px_60px_rgba(168,85,247,0.12)]"
// 					/>
// 				</div>
//
// 			<div className="relative mx-auto max-w-3xl px-4">
// 				<h2 className="text-center text-4xl md:text-6xl font-extrabold text-white">Pricing</h2>
// 				<p className="mx-auto mt-3 max-w-2xl text-center text-sm text-zinc-300">
// 					Choose the right plan to meet your Bothive collaboration needs and start collaborating today.
// 				</p>
//
// 				<div className="mx-auto mt-8 flex items-center justify-center">
// 					{/* small toggle placeholder visually matching design */}
// 					<div className="flex items-center gap-3">
// 						<div className="h-6 w-11 rounded-full bg-white/10 p-1">
// 							<div className="h-4 w-4 rounded-full bg-purple-400 ml-[2px]" />
// 						</div>
// 						<span className="text-sm text-zinc-400">team</span>
// 					</div>
// 				</div>
//                    
// 				{/* Cards */}
// 				<div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
// 					{plans.map((p, idx) => (
// 							<div
// 							key={p.id}
// 								className={`relative overflow-hidden rounded-2xl border border-white/10 p-6 shadow-lg transition-transform ${
// 									p.featured
// 										? "scale-105 -translate-y-1 bg-[/Pricing Card.png] "
// 										: "bg-black/60"
// 								}`}
// 						>
// 								{/* left/right purple vignette overlays to match design vibe */}
// 								{p.id === "basic" && (
// 									<div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(400px_200px_at_15%_50%,rgba(124,58,237,0.12),transparent_40%)]" />
// 								)}
// 								{p.id === "business" && (
// 									<div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(400px_200px_at_85%_50%,rgba(124,58,237,0.12),transparent_40%)]" />
// 								)}
//
// 								{/* background image for featured (center) card */}
// 								{p.featured && (
// 									<div className="absolute inset-0 rounded-2xl bg-[url('/PricingCard.png')] bg-cover bg-center opacity-50 mix-blend-overlay" />
// 								)}
//
// 								{/* inner faint grid and edge ring */}
// 								<div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/8" />
//
// 								{/* subtle internal grid on featured (center) card */}
// 								{p.featured && (
// 									<svg
// 										aria-hidden
// 										className="pointer-events-none absolute inset-0 h-full w-full opacity-50 mix-blend-overlay"
// 										xmlns="http://www.w3.org/2000/svg"
// 									>
// 										<defs>
// 											<pattern id={`grid-${p.id}`} width="32" height="32" patternUnits="userSpaceOnUse">
// 												<path d="M0 0 H32 M0 0 V32" fill="none" stroke="rgba(168,85,247,0.12)" strokeWidth="1" strokeDasharray="3 5" />
// 											</pattern>
// 										</defs>
// 										<rect width="100%" height="100%" fill={`url(#grid-${p.id})`} />
// 									</svg>
// 								)}
// 							<div className="relative z-10 max-w-md flex h-full flex-col justify-between">
// 								<div>
// 									<h3 className="text-2xl font-semibold text-white">{p.title}</h3>
// 									<p className="mt-2 text-sm text-zinc-300">{p.price}</p>
//
// 									<hr className="my-6 border-t border-white/10" />
//
// 									<ul className="space-y-3 text-sm text-zinc-300">
// 										{p.features.map((f) => (
// 											<li key={f} className="flex items-start gap-3">
// 												<svg className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
// 													<path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
// 												</svg>
// 												<span>{f}</span>
// 											</li>
// 										))}
// 									</ul>
// 								<div
//
// 									className={`relative w-full max-w-[320px] overflow-hidden rounded-2xl border border-white/10 p-6 shadow-lg transition-transform ${
// 									<button
// 										className={`w-full rounded-md py-3 text-sm font-medium transition ${
// 											p.featured
// 												? "bg-purple-500 ring-white  text-white shadow-[0_8px_30px_rgba(124,58,237,0.25)]"
// 												: "bg-transparent ring-1 ring-white/10 text-white/90"
// 										}`}
// 									>
// 										{p.cta}
// 									</button>
// 								</div>
// 							</div>
// 						</div>
// 					))}
// 				</div>
// 			</div>
// 		</section>
// 	);
// }

