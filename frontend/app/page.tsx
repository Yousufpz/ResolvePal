import Hero from '@/components/Hero';
import TechMarquee from '@/components/TechMarquee';
import ArchitectureDiagram from '@/components/ArchitectureDiagram';
import DeploymentModes from '@/components/DeploymentModes';
import ContactCTA from '@/components/ContactCTA';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-deep">
      <Hero />
      <TechMarquee />
      <ArchitectureDiagram />
      <DeploymentModes />
      <ContactCTA />
    </main>
  );
}