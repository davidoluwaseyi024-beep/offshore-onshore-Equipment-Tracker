import type { ReactNode } from "react";

import { HeroBackground } from "./HeroBackground";

export function AuthLayout({
  tagline,
  heading,
  description,
  children,
}: {
  tagline: string;
  heading: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <HeroBackground />
      <div className="relative z-10 flex w-full flex-col items-center gap-8 md:flex-row md:items-center md:justify-between md:px-16">
        <div className="hidden max-w-md text-white md:block">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent-400">{tagline}</p>
          <h2 className="text-3xl font-bold leading-tight">{heading}</h2>
          <p className="mt-4 text-brand-200">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
