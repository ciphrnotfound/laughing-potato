// "use client";
// import { ThreeDMarquee } from "@/components/ui/3d-marquee";

// export function ThreeDMarqueeDemo() {
//   const images = [
//     "/acme.png",
//     "App.png",
//     "https://assets.aceternity.com/animated-testimonials.webp",
//     "acme.png",
//     "acme.png",
//     "https://assets.aceternity.com/glare-card.png",
//     "https://assets.aceternity.com/layout-grid.png",
//     "https://assets.aceternity.com/flip-text.png",
//     "https://assets.aceternity.com/hero-highlight.png",
//     "https://assets.aceternity.com/carousel.webp",
//     "https://assets.aceternity.com/placeholders-and-vanish-input.png",
//     "https://assets.aceternity.com/shooting-stars-and-stars-background.png",
//     "https://assets.aceternity.com/signup-form.png",
//     "https://assets.aceternity.com/cloudinary_bkp/stars_sxle3d.png",
//     "https://assets.aceternity.com/spotlight-new.webp",
//     "https://assets.aceternity.com/cloudinary_bkp/Spotlight_ar5jpr.png",
//     "https://assets.aceternity.com/cloudinary_bkp/Parallax_Scroll_pzlatw_anfkh7.png",
//     "https://assets.aceternity.com/tabs.png",
//     "https://assets.aceternity.com/cloudinary_bkp/Tracing_Beam_npujte.png",
//     "https://assets.aceternity.com/cloudinary_bkp/typewriter-effect.png",
//     "https://assets.aceternity.com/glowing-effect.webp",
//     // "https://assets.aceternity.com/hover-border-gradient.png",
//     // "https://assets.aceternity.com/cloudinary_bkp/Infinite_Moving_Cards_evhzur.png",
//     // "https://assets.aceternity.com/cloudinary_bkp/Lamp_hlq3ln.png",
//     // "https://assets.aceternity.com/macbook-scroll.png",
//     // "https://assets.aceternity.com/cloudinary_bkp/Meteors_fye3ys.png",
//     // "https://assets.aceternity.com/cloudinary_bkp/Moving_Border_yn78lv.png",
//     // "https://assets.aceternity.com/multi-step-loader.png",
//     // "https://assets.aceternity.com/vortex.png",
//     // "https://assets.aceternity.com/wobble-card.png",
//     // "https://assets.aceternity.com/world-map.webp",
//   ];
//   return (
//     <div className="mx-auto my-10 max-w-7xl rounded-3xl bg-gray-950/5 p-2 ring-1 ring-neutral-700/10 dark:bg-neutral-800">
//       <ThreeDMarquee images={images} />
//     </div>
//   );
// }
// components/HeroMarquee.jsx
"use client";
import { motion } from "framer-motion";

const HeroMarquee = () => {
  const words = [
    "AI Innovation",
    "Creative Freedom",
    "Next-Gen Ideas",
    "Bold Design",
    "Seamless Experience",
    "Smart Automation",
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#050505] to-[#0f0f0f] py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]"></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
          The Future Starts <span className="text-[#6A00FF]">Here</span>
        </h1>
        <p className="text-gray-400 max-w-xl text-lg mb-10">
          Explore a universe of innovation powered by AI and creativity.
        </p>

        {/* Marquee Section */}
        <div className="relative w-full overflow-hidden py-4">
          <motion.div
            className="flex whitespace-nowrap text-2xl md:text-3xl font-semibold"
            animate={{
              x: ["0%", "-100%"],
            }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 20,
            }}
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-12 px-8 text-white">
                {words.map((word, idx) => (
                  <span
                    key={idx}
                    className="uppercase tracking-wider hover:text-[#6A00FF] transition-all duration-300"
                  >
                    {word}
                  </span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Glow gradient bottom border */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#6A00FF] to-transparent opacity-50"></div>
    </section>
  );
};

export default HeroMarquee;
