import { Users, Lightbulb, Target, BookOpen } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const About = () => {
  return (
    <main>
      {/* Hero */}
      <section className="sw-gradient-hero pt-28 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-4">Our Story</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">How a university project became Pakistan's first livestock management platform</p>
        </div>
      </section>

      {/* The Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <AnimatedSection>
            <div className="prose prose-lg max-w-none">
              <p className="text-foreground leading-relaxed mb-4">
                Pakistan's livestock sector is a powerhouse — contributing significantly to the nation's GDP and sustaining millions of rural livelihoods. Yet the farmers at its heart still rely on handwritten ledgers, word-of-mouth deals, and a patchwork of phone calls to manage their operations. No central system existed to digitally track herds, manage farm finances, or connect sellers with buyers in an efficient, transparent way.
              </p>
              <p className="text-foreground leading-relaxed mb-4">
                Saarway was born out of this exact gap. It started as a Web Development semester project at university, supervised by <strong>Rana Muhammad Ajmal</strong>. What began as a classroom exercise quickly revealed itself to be something far more meaningful — a solution that could genuinely reshape how livestock farming works in Pakistan.
              </p>
              <p className="text-foreground leading-relaxed mb-4">
                Founded by <strong>Muhammad Talal Khan</strong>, Saarway set out to answer one powerful question: what if a farmer in Kasur could list his cattle online and a buyer hundreds of kilometres away in Lahore could discover him in seconds?
              </p>
              <p className="text-foreground leading-relaxed">
                The result is Pakistan's first multi-farm livestock ERP and marketplace — a platform where every registered farm receives a complete digital management system, and every buyer gains instant access to verified livestock listings from across the country. From a semester project to a platform with real ambition — this is only the beginning.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center text-foreground mb-10">The Problem</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Manual Records', desc: 'Farmers still rely on handwritten registers and memory to track hundreds of animals' },
              { icon: Target, title: 'No Digital Herd Management', desc: 'No platform exists to track individual animals, health records, and lineage digitally' },
              { icon: Users, title: 'No Online Marketplace', desc: 'Buyers and sellers connect through word of mouth — limiting reach and transparency' },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 150}>
                <div className="bg-card rounded-xl p-6 border border-border text-center">
                  <item.icon className="w-10 h-10 text-destructive mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-foreground mb-6">The Solution</h2>
            <p className="text-lg text-muted-foreground mb-4">Saarway combines a full ERP system for farms — cattle management, health tracking, financials, and selling — with a public marketplace for buyers.</p>
            <p className="text-xl font-semibold text-primary">"One platform. Every farm. Every buyer."</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-3xl">
          <AnimatedSection>
            <blockquote className="text-center">
              <Lightbulb className="w-10 h-10 text-accent mx-auto mb-4" />
              <p className="text-xl md:text-2xl font-medium text-foreground italic">
                "To digitise Pakistan's livestock industry — giving every farm a digital home and every buyer instant access to verified livestock."
              </p>
            </blockquote>
          </AnimatedSection>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center text-foreground mb-10">Team & Supervision</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: 'Muhammad Talal Khan', role: 'Founder & CEO', desc: 'Visionary behind Saarway, turning a semester idea into Pakistan\'s first livestock ERP' },
              { name: 'Rana Muhammad Ajmal', role: 'Project Supervisor', desc: 'Guiding the Web Development semester project that gave birth to Saarway' },
            ].map((person, i) => (
              <AnimatedSection key={person.name} delay={i * 150}>
                <div className="bg-card rounded-xl p-6 border border-border text-center sw-card-hover">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">{person.name}</h3>
                  <p className="text-sm text-primary font-medium mb-2">{person.role}</p>
                  <p className="text-sm text-muted-foreground">{person.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={300}>
            <p className="text-center text-sm text-muted-foreground mt-8">Project Type: Web Development Semester Project</p>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default About;
