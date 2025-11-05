'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme-provider';
import { ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  const { theme } = useTheme();

  return (
    <section className={`relative ${theme === 'ops' ? 'grid-effect' : ''} min-h-[85vh] flex items-center`}>
      {theme === 'ops' && (
        <div className="scanline absolute inset-0 pointer-events-none" />
      )}

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Mission Statement */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-border bg-surface/50 backdrop-blur-sm">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-mono text-muted">TACTICAL INTELLIGENCE // WEB3 & CYBER</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Adversaries don&apos;t play fair.{' '}
            <span className="text-accent">We do what&apos;s lawful</span>
            —and effective.
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted max-w-3xl mx-auto">
            SWORD Intelligence helps funds, founders, and enterprises prevent loss,
            hunt threat actors, and respond fast across Web3 and traditional infrastructure.
          </p>

          {/* Who We Protect Bar */}
          <div className="pt-8">
            <p className="text-sm uppercase tracking-wider text-muted mb-4">Who We Protect</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-mono">
              {['UHNWIs', 'Funds', 'Exchanges', 'Enterprises', 'Government'].map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 rounded border border-border bg-surface hover:border-accent transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button asChild size="lg">
              <Link href="/contact">
                Book Secure Briefing
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/services">
                Explore Capabilities
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-12 flex flex-wrap justify-center gap-8 text-sm text-muted">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>ICD-203 Standards</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Chain-of-Custody</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Lawful Methodologies</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
