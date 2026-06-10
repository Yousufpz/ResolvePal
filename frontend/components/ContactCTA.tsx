'use client';

export default function ContactCTA() {
  return (
    <section className="py-20 px-6 bg-bg-deep">
      <div className="max-w-4xl mx-auto">
        <div className="bg-bg-elevated rounded-xl p-10 border-l-4 border-gold-primary">
          <h2 className="font-display text-2xl font-bold mb-6 text-gold-primary">
            Enterprise Integration &amp; Local Deployment
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-text-secondary mb-4">
              Interested in adapting this multi-agent architecture for your business?
              With over 2.5 years of dedicated engineering experience in backend
              development and performance optimization, I can help you implement
              this securely.
            </p>
            <p className="text-text-secondary mb-6">
              Contact me, Mohd Yousuf Parvez, for utilizing this system in
              production or setting up a private, localized LLM environment on
              your own hardware.
            </p>
          </div>
          <a
            href="mailto:contact@resolvepal.com"
            className="inline-block px-8 py-3 bg-gold-primary text-bg-deep font-semibold rounded-lg hover:bg-gold-primary/90 transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </section>
  );
}