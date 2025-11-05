'use client';

import { AnimatedCounter } from './ui/animated-counter';
import { Shield, Target, Globe, Zap } from 'lucide-react';

interface Stat {
  icon: React.ElementType;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  decimals?: number;
}

export function StatsShowcase() {
  const stats: Stat[] = [
    {
      icon: Shield,
      value: 18,
      suffix: 'M',
      prefix: '$',
      label: 'Assets Recovered',
      decimals: 0,
    },
    {
      icon: Target,
      value: 47,
      suffix: '+',
      label: 'Threat Actors Attributed',
      decimals: 0,
    },
    {
      icon: Globe,
      value: 24,
      label: 'Jurisdictions',
      decimals: 0,
    },
    {
      icon: Zap,
      value: 72,
      label: 'Response Time (hrs)',
      decimals: 0,
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Operational Track Record
            </h2>
            <p className="text-muted text-lg">
              Results from anonymized engagements across Web3 and cyber domains
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative group"
              >
                {/* Card */}
                <div className="p-6 rounded-lg border border-border bg-surface hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  {/* Icon */}
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <stat.icon className="w-6 h-6 text-accent" />
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-center mb-2">
                    <AnimatedCounter
                      end={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      decimals={stat.decimals}
                      className="text-3xl md:text-4xl font-bold font-mono text-accent"
                    />
                  </div>

                  {/* Label */}
                  <p className="text-sm text-muted text-center">
                    {stat.label}
                  </p>

                  {/* Accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted max-w-2xl mx-auto">
              Statistics represent sanitized data from completed engagements. All figures are
              anonymized and rounded for operational security. Actual capabilities exceed
              publicly disclosed metrics.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
