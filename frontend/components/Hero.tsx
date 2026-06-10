'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with hero image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.webp"
          alt="Data orchestration network background"
          fill
          priority
          className="object-cover opacity-40 mix-blend-luminosity"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-bg-deep/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <p className="font-mono text-xs uppercase tracking-wider text-gold-primary mb-6">
          MULTI-AGENT CUSTOMER SUPPORT · SUPERVISOR PATTERN
        </p>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-7xl font-bold text-text-primary tracking-tight mb-6">
          <span className="block">Route Every Ticket.</span>
          <span className="block">Resolve With Precision.</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
          Resolve Pal orchestrates complex support requests through an intelligent
          supervisor agent that triages, delegates, and closes tickets — autonomously.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/dashboard"
            className="px-8 py-3 bg-gold-primary text-bg-deep font-semibold rounded-lg hover:bg-gold-primary/90 transition-colors"
          >
            Get Started — API Mode
          </a>
          <a
            href="#architecture"
            className="px-8 py-3 border border-gold-primary/50 text-gold-primary font-medium rounded-lg hover:bg-gold-primary/10 transition-colors"
          >
            View Architecture ↓
          </a>
        </div>
      </div>
    </section>
  );
}