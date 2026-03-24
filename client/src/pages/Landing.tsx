import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookMarked, BrainCircuit, LibrarySquare, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const heroBooks = [
  {
    title: "The Great Gatsby",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    spine: "hsl(25, 35%, 32%)",
  },
  {
    title: "1984",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop",
    spine: "hsl(220, 30%, 35%)",
  },
  {
    title: "To Kill a Mockingbird",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop",
    spine: "hsl(145, 25%, 28%)",
  },
];

function HeroBook({ book, delay, className, style }: {
  book: typeof heroBooks[0];
  delay: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -30 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.23, 1, 0.32, 1] }}
      className={`book-3d-hero ${className || ''}`}
      style={style}
    >
      <div className="book-3d-inner" style={{ animationDelay: `${delay * 2}s` }}>
        <div className="book-3d-spine" style={{ background: book.spine }} />
        <div className="book-3d-pages" />
        <div className="book-3d-bottom" />
        <div className="book-3d-cover">
          <img
            src={book.cover}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32 lg:pb-40">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/8 via-background to-background" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8 gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                AI-powered library experience
              </div>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.06] text-balance">
                Curate your mind with{' '}
                <span className="text-primary italic">Nexus</span>.
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg text-pretty">
                A library management system designed for the modern reader.
                Powered by AI, wrapped in elegance, built for discovery.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Button size="lg" className="rounded-full h-14 px-8 text-base bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30" asChild>
                    <Link href="/catalog">
                      Browse Catalog <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" className="rounded-full h-14 px-8 text-base bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30" onClick={() => window.location.href = '/auth/signup'}>
                      Join the Library
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base border-border hover:bg-muted" asChild>
                      <Link href="/catalog">Explore Catalog</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Stats row */}
              <div className="flex gap-10 mt-12 pt-8 border-t border-border/50">
                {[
                  { value: '10K+', label: 'Volumes' },
                  { value: 'AI', label: 'Summaries' },
                  { value: '24/7', label: 'Access' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-serif text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right - 3D Floating Books */}
            <div className="relative hidden lg:flex items-center justify-center min-h-[550px]">
              {/* Ambient glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 to-secondary/10 rounded-full blur-[100px] opacity-40" />

              {/* Stack of 3D books */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Back book */}
                <HeroBook
                  book={heroBooks[2]}
                  delay={0.6}
                  className="absolute"
                  style={{ top: '15%', right: '5%', width: '200px', height: '300px' }}
                />
                {/* Middle book */}
                <HeroBook
                  book={heroBooks[1]}
                  delay={0.4}
                  className="absolute"
                  style={{ top: '30%', right: '25%', width: '220px', height: '330px' }}
                />
                {/* Front book (largest) */}
                <HeroBook
                  book={heroBooks[0]}
                  delay={0.2}
                  className="absolute"
                  style={{ top: '10%', left: '10%', width: '250px', height: '375px' }}
                />
              </div>

              {/* Floating glass card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.9 }}
                className="absolute -bottom-4 -left-4 glass-panel p-5 rounded-2xl max-w-[260px] z-20"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base">AI Summaries</h4>
                    <p className="text-[11px] text-muted-foreground">Powered by Groq</p>
                  </div>
                </div>
                <p className="text-xs text-foreground/75 leading-relaxed">Get instant insights and breakdowns of any book before you commit.</p>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/20 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.15em] mb-3">Features</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-balance">
                Elevating the Library Experience
              </h2>
              <p className="text-muted-foreground text-pretty">
                Everything you need to manage your reading journey, thoughtfully designed without the clutter.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Search,
                title: "Semantic Discovery",
                desc: "Search by feeling, plot, or vague memories. Our AI understands what you're looking for.",
                gradient: "from-primary/8 to-transparent",
              },
              {
                icon: BookMarked,
                title: "Seamless Tracking",
                desc: "Manage your active loans, upcoming due dates, and hold positions from a beautiful dashboard.",
                gradient: "from-secondary/8 to-transparent",
              },
              {
                icon: LibrarySquare,
                title: "Vast Collection",
                desc: "Access thousands of physical and digital volumes with real-time availability status.",
                gradient: "from-accent/30 to-transparent",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className={`relative bg-card p-8 rounded-3xl border border-border/40 shadow-sm hover:shadow-lg transition-all duration-500 hover:border-primary/15 hover:-translate-y-1 overflow-hidden group`}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-primary/8 flex items-center justify-center text-primary mb-6 transition-transform duration-500 group-hover:scale-110">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-pretty">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-balance">
              Ready to discover your next great read?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty">
              Join thousands of readers who use Nexus to manage their library experience. Start browsing the catalog today.
            </p>
            <Button size="lg" className="rounded-full h-14 px-10 text-base bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20" asChild>
              <Link href="/catalog">
                Explore the Collection <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </AppLayout>
  );
}
