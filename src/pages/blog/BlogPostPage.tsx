import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  Dumbbell
} from 'lucide-react';
import { getArticleBySlug, getRelatedArticles } from '@/data/blogArticles';
import { SEOHead } from '@/components/common/SEOHead';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const article = slug ? getArticleBySlug(slug) : undefined;
  const related = slug ? getRelatedArticles(slug, 3) : [];

  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!article) {
    return (
      <div className="min-h-screen bg-gym-black text-gym-primary flex flex-col items-center justify-center p-4">
        <SEOHead
          title="Protocol Not Found"
          description="The requested scientific article does not exist or has been relocated."
          noindex={true}
        />
        <BookOpen className="w-12 h-12 text-gym-lime mb-4" />
        <h1 className="font-heading text-3xl font-black uppercase tracking-wider mb-2">Protocol Not Found</h1>
        <p className="text-xs text-gym-secondary mb-6">The requested scientific article does not exist or has been relocated.</p>
        <Link
          to="/blog"
          className="px-6 py-2.5 bg-gym-lime text-gym-black font-heading font-black uppercase text-xs tracking-wider rounded hover:bg-gym-lime-hover transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Articles Archive</span>
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <div className="bg-gym-black text-gym-primary font-sans selection:bg-gym-lime selection:text-gym-black min-h-screen flex flex-col">
      <SEOHead
        title={article.title}
        description={article.summary}
        canonicalUrl={`https://profitgymclub.com/blog/${article.slug}`}
        ogImage={article.image}
        ogType="article"
      />
      {/* ================= STICKY TOP NAVIGATION ================= */}
      <header className="sticky top-0 z-50 bg-gym-surface/90 backdrop-blur-md border-b border-gym-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/blog" className="text-xs uppercase font-heading font-bold tracking-wider text-gym-secondary hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-gym-lime" />
            <span>All Articles</span>
          </Link>

          <Link to="/" className="flex items-center gap-1 font-heading text-xl font-black tracking-wider text-gym-primary">
            <span>PRO</span><span className="text-gym-lime">FIT</span>
          </Link>

          <button
            onClick={handleShare}
            className="text-xs text-gym-secondary hover:text-gym-lime transition-colors flex items-center gap-1.5 font-heading uppercase font-bold"
            title="Share this protocol"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      {/* ================= ARTICLE HEADER ================= */}
      <article className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-gym-lime text-gym-black font-heading font-black uppercase text-[11px] tracking-wider rounded">
            {article.category}
          </span>
          <span className="text-xs text-gym-muted font-mono flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gym-secondary" />
            {article.date}
          </span>
          <span className="text-xs text-gym-muted font-mono flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gym-lime" />
            {article.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl sm:text-5xl font-black uppercase tracking-wide text-gym-primary mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Summary Lead */}
        <p className="text-sm sm:text-base text-gym-secondary leading-relaxed border-l-2 border-gym-lime pl-4 mb-8 italic">
          {article.summary}
        </p>

        {/* Author Card */}
        <div className="flex items-center gap-4 py-4 px-5 bg-gym-surface border border-gym-border rounded mb-10">
          <img
            src={article.author.avatar}
            alt={article.author.name}
            width="48"
            height="48"
            loading="lazy"
            decoding="async"
            className="w-12 h-12 rounded-full object-cover border border-gym-border"
          />
          <div>
            <div className="font-heading font-black text-sm uppercase text-gym-primary tracking-wide">
              {article.author.name}
            </div>
            <div className="text-xs text-gym-secondary">
              {article.author.role}
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full h-72 sm:h-[420px] rounded-sm overflow-hidden mb-12 border border-gym-border shadow-card">
          <img
            src={article.image}
            alt={article.title}
            width="1200"
            height="630"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>

        {/* ================= GOOGLE ADSENSE PLACEHOLDER (TOP) ================= */}
        <div className="my-8 p-4 bg-gym-surface/30 border border-gym-border/60 rounded text-center min-h-[90px] flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-mono tracking-widest text-gym-muted mb-1">Advertisement</span>
          <div className="adsense-slot-top w-full flex items-center justify-center text-xs text-gym-muted/60">
            {/* Auto-injected by Google AdSense Script */}
            <span>PROFIT Partner Network</span>
          </div>
        </div>

        {/* ================= ARTICLE BODY SECTIONS ================= */}
        <div className="space-y-12 text-gym-secondary leading-relaxed text-sm sm:text-base">
          {article.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-wider text-gym-primary pt-4 border-t border-gym-border/40">
                {section.heading}
              </h2>

              <p className="text-gym-secondary leading-relaxed">
                {section.content}
              </p>

              {section.bullets && section.bullets.length > 0 && (
                <ul className="space-y-2.5 my-4 bg-gym-surface/60 border border-gym-border p-5 rounded-sm">
                  {section.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gym-primary">
                      <CheckCircle2 className="w-4 h-4 text-gym-lime shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.callout && (
                <div className="my-6 p-5 bg-gym-lime/5 border-l-4 border-gym-lime rounded-r text-xs sm:text-sm text-gym-primary font-medium">
                  {section.callout}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gym-border flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase font-heading font-bold text-gym-muted mr-2">Topics:</span>
          {article.tags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="px-3 py-1 bg-gym-surface text-gym-secondary text-xs rounded border border-gym-border font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* ================= GOOGLE ADSENSE PLACEHOLDER (BOTTOM) ================= */}
        <div className="my-10 p-6 bg-gym-surface/30 border border-gym-border/60 rounded text-center min-h-[120px] flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-mono tracking-widest text-gym-muted mb-1">Sponsored Recommendation</span>
          <div className="adsense-slot-bottom w-full flex items-center justify-center text-xs text-gym-muted/60">
            {/* Auto-injected by Google AdSense Script */}
            <span>PROFIT High Performance Network</span>
          </div>
        </div>

        {/* CTA BANNER */}
        <div className="my-12 p-8 bg-gradient-to-r from-gym-surface to-gym-black border border-gym-lime/40 rounded shadow-lime-glow flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-heading font-black uppercase tracking-widest text-gym-lime block mb-1">
              PUT THIS PROTOCOL INTO PRACTICE
            </span>
            <h3 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
              TRAIN AT PROFIT ATHLETIC CLUB
            </h3>
            <p className="text-xs text-gym-secondary mt-1 max-w-md">
              Book a complimentary 1-day pass. Experience Eleiko calibrated equipment, biomechanics coaching, and turnstile access.
            </p>
          </div>
          <Link
            to="/register"
            className="px-6 py-3 bg-gym-lime text-gym-black font-heading font-black uppercase text-xs tracking-wider rounded hover:bg-gym-lime-hover shadow-lime-glow transition-all shrink-0 flex items-center gap-2"
          >
            <span>Book Free Trial Pass</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ================= RELATED ARTICLES ================= */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gym-border">
            <h3 className="font-heading text-xl font-black uppercase tracking-wider text-gym-primary mb-6">
              RELATED SCIENTIFIC PROTOCOLS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="group bg-gym-surface border border-gym-border rounded overflow-hidden hover:border-gym-lime/60 transition-all flex flex-col justify-between"
                >
                  <div className="h-32 overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      width="400"
                      height="225"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="font-heading text-sm font-black uppercase text-gym-primary group-hover:text-gym-lime transition-colors line-clamp-2 mb-2">
                      {rel.title}
                    </h4>
                    <span className="text-[10px] text-gym-muted font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gym-lime" />
                      {rel.readTime}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gym-surface border-t border-gym-border py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gym-muted">
          <div>&copy; 2026 PROFIT Training Club LLC.</div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-gym-lime transition-colors">Privacy Policy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-gym-lime transition-colors">Terms of Service</Link>
            <span>&bull;</span>
            <Link to="/blog" className="hover:text-gym-lime transition-colors">All Protocols</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
