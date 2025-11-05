'use client';

import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  title: string;
  description: string;
  outcome: string;
  icon: LucideIcon;
  href: string;
  features?: string[];
}

export function ServiceCard({ title, description, outcome, icon: Icon, href, features }: ServiceCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative p-8 rounded-lg border border-border bg-surface",
        "hover:border-accent transition-all duration-300",
        "hover:shadow-lg hover:shadow-accent/10"
      )}
    >
      {/* Icon */}
      <div className="mb-6">
        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
          <Icon className="w-6 h-6 text-accent" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted mb-4 leading-relaxed">
        {description}
      </p>

      {/* Outcome */}
      <div className="mb-6 p-4 rounded border border-border bg-background/50">
        <span className="text-xs uppercase tracking-wider text-muted block mb-2">Outcome</span>
        <p className="text-sm font-medium">{outcome}</p>
      </div>

      {/* Features */}
      {features && features.length > 0 && (
        <ul className="space-y-2 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start space-x-2 text-sm text-muted">
              <span className="text-accent mt-1">→</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Arrow Indicator */}
      <div className="flex items-center text-accent font-medium text-sm group-hover:translate-x-2 transition-transform">
        <span>Learn more</span>
        <ArrowRight className="ml-2 w-4 h-4" />
      </div>
    </Link>
  );
}
