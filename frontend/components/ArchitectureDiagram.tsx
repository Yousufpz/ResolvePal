'use client';

import { useEffect, useRef, useState } from 'react';

interface ArchitectureDiagramProps {
  onAnimationComplete?: () => void;
}

export default function ArchitectureDiagram({ onAnimationComplete }: ArchitectureDiagramProps) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Animate stages sequentially
            const timer1 = setTimeout(() => setAnimationStage(1), 150);
            const timer2 = setTimeout(() => setAnimationStage(2), 300);
            const timer3 = setTimeout(() => setAnimationStage(3), 450);
            const timer4 = setTimeout(() => {
              setAnimationStage(4);
              onAnimationComplete?.();
            }, 600);
            return () => {
              clearTimeout(timer1);
              clearTimeout(timer2);
              clearTimeout(timer3);
              clearTimeout(timer4);
            };
          }
        });
      },
      { threshold: 0.3 }
    );

    if (diagramRef.current) {
      observer.observe(diagramRef.current);
    }

    return () => observer.disconnect();
  }, [onAnimationComplete]);

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <section id="architecture" className="py-20 px-6 bg-bg-deep">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-16">
          How It Works
        </h2>

        <div
          ref={diagramRef}
          className="relative bg-bg-surface rounded-xl p-8 overflow-hidden"
        >
          <div className="flex flex-col items-center space-y-8">
            {/* User Ticket */}
            <div className="text-center">
              <span className="font-mono text-xs text-text-secondary mb-2 block">
                USER_TICKET
              </span>
              <div className="w-3 h-3 border-l-2 border-b-2 border-gold-primary/50 mb-2" />
            </div>

            {/* Supervisor Node */}
            <div className="relative w-full max-w-md">
              <div
                className={`
                  relative bg-bg-elevated rounded-lg p-6 border transition-all duration-500
                  ${isVisible ? 'border-gold-primary/50' : 'border-gold-primary/0'}
                `}
              >
                <div className="font-mono text-xs text-gold-primary/60 mb-1">
                  SupervisorAgent.java
                </div>
                <div className="text-sm font-medium mb-2">
                  Supervisor Agent
                </div>
                <p className="text-xs text-text-secondary">
                  &quot;Billing? Technical? Both?&quot;
                </p>
              </div>

              {/* Routing pulse animation */}
              {isVisible && !prefersReducedMotion && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <div className="w-3 h-3 bg-gold-primary rounded-full animate-pulse-gold" />
                </div>
              )}
            </div>

            {/* Routing arrows */}
            {animationStage >= 1 && (
              <div className="flex items-center space-x-16">
                <div className="w-16 h-0.5 bg-gold-primary/30" />
                <div className="w-3 h-3 border-t-2 border-r-2 border-gold-primary/50" />
              </div>
            )}

            {/* Branch nodes */}
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
              {/* Billing Agent */}
              <div
                className={`
                  flex-1 bg-bg-elevated rounded-lg p-6 border transition-all duration-500
                  ${animationStage >= 2 ? 'border-gold-primary/50' : 'border-gold-primary/0'}
                `}
              >
                <div className="font-mono text-xs text-gold-primary/60 mb-1">
                  BillingAgent.java
                </div>
                <div className="text-sm font-medium mb-3">Billing Agent</div>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>· Check payment status</li>
                  <li>· Issue refunds (mock)</li>
                </ul>
              </div>

              {/* Technical Agent */}
              <div
                className={`
                  flex-1 bg-bg-elevated rounded-lg p-6 border transition-all duration-500
                  ${animationStage >= 2 ? 'border-gold-primary/50' : 'border-gold-primary/0'}
                `}
              >
                <div className="font-mono text-xs text-gold-primary/60 mb-1">
                  TechnicalAgent.java
                </div>
                <div className="text-sm font-medium mb-3">Technical Agent</div>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>· Parse error logs</li>
                  <li>· Create Jira tickets</li>
                </ul>
              </div>
            </div>

            {/* Concluding arrow */}
            {animationStage >= 3 && (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-0.5 bg-gold-primary/30" />
                <div className="w-3 h-3 border-t-2 border-r-2 border-gold-primary/50" />
                <div className="w-12 h-0.5 bg-gold-primary/30" />
              </div>
            )}

            {/* Final response */}
            {animationStage >= 4 && (
              <div className="bg-bg-elevated rounded-lg px-6 py-3 border border-gold-primary/30">
                <span className="font-mono text-xs text-text-secondary">
                  UNIFIED_RESPONSE → USER
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}