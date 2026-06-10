'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

export default function DeploymentModes() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const modes = [
    {
      title: 'API Mode (Quick Start)',
      tagline: 'Bring your own key',
      features: [
        'Claude (preferred), OpenAI, Grok, Gemini',
        'Ticket history in browser (IndexedDB)',
        'Up in 30 seconds',
      ],
      preferred: true,
    },
    {
      title: 'Local Install (Maximum Security)',
      tagline: 'Zero cloud dependency',
      features: [
        'Ollama — runs on your hardware',
        'Full local inference',
        'Zero-trust enterprise ready',
      ],
      preferred: false,
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 px-6 bg-bg-deep">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
          Deployment Modes
        </h2>
        <p className="text-text-secondary text-center mb-12 max-w-2xl mx-auto">
          Choose the deployment strategy that fits your security and integration needs.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {modes.map((mode, index) => (
            <div
              key={index}
              className={`
                bg-bg-surface rounded-xl p-8 transition-all duration-500
                ${mode.preferred ? 'border-l-4 border-gold-primary' : 'border-l-4 border-gold-muted/30'}
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
              `}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <h3 className="font-display text-xl font-bold mb-2">{mode.title}</h3>
              <p className="text-sm text-text-secondary mb-6">{mode.tagline}</p>
              <ul className="space-y-3">
                {mode.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-status-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}