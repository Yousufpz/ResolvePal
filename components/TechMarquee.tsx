'use client';

export default function TechMarquee() {
  const techStack = [
    'Next.js 14',
    'React',
    'Tailwind CSS',
    'Java 21',
    'Spring Boot',
    'LangChain4j',
    'Claude API',
    'Ollama',
    'IndexedDB',
  ];

  // Duplicate for seamless looping
  const duplicated = [...techStack, ...techStack];

  return (
    <div className="bg-bg-surface py-6 overflow-hidden">
      <div className="flex items-center space-x-8 animate-scroll-x whitespace-nowrap">
        {duplicated.map((tech, index) => (
          <span
            key={`${tech}-${index}`}
            className="font-mono text-sm text-gold-primary/80 px-4"
          >
            {tech}
            {index < duplicated.length - 1 && (
              <span className="text-gold-muted ml-8">·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}