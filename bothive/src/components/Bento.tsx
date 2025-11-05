"use client";

import Image from "next/image";
import React from "react";

/*
  Bento grid exactly like the design:
  - 2x2 layout on desktop, stacked on mobile
  - Top-left: 3D object on black card + caption
  - Top-right: large gradient app panel with faint UI, caption on left
  - Bottom-left: large gradient chart panel + caption
  - Bottom-right: 3D object on black card + caption
  - Rounded corners, thin borders, inner purple glow, subtle grid lines
  - No yellow anywhere, pure purple/indigo accents
*/

function Frame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-2xl border border-white/10 bg-black/70 overflow-hidden ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_120%,rgba(139,92,246,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)],[background-size:28px_28px]" />
      {children}
    </div>
  );
}

function AppWindow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border border-white/10 bg-[#0b0b0f]/90 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-900/10 to-purple-900/30" />
      {/* Topbar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-white/5" />
          <div className="h-6 w-16 rounded-md bg-white/5" />
          <div className="h-6 w-6 rounded-md bg-white/5" />
        </div>
      </div>
      {/* Grid lines overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)],[background-size:28px_28px]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function Bento() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6">
          <h2 className="text-center text-3xl md:text-4xl  tracking-tight">
            Harness the power of AI to simplify
            <br className="hidden md:block" /> content and performance workflows
            <br className="hidden md:block" /> for teams of any size.
          </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Top-left: 3D object card */}
        <Frame className="p-6 flex flex-col justify-between">
          <div className="flex-1 flex items-center justify-center">
            <Image src="/3dring.png" alt="3D object" width={320} height={240} className="opacity-90" />
          </div>
          <div>
            <h3 className="text-white ">Goal setting</h3>
            <p className="text-white/70 text-sm mt-1">Helps you set and achieve performance goals with guided assistance.</p>
          </div>
        </Frame>

        {/* Top-right: App window panel with image background */}
        {/* <AppWindow className="p-0 overflow-hidden">
          <div className="relative h-full min-h-[260px] w-full">
            <Image
              src="/Userf.png"
              alt="Dashboard preview"
              fill
              priority
              className="object-cover opacity-80"
              sizes="(max-width:768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-purple-900/20 to-black/50" />
            {/* Caption */}
            {/* <div className="relative z-10 px-4 pb-4 pt-24 md:px-6 md:pt-32">
              <h4 className="font-semibold">User-friendly dashboard</h4>
              <p className="text-sm text-white/80">Perform complex SEO audits and optimizations with a single click.</p>
            </div> */}
          {/* </div> */}
        {/* </AppWindow> */} 
        <Frame className="p-6 flex flex-col bg-linear-to-b from-black to-purple-800 justify-between">
          <div className="flex-1 flex items-center justify-center">
            <Image src="/Userf.png" alt="3D object" width={720} height={640} className="opacity-90 mt-0" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Goal setting</h3>
            <p className="text-white/70 text-sm mt-1">Helps you set and achieve performance goals with guided assistance.</p>
          </div>
        </Frame>

        {/* Bottom-left: Chart panel with image background */}
        {/*<AppWindow className="p-0 overflow-hidden">*/}
        {/*  <div className="relative h-full min-h-[260px] w-full">*/}
        {/*    <Image*/}
        {/*      src="/reports.png"*/}
        {/*      alt="Analytics preview"*/}
        {/*      fill*/}
        {/*      className="object-cover opacity-85"*/}
        {/*      sizes="(max-width:768px) 100vw, 50vw"*/}
        {/*    />*/}
        {/*    /!* Gradient to match design depth *!/*/}
        {/*    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-purple-900/30 to-black/60" />*/}
        {/*    /!* Stat overlay *!/*/}
        {/*    <div className="relative z-10 p-4 md:p-6">*/}
        {/*      <div className="flex items-baseline gap-2">*/}
        {/*        <div className="text-3xl font-extrabold">59.8K</div>*/}
        {/*        <div className="text-emerald-400 text-sm">+10.7%</div>*/}
        {/*      </div>*/}
        {/*      <div className="mt-2 text-sm text-white/70">Traffic</div>*/}
        {/*      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)],[background-size:28px_28px]" />*/}
        {/*      <div className="mt-6">*/}
        {/*        <h4 className="font-semibold">Visual reports</h4>*/}
        {/*        <p className="text-sm text-white/80">Visual insights into your site’s performance.</p>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</AppWindow>*/}
        <Frame className="p-6 flex flex-col bg-linear-to-b from-black to-purple-800 justify-between">
          <div className="flex-1 flex items-center justify-center">
            <Image src="/reports.png" alt="3D object" width={720} height={640} className="opacity-90 mt-0" />
          </div>
          <div>
            <h3 className="text-white font-semibold">SEO goal setting</h3>
            <p className="text-white/70 text-sm mt-1">Helps you set and achieve SEO goals with guided assistance.</p>
          </div>
        </Frame>

        {/* Bottom-right: 3D object card */}
        <Frame className="p-6 flex flex-col justify-between">
          <div className="flex-1 flex items-center justify-center">
            <Image src="/3dcone.png" alt="3D shape" width={320} height={240} className="opacity-90" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Smart Content Generator</h3>
            <p className="text-white/70 text-sm mt-1">Automatic suggestions to help you write better content.</p>
          </div>
        </Frame>
      </div>
    </section>
  );
}
