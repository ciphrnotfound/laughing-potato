// import  React from "react";
// import {Spotlight} from "@/components/ui/Spotlight";
// import {cn} from "@/lib/utils";
// import {TextGenerateEffect} from "@/components/ui/TextGenerateEffect";
// import MagicButton from "@/components/MagicButton";
//
//
// import {FaLocationArrow} from "react-icons/fa";
//
//
// const Hero = () => {
//     return(
//         <>
//             <div className={`pb-20 pt-20`}>
//                 <div>
//                     <Spotlight className={`-top-0 left-10 md:left-32 md:top-20 h-screen` } fill={"purple"}/>
//                     <Spotlight className={`-top-0 left-full md:right-32 md:top-20 h-screen` } fill={"purple"}/>
//                     <Spotlight className={`-top-18 left-70  h-[80vh] w-[50vw]` } fill={"blue"}/>
//                 </div>
//
//                 <div className=" flex h-screen w-full items-center justify-center bg-white dark:bg-black-100   absolute top-0 left-0">
//                     <div
//                         className={cn(
//                             "absolute inset-0",
//                             "[background-size:40px_40px]",
//                             "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
//                             "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
//                         )}
//                     />
//                     {/* Radial gradient for the container to give a faded look */}
//                     <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] "/>
//
//
//                 </div>
//
//                 <div className={`flex justify-center relative my-20 z-10 mt-0 `}>
//                     <div className={`max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center top-0`}>
//                         {/*<MagicButton2*/}
//                         {/*    title="Available For Hire"*/}
//                         {/*    otherClasses= {`mb-10`}*/}
//                         {/*/>*/}
//                         <h1 className={`uppercase tracking-widest max-w-80 text-xs text-center text-transparent bg-gradient-to-br from-white/40 to-white/80 bg-clip-text dark:text-transparent  `}>
//                             Dynamic Web Magic with Next.js
//                         </h1>
//
//                         <TextGenerateEffect
//                             className={`text-center text-[40px]   md:text-2xl max-w-lg:text-2xl xl:text-5xl mt-5 leading-tight md:leading-snug lg:leading-snug font-extrabold`}
//                             words={`Where AI Minds Collaborate`}
//                         />
//                         {/*<p className={`text-center md:tracking-wider mb-4 text-md `}>*/}
//                         {/*    Hi, I&apos;m Jeremy, A Software Developer*/}
//                         {/*    based in Nigeria*/}
//                         {/*</p>*/}
//                         <TextGenerateEffect
//                             className={`text-center md:tracking-wider mb-4 text-md`}
//                             words={`Bothive is the operating system for the AI era — a platform where autonomous agents connect, collaborate, and create new intelligence together.`}
//                         />
//
//                         <a href={`#projects`} >
//                             <MagicButton
//                                 title="Check Out My Projects"
//                                 icon={<FaLocationArrow/>} position={""} otherClasses={""}                               />
//
//                         </a>
//
//
//                     </div>
//
//                 </div>
//
//
//
//             </div>
//         </>
//     )
// }
// export default Hero;
// import React from "react";
// import { Spotlight } from "@/components/ui/Spotlight";
// import { cn } from "@/lib/utils";
// import {TextGenerateEffect} from "@/components/ui/TextGenerateEffect2";
// import {TextGenerateEffect2} from "@/components/ui/TextGenerateEffect";
// import MagicButton from "@/components/MagicButton";
// import { FaLocationArrow } from "react-icons/fa";
// import Navbar2 from "@/components/Navbar2";
// const Hero = () => {
//     return (
//         <>
//             <div className="pt-20 pb-20 min-h-screen  w-full relative overflow-hidden"
//                  // style={{ backgroundImage: `url("/Hero.png")` }}
//             >
//                 {/* Ambient spotlights */}                
//                
//                 <div>
//                     {/* Left violet spotlight */}
//                     <Spotlight
//                         className="-top-0 justify-center mx-auto flex items-center left-10 md:left-32 md:top-20 h-screen"
//                         fill="#7C3AED" // violet-600
//                     />
//                     {/* Right gold spotlight */}
//                     <Spotlight
//                         className="-top-0 left-full md:right-32 md:top-20 h-screen"
//                         fill="#F59E0B" // amber-500
//                     />
//                     {/* Center subtle blue/violet wash */}
//                     <Spotlight
//                         className="-top-[72px] left-[70px] h-[80vh] w-[50vw]"
//                         fill="#6366F1" // indigo-500
//                     />
//                 </div>
//
//                 {/* Background grid and radial mask */}
//                 <div className="absolute top-0 left-0 flex h-screen w-full items-center justify-center bg-black-100">
//                     <div
//                         className={cn(
//                             "absolute inset-0",
//                             "[background-size:40px_40px]",
//                             // Light mode grid lines with a violet/gold tint
//                             // "[background-image:linear-gradient(to_right,rgba(124,58,237,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,158,11,0.12)_1px,transparent_1px)]",
//                             // Dark mode grid lines with deeper tints
//                             "[background-image:linear-gradient(to_right,rgba(109,40,217,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(109,40,217,0.22)_1px,transparent_1px)]"
//                         )}
//                     />
//                     {/* Soft radial vignette */}
//                     <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-transparent [mask-image:radial-gradient(ellipse_at_center,transparent_18%,black)]" />
//                     {/* Subtle conic glow in center to match brand vibe */}
//                     <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light">
//                         <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
//                              style={{
//                                  background:
//                                      "conic-gradient(from 180deg at 50% 50%, rgba(124,58,237,0.18), rgba(245,158,11,0.14), rgba(99,102,241,0.18), rgba(124,58,237,0.18))"
//                              }}
//                         />
//                     </div>
//                 </div>
//
//                 {/* Foreground content */}
//                 <div className="relative z-10 mt-0 my-10 flex justify-center">
//                     <div className="top-0 flex max-w-[89vw] flex-col items-center justify-center md:max-w-2xl lg:max-w-[60vw]">
//                         <h1 className="max-w-80 text-center text-xs uppercase tracking-widest text-transparent bg-gradient-to-r from-violet-300 via-violet-200 to-amber-200 bg-clip-text dark:text-transparent">
//                             Dynamic Web Magic with Next.js
//                         </h1>
//
//                         <TextGenerateEffect2
//                             className="mt-5 text-center text-[40px] font-extrabold leading-tight md:text-2xl   xl:text-5xl"
//                             words="Where AI Minds Collaborate"
//                         />
//
//                         <TextGenerateEffect
//                             className="mb-4 text-center text-md md:tracking-wider"
//                             words="Bothive is the operating system for the AI era — a platform where autonomous agents connect, collaborate, and create new intelligence together."
//                         />
//                         <button className={`mt-6  bg-white px-6 py-3 text-black text-sm font-semibold rounded-lg  shadow-[0_8px_30px_rgb(124,58,237,0.25)] hover:from-violet-500 hover:via-violet-400 hover:to-amber-300 transition-all duration-300`}>
//                             Get Started 
//                         </button>
//
//                         {/*<a href="#projects" aria-label="Jump to projects">*/}
//                         {/*    <MagicButton*/}
//                         {/*        title="Check Out My Projects"*/}
//                         {/*        icon={<FaLocationArrow />}*/}
//                         {/*        position="right"*/}
//                         {/*        otherClasses="mt-6 bg-gradient-to-r from-violet-600 via-violet-500 to-amber-400 hover:from-violet-500 hover:via-violet-400 hover:to-amber-300 text-white shadow-[0_8px_30px_rgb(124,58,237,0.25)]"*/}
//                         {/*    />*/}
//                         {/*</a>*/}
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };
// export default Hero;
// import React from "react";
// import { Spotlight } from "@/components/ui/Spotlight";
// import { cn } from "@/lib/utils";
// import { TextGenerateEffect } from "@/components/ui/TextGenerateEffect2";
// import { TextGenerateEffect2 } from "@/components/ui/TextGenerateEffect";
// import MagicButton from "@/components/MagicButton";
// import { FaLocationArrow } from "react-icons/fa";
//
// const Hero = () => {
//     return (
//         <>
//             <section
//                 role="banner"
//                 aria-label="Hero"
//                 className="relative w-full min-h-screen overflow-hidden  pb-20 pt-20"
//                 // style={{ backgroundImage: `url("/Hero.png")` }}
//             >
//                 {/* Ambient spotlights */}
//                 <div aria-hidden="true">
//                     {/* Left violet spotlight */}
//                     <Spotlight
//                         className="-top-0 left-10 md:left-32 md:top-20 h-screen"
//                         fill="#7C3AED"
//                     />
//                     {/* Right gold spotlight */}
//                     <Spotlight
//                         className="-top-0 left-full md:right-32 md:top-20 h-screen"
//                         fill="#F59E0B"
//                     />
//                     {/* Center subtle blue/violet wash */}
//                     <Spotlight
//                         className="-top-[72px] left-[70px] h-[80vh] w-[50vw]"
//                         fill="#6366F1"
//                     />
//                 </div>
//
//                 {/* Background grid and radial/conic masks */}
//                 <div
//                     className="absolute inset-0"
//                     aria-hidden="true"
//                 >
//                     <div
//                         className={cn(
//                             "absolute inset-0",
//                             "[background-size:40px_40px]",
//                             "[background-image:linear-gradient(to_right,rgba(109,40,217,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(109,40,217,0.22)_1px,transparent_1px)]"
//                         )}
//                     />
//                     {/* Soft radial vignette */}
//                     <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-transparent [mask-image:radial-gradient(ellipse_at_center,transparent_18%,black)]" />
//                     {/* Subtle conic glow */}
//                     <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light">
//                         <div
//                             className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
//                             style={{
//                                 background:
//                                     "conic-gradient(from 180deg at 50% 50%, rgba(124,58,237,0.18), rgba(245,158,11,0.14), rgba(99,102,241,0.18), rgba(124,58,237,0.18))",
//                             }}
//                         />
//                     </div>
//                 </div>
//
//                 {/* Foreground content - centered */}
//                 <div className="relative z-10 flex min-h-screen ">
//                     <div className="mx-auto flex w-full max-w-[90rem] md:items-center px-6 md:px-10">
//                         <div className="mx-auto flex max-w-[89vw] flex-col max-md:mt-10 md:justify-center md:items-center text-center md:max-w-2xl lg:max-w-4xl">
//                             <div className="text-xs uppercase tracking-widest text-purple-800 px-5  bg-black py-3 rounded-full">
//                                 <span className={`bg-purple-800 text-black px-4 py-1.5 mr-4 rounded-full`}>New</span>
//                                 Latest Integration Just Arrived
//                             </div>
//
//                             <TextGenerateEffect2
//                                 className="mt-4 text-5xl font-medium leading-tight sm:text-5xl md:text-5xl xl:text-7xl"
//                                 words="Where AI Minds Collaborate"
//                             />
//
//                             <TextGenerateEffect
//                                 className="mt-3 max-w-2xl text-sm text-white/80 md:mt-4 md:text-base md:tracking-wider"
//                                 words="Bothive is the operating system for the AI era — a platform where autonomous agents connect, collaborate, and create new intelligence together."
//                             />
//
//                             <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
//                                 <a href="#get-started" aria-label="Get started">
//                                     <button className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black shadow-[0_8px_30px_rgb(124,58,237,0.25)] transition-all duration-300 hover:scale-[1.02]">
//                                         Get Started
//                                     </button>
//                                 </a>
//
//                                
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>
//         </>
//     );
// };
//
// export default Hero;

