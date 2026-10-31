import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Dumbbell, 
  Flame, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { BLOG_ARTICLES, BLOG_CATEGORIES, BlogArticle } from '@/data/blogArticles';
import { SEOHead } from '@/components/common/SEOHead';

export const BlogListPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter(article => {
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredArticle: BlogArticle = BLOG_ARTICLES[0];

  return (
    <div className="bg-gym-black text-gym-primary font-sans selection:bg-gym-lime selection:text-gym-black min-h-screen flex flex-col">
      <SEOHead
        title="Scientific Protocols & Strength Training Library"
        description="Explore evidence-based exercise science, hypertrophy programming, nutrition blueprints, and recovery protocols curated by PROFIT coaches."
        canonicalUrl="https://profitgymclub.com/blog"
      />
      {/* ================= TOP NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-gym-surface/90 backdrop-blur-md border-b border-gym-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex flex-col group">
            <span className="font-heading text-3xl font-black tracking-wider text-gym-primary group-hover:text-white transition-colors">
              PRO<span className="text-gym-lime">FIT</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gym-secondary font-semibold -mt-1">
              ATHLETIC SCIENCE &bull; KNOWLEDGE BASE
            </span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6 text-xs uppercase font-heading font-bold tracking-wider">
            <Link to="/" className="text-gym-secondary hover:text-white transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5 text-gym-lime" />
              <span>Back To Club</span>
            </Link>
            <Link to="/register" className="px-4 py-2 bg-gym-lime text-gym-black font-black uppercase text-xs tracking-wider rounded-sm hover:bg-gym-lime-hover shadow-lime-glow transition-all">
              Apply For Pass
            </Link>
          </nav>
        </div>
      </header>

      {/* ================= HERO BANNER ================= */}
      <section className="relative py-16 sm:py-20 bg-gym-surface/40 border-b border-gym-border overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gym-lime/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gym-black border border-gym-border mb-4">
            <Sparkles className="w-3.5 h-3.5 text-gym-lime" />
            <span className="text-[11px] font-heading font-bold uppercase tracking-widest text-gym-secondary">
              EVIDENCE-BASED ATHLETIC PREPARATION
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-wider text-gym-primary max-w-3xl mb-4 leading-none">
            PERFORMANCE LAB <span className="text-gym-lime">&amp; ARTICLES</span>
          </h1>

          <p className="text-sm sm:text-base text-gym-secondary max-w-2xl leading-relaxed mb-8">
            Peer-reviewed resistance protocols, clinical nutrition breakdowns, neuromuscular biomechanics, and recovery science engineered by the PROFIT coaching faculty.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl relative">
            <Search className="w-4 h-4 text-gym-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search protocols, 1RM, creatine, squats, hypertrophy..."
              className="w-full pl-11 pr-4 py-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary placeholder:text-gym-muted focus:outline-none focus:border-gym-lime transition-colors"
            />
          </div>
        </div>
      </section>

      {/* ================= CATEGORY FILTER PILLS ================= */}
      <section className="border-b border-gym-border bg-gym-surface/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gym-lime text-gym-black shadow-lime-glow font-black'
                  : 'bg-gym-surface text-gym-secondary border border-gym-border hover:border-gym-lime/50 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Featured Article (When viewing All and no search) */}
        {selectedCategory === 'All' && searchQuery.trim() === '' && (
          <div className="mb-14">
            <span className="text-[11px] font-heading font-black tracking-widest text-gym-lime uppercase mb-3 block">
              FEATURED SCIENTIFIC BLUEPRINT
            </span>
            <Link
              to={`/blog/${featuredArticle.slug}`}
              className="group block bg-gym-surface border border-gym-border rounded overflow-hidden hover:border-gym-lime/60 transition-all shadow-card"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 h-72 sm:h-96 relative overflow-hidden">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    width="800"
                    height="450"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gym-black/80 via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-gym-lime text-gym-black font-heading font-black uppercase text-[10px] tracking-wider rounded">
                      {featuredArticle.category}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-gym-muted mb-3 font-mono">
                      <span>{featuredArticle.date}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gym-lime" />
                        {featuredArticle.readTime}
                      </span>
                    </div>

                    <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-wide text-gym-primary group-hover:text-gym-lime transition-colors mb-3 leading-tight">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-gym-secondary leading-relaxed line-clamp-3 mb-6">
                      {featuredArticle.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gym-border">
                    <div className="flex items-center gap-3">
                      <img
                        src={featuredArticle.author.avatar}
                        alt={featuredArticle.author.name}
                        width="36"
                        height="36"
                        loading="lazy"
                        decoding="async"
                        className="w-9 h-9 rounded-full object-cover border border-gym-border"
                      />
                      <div>
                        <div className="text-xs font-bold text-gym-primary font-heading uppercase">
                          {featuredArticle.author.name}
                        </div>
                        <div className="text-[10px] text-gym-muted">
                          {featuredArticle.author.role}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-heading font-black text-gym-lime uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      <span>Read Protocol</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Article Grid */}
        <div className="mb-8 flex items-center justify-between">
          <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary">
            {selectedCategory === 'All' ? 'ALL ARCHIVED PROTOCOLS' : `${selectedCategory.toUpperCase()} ARTICLES`} ({filteredArticles.length})
          </h3>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-gym-surface/30 border border-gym-border rounded">
            <BookOpen className="w-10 h-10 text-gym-muted mx-auto mb-3" />
            <h4 className="font-heading text-lg font-bold uppercase text-gym-secondary">No protocols match your search</h4>
            <p className="text-xs text-gym-muted mt-1">Try searching for alternative topics like "strength", "squat", or "protein".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                to={`/blog/${article.slug}`}
                className="group bg-gym-surface border border-gym-border rounded overflow-hidden hover:border-gym-lime/50 transition-all flex flex-col justify-between shadow-card hover:-translate-y-1 duration-300"
              >
                <div>
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      width="600"
                      height="350"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 bg-gym-black/90 backdrop-blur-md text-gym-lime font-heading font-bold uppercase text-[10px] tracking-wider rounded border border-gym-lime/30">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[11px] text-gym-muted mb-2 font-mono">
                      <span>{article.date}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gym-lime" />
                        {article.readTime}
                      </span>
                    </div>

                    <h4 className="font-heading text-lg font-black uppercase tracking-wide text-gym-primary group-hover:text-gym-lime transition-colors mb-2 leading-snug line-clamp-2">
                      {article.title}
                    </h4>

                    <p className="text-xs text-gym-secondary line-clamp-3 leading-relaxed mb-4">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-gym-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-gym-muted font-heading uppercase font-semibold">
                    {article.author.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-heading font-bold text-gym-lime uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gym-surface border-t border-gym-border py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gym-muted">
          <div>
            &copy; 2026 PROFIT Training Club LLC. Published for educational & athletic conditioning purposes.
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to="/about" className="hover:text-gym-lime transition-colors">About Us</Link>
            <span>&bull;</span>
            <Link to="/contact" className="hover:text-gym-lime transition-colors">Contact</Link>
            <span>&bull;</span>
            <Link to="/privacy" className="hover:text-gym-lime transition-colors">Privacy Policy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-gym-lime transition-colors">Terms of Service</Link>
            <span>&bull;</span>
            <Link to="/" className="hover:text-gym-lime transition-colors">Club Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
