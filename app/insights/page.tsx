import { TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Insights | SWORD Intelligence',
  description: 'Intelligence reports, case studies, and operational guidance.',
};

export default function InsightsPage() {
  // In production, these would be fetched from MDX files or a CMS
  const posts = [
    {
      slug: 'fentanyl-crypto-financing',
      title: 'Fentanyl Supply Chains: Tracking Crypto-Funded Precursor Networks',
      excerpt: 'How we traced $4.2M in cryptocurrency payments from U.S. buyers to Chinese precursor chemical suppliers, leading to a coordinated DEA operation.',
      date: '2024-11-01',
      category: 'Counter-Narcotics',
      readTime: '8 min read',
    },
    {
      slug: 'defi-exploit-attribution',
      title: 'Post-Mortem: $18M DeFi Exploit Attribution & Recovery',
      excerpt: 'Breaking down the Raccoon Protocol exploit: how we attributed the attack to a known APT group and recovered 62% of stolen funds.',
      date: '2024-10-15',
      category: 'Web3 Intelligence',
      readTime: '12 min read',
    },
    {
      slug: 'executive-opsec-2024',
      title: 'Executive OPSEC in 2024: Identity Fragmentation Strategies',
      excerpt: 'A practical guide to protecting C-suite executives and UHNWIs from doxxing, swatting, and targeted cyber operations.',
      date: '2024-09-28',
      category: 'Resilience',
      readTime: '10 min read',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-border bg-surface">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-sm font-mono text-muted">INSIGHTS</span>
            </div>
            <h1 className="text-5xl font-bold">Intelligence Reports & Case Studies</h1>
            <p className="text-xl text-muted">
              Real-world analysis, threat intelligence, and operational guidance from
              anonymized engagements. Learn from our work in the field.
            </p>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="p-8 rounded-lg border border-border bg-surface hover:border-accent transition-colors group"
                >
                  <div className="flex items-center space-x-4 mb-4 text-sm text-muted">
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    </div>
                    <span>{post.readTime}</span>
                  </div>

                  <Link href={`/insights/${post.slug}`}>
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-muted mb-6 leading-relaxed">{post.excerpt}</p>

                  <Link
                    href={`/insights/${post.slug}`}
                    className="inline-flex items-center text-accent font-medium hover:underline"
                  >
                    Read full report
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>

            {/* Coming Soon Notice */}
            <div className="mt-12 p-8 rounded-lg border border-border bg-surface text-center">
              <p className="text-muted">
                More reports published monthly. Subscribe to our secure mailing list for updates.
              </p>
              <Link href="/contact" className="inline-block mt-4 text-accent hover:underline">
                Get Notified →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
