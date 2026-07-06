import { motion, useReducedMotion } from "framer-motion";

import heroJpg from "../../assets/images/hero/oil-rig.jpg";
import heroWebp from "../../assets/images/hero/oil-rig.webp";

/**
 * Login hero background: the oil rig photo with a slow "Ken Burns" zoom.
 * Pure `transform: scale()` — never top/left/width/height — so it stays
 * off the layout/paint path and runs GPU-composited. Disabled entirely
 * under prefers-reduced-motion. A gradient scrim guarantees the login
 * form stays readable regardless of the image's content.
 */
export function HeroBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden bg-brand-950">
      <picture>
        <source srcSet={heroWebp} type="image/webp" />
        <motion.img
          src={heroJpg}
          alt=""
          role="presentation"
          className="h-full w-full object-cover"
          initial={{ scale: 1 }}
          animate={prefersReducedMotion ? { scale: 1 } : { scale: 1.08 }}
          transition={{ duration: 24, ease: "easeOut" }}
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/70 to-brand-950/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-950/80 via-transparent to-transparent" />
    </div>
  );
}