import React from "react";
import { Spotlight } from "@/components/ui/Spotlight";
import { cn } from "@/lib/utils";
import { TextGenerateEffect as Subheadline } from "@/components/ui/TextGenerateEffect2";
import { TextGenerateEffect2 as Headline } from "@/components/ui/TextGenerateEffect";
import MagicButton from "@/components/MagicButton";
import { FaLocationArrow } from "react-icons/fa";
import {Spotlight2} from "@/components/ui/spotlight-new";
import Image from "next/image";
import AmbientBackdrop from "./AmbientBackdrop";


const Hero = () => {
    return (
        <section
            role="banner"
            aria-label="Hero"
            className="relative w-full min-h-[640px] sm:min-h-screen overflow-hidden dark:bg-black bg-white pb-10 pt-16 sm:pb-16 sm:pt-24"
        >
            {/* Ambient spotlights: layered, soft, and dynamic */}
            <div aria-hidden="true">
                {/* Primary violet wash */}
                <Spotlight className="-top-6 left-6 md:left-24 md:top-10 h-[82vh] opacity-80" fill="#7C3AED" />
                {/* Secondary violet accent on the right */}
                <Spotlight className="-top-8 left-full md:right-20 md:top-16 h-[76vh] opacity-65" fill="#6A00FF" />
                {/* Subtle indigo blend to tie the center */}
                <Spotlight className="-top-[72px] left-[72px] h-[64vh] w-[50vw] opacity-60" fill="#6366F1" />
                <Spotlight2 />
            </div>

            {/* Background grid and soft mask */}
            {/*<div className="pointer-events-none absolute inset-0" aria-hidden="true">*/}
            {/*    <div*/}
            {/*        className={cn(*/}
            {/*            "absolute inset-0",*/}
            {/*            "[background-size:36px_36px]",*/}
            {/*            "[background-image:linear-gradient(to_right,rgba(109,40,217,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(109,40,217,0.18)_1px,transparent_1px)]"*/}
            {/*        )}*/}
            {/*    />*/}
            {/*    <div className="absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_14%,black)]" />*/}
            {/*    <div className="absolute inset-0 opacity-55 mix-blend-soft-light">*/}
            {/*        <div*/}
            {/*            className="absolute left-1/2 top-1/2 h-[58vmin] w-[58vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"*/}
            {/*            style={{*/}
            {/*                background:*/}
            {/*                    "conic-gradient(from 180deg at 50% 50%, rgba(124,58,237,0.16), rgba(106,0,255,0.12), rgba(99,102,241,0.14), rgba(124,58,237,0.16))",*/}
            {/*            }}*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*</div>*/}
            <AmbientBackdrop/>

            {/* Foreground content - single column, tight spacing */}
            <div className="relative z-10">
                <div className="mx-auto flex min-h-[520px] sm:min-h-[calc(100vh-7rem)] w-full max-w-[92rem] mt-6 sm:mt-10 md:items-center px-6 sm:px-10">
                    <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
                        {/* Compact badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 dark:bg-black/40 bg-white/40  px-3 py-1 backdrop-blur-md">
              <span className="rounded-full bg-purple-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black">
                New
              </span>
                            <span className="text-[10px] font-medium tracking-wider text-black dark:text-white/80">
                Latest Integration Just Arrived
              </span>
                        </div>

                        {/* Headline - tight leading and minimal gap */}
                        <div className="mt-3">
                            <Headline
                                className=" text-[36px] leading-[1.06] sm:text-[44px] md:text-[56px] xl:text-[68px]"
                                duration={0.35}
                                words="Where AI Minds Collaborate"
                            />
                        </div>

                        {/* Subheadline - tighter and concise width */}
                        <div className="mt-2 max-w-[56ch]">
                            <Subheadline
                                className="text-[13px] leading-snug  sm:text-sm md:text-[15px]"
                                duration={0.32}
                                words="Bothive is the operating system for the AI era — a platform where autonomous agents connect, collaborate, and create new intelligence together."
                            />
                        </div>

                        {/* CTA row */}
                        <div className="mt-5 flex flex-col items-center gap-3 sm:mt-6 sm:flex-row">
                            <a href="/signup?redirect=%2Fgetting-started" aria-label="Get started">
                                <button className="rounded-lg dark:bg-white bg-black px-6 py-3 text-sm font-semibold dark:text-black text-white shadow-[0_8px_30px_rgba(124,58,237,0.25)] transition-all duration-300 hover:scale-[1.02]">
                                    Get Started
                                </button>
                            </a>


                            
                            {/*<button*/}
                            {/*    className="group/button relative inline-flex items-center justify-center overflow-hidden rounded-md bg-blue-500/30 backdrop-blur-lg px-6 py-2 text-base  text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-blue-600/50 border border-white/20"*/}
                            {/*>*/}
                            {/*    <span className="text-lg">Get Started</span>*/}
                            {/*    <div*/}
                            {/*        className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]"*/}
                            {/*    >*/}
                            {/*        <div className="relative h-full w-10 bg-white/30"></div>*/}
                            {/*    </div>*/}
                            {/*</button>*/}



                        </div>

                        {/* Microcopy */}
                        <p className="mt-3 text-[11px] text-white/55 sm:text-xs">
                            No credit card required. Free tier available.
                        </p>
                        {/*<div>*/}
                        {/*    <Image src="/App.png" alt="Hero Image" className="" width={2100} height={1080} />*/}
                        {/*</div>*/}
                        <div className={`md:mt-10 text-[15px] text-white/60`}>
                            <p>Trusted By the world's most innovative teams</p>
                        </div>
                       
                    </div>
                </div>
            </div>

            {/* Optional subtle scroll hint */}
            {/*<div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 opacity-70">*/}
            {/*    <div className="flex items-center gap-2 text-[10px] text-white/60">*/}
            {/*        <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" />*/}
            {/*        <span>Scroll</span>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </section>
    );
};

export default Hero;