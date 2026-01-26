import { Button } from "@/components/ui/button";
import { CodeParticles } from "@/features/auth/effects/CodeParticles";
import { ThemeSwitcher } from "@/provider/ThemeSwitcher";
import { ArrowRight, Code2, Shield, Sparkles, Zap } from "lucide-react";
import Link from "next/link";


export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-background dark:from-brand-muted/20" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[100px] animate-float" />
        <div
          className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-primary/5 dark:bg-brand/10 rounded-full blur-[120px] animate-float"
          style={{ animationDelay: '-2s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-accent/10 dark:bg-accent/20 rounded-full blur-[80px] animate-float"
          style={{ animationDelay: '-4s' }}
        />

        {/* Code particles */}
        <CodeParticles />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_70%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full p-6 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CodeRabbit</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-8 animate-fade-in backdrop-blur-sm"
            style={{ animationDelay: '0.1s' }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Code Intelligence</span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-bold text-foreground text-center mb-6 leading-tight animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            Ship Better Code,
            <br />
            <span className="text-primary relative">
              Faster.
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-primary/30"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,6 Q50,0 100,6 T200,6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-xl text-muted-foreground text-center max-w-xl mb-10 animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            Get intelligent, context-aware feedback on every pull request.
            Catch bugs, security issues, and code smells before they ship.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            <Link href="/login">
              <Button
                size="lg"
                className="h-14 px-8 text-base font-medium gap-2 group shadow-lg shadow-primary/25 animate-pulse-glow"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base font-medium border-border hover:bg-secondary backdrop-blur-sm"
            >
              See it in action
            </Button>
          </div>

          {/* Trust badges */}
          <div
            className="flex items-center gap-8 mt-16 animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm">Reviews in seconds</span>
            </div>
          </div>
        </main>

        {/* Footer gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

