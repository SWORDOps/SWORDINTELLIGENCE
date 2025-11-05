'use client';

import Link from 'next/link';
import { Shield, Mail, FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-accent" />
              <span className="font-mono text-lg font-bold">SWORD{'//'}INTEL</span>
            </div>
            <p className="text-sm text-muted">
              Lawful, effective intelligence and response for Web3 and cyber threats.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services/intelligence" className="text-muted hover:text-accent transition-colors">
                  Intelligence
                </Link>
              </li>
              <li>
                <Link href="/services/response" className="text-muted hover:text-accent transition-colors">
                  Response
                </Link>
              </li>
              <li>
                <Link href="/services/resilience" className="text-muted hover:text-accent transition-colors">
                  Resilience
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/methods" className="text-muted hover:text-accent transition-colors">
                  Methods & Compliance
                </Link>
              </li>
              <li>
                <Link href="/insights" className="text-muted hover:text-accent transition-colors">
                  Insights
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Legal & Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted hover:text-accent transition-colors flex items-center space-x-1">
                  <FileText className="w-3 h-3" />
                  <span>Privacy Notice</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted hover:text-accent transition-colors flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>Secure Contact</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted">
              © {new Date().getFullYear()} SWORD Intelligence. Independent private firm.
            </p>
            <p className="text-xs text-muted max-w-md text-center md:text-right">
              <em>&quot;.air.force&quot; is a personal moniker. SWORD Intelligence is not affiliated with the U.S. Air Force or any government entity.</em>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
