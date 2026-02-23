import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BookMarked, BrainCircuit, LibrarySquare, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                The future of reading is here
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                Curate your mind with <span className="text-primary italic">Nexus</span>.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Experience a library management system designed for the modern reader. Powered by AI, wrapped in elegance, built for discovery.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Button size="lg" className="rounded-full h-14 px-8 text-base bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20" asChild>
                    <Link href="/catalog">
                      Browse Catalog <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" className="rounded-full h-14 px-8 text-base bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20" onClick={() => window.location.href = '/api/login'}>
                      Join the Library
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base border-border hover:bg-muted" asChild>
                      <Link href="/catalog">Explore Catalog</Link>
                    </Button>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl opacity-50"></div>
              {/* elegant library reading room aesthetic */}
              <img 
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop" 
                alt="Elegant library room" 
                className="relative rounded-3xl object-cover h-[600px] w-full shadow-2xl ring-1 ring-border/50 book-shadow"
              />
              
              {/* Floating glass card */}
              <div className="absolute -bottom-8 -left-8 glass-panel p-6 rounded-2xl max-w-xs animate-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg">AI Summaries</h4>
                    <p className="text-xs text-muted-foreground">Powered by Kimi K2</p>
                  </div>
                </div>
                <p className="text-sm text-foreground/80">Get instant insights and comprehensive breakdowns of any book in our catalog before you commit to reading.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Elevating the Library Experience</h2>
            <p className="text-muted-foreground">Everything you need to manage your reading journey, thoughtfully designed without the clutter.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "Semantic Discovery", desc: "Search by feeling, plot, or vague memories. Our AI understands what you're looking for." },
              { icon: BookMarked, title: "Seamless Tracking", desc: "Manage your active loans, upcoming due dates, and hold positions from a beautiful dashboard." },
              { icon: LibrarySquare, title: "Vast Collection", desc: "Access thousands of physical and digital volumes with real-time availability status." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
