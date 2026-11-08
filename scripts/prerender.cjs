const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../dist');
const BASE_HTML_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(BASE_HTML_PATH)) {
  console.error('[Prerender Error] dist/index.html not found! Run "vite build" first.');
  process.exit(1);
}

const baseTemplate = fs.readFileSync(BASE_HTML_PATH, 'utf8');

// Load Blog Articles
const blogTs = fs.readFileSync(path.resolve(__dirname, '../src/data/blogArticles.ts'), 'utf8');
const match = blogTs.match(/export const BLOG_ARTICLES: BlogArticle\[\] = (\[[\s\S]*?\]);\s*export const BLOG_CATEGORIES/);
if (!match) {
  console.error('[Prerender Error] Could not parse BLOG_ARTICLES from blogArticles.ts');
  process.exit(1);
}
const articles = JSON.parse(match[1]);

console.log(`[Prerender] Loaded ${articles.length} scientific articles from blogArticles.ts`);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateHeader(activeLink = '') {
  return `
    <header class="sticky top-0 z-50 bg-gym-surface/90 backdrop-blur-md border-b border-gym-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <a href="/" class="flex flex-col group">
          <span class="font-heading text-3xl font-black tracking-wider text-gym-primary group-hover:text-white transition-colors">
            PRO<span class="text-gym-lime">FIT</span>
          </span>
          <span class="text-[10px] uppercase tracking-widest text-gym-secondary font-semibold -mt-1">
            TRAINING CLUB &bull; FLAGSHIP SANCTUARY
          </span>
        </a>
        <nav class="hidden md:flex items-center gap-7 text-xs uppercase font-heading font-bold tracking-wider text-gym-secondary">
          <a href="/about" class="hover:text-gym-lime transition-colors ${activeLink === 'about' ? 'text-gym-lime' : ''}">About</a>
          <a href="/#programs" class="hover:text-gym-lime transition-colors">Disciplines</a>
          <a href="/#plans" class="hover:text-gym-lime transition-colors">Memberships</a>
          <a href="/#lab" class="hover:text-gym-lime transition-colors">Performance Lab</a>
          <a href="/#trainers" class="hover:text-gym-lime transition-colors">Coaches</a>
          <a href="/blog" class="text-gym-lime hover:text-white transition-colors flex items-center gap-1 font-black ${activeLink === 'blog' ? 'underline' : ''}">Articles & Protocols</a>
          <a href="/contact" class="hover:text-gym-lime transition-colors ${activeLink === 'contact' ? 'text-gym-lime' : ''}">Contact Concierge</a>
        </nav>
        <div class="flex items-center gap-3">
          <a href="/login" class="px-4 py-2 text-gym-secondary hover:text-white text-xs uppercase font-heading font-bold tracking-wider transition-colors">Athlete Login</a>
          <a href="/register" class="px-4 py-2 bg-gym-lime text-gym-black font-heading font-black uppercase text-xs tracking-wider rounded-sm hover:bg-gym-lime-hover shadow-lime-glow transition-all">
            Apply For Membership
          </a>
        </div>
      </div>
    </header>
  `;
}

function generateFooter() {
  return `
    <footer class="bg-gym-black py-16 border-t border-gym-border mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div>
            <a href="/" class="inline-block group mb-3">
              <span class="font-heading text-3xl font-black tracking-wider text-gym-primary">
                PRO<span class="text-gym-lime">FIT</span>
              </span>
              <span class="block text-[10px] uppercase tracking-widest text-gym-secondary font-semibold -mt-1">
                TRAINING CLUB
              </span>
            </a>
            <p class="text-xs text-gym-muted leading-relaxed mt-2">
              A high performance strength sanctuary & athletic club. Strict 300 member cap. Calibrated Eleiko iron.
            </p>
          </div>
          <div>
            <h4 class="font-heading text-xs font-black uppercase tracking-wider text-gym-primary mb-3">FACILITY SANCTUARY</h4>
            <ul class="space-y-2 text-xs text-gym-secondary">
              <li>PROFIT Flagship Athletic Sanctuary 01</li>
              <li>24/7 Biometric QR Access</li>
              <li><a href="https://wa.me/919368593249" target="_blank" rel="noopener noreferrer" class="hover:text-gym-lime">+91 9368593249 (WhatsApp)</a></li>
              <li><a href="mailto:concierge@profitgymclub.com" class="hover:text-gym-lime">concierge@profitgymclub.com</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-heading text-xs font-black uppercase tracking-wider text-gym-primary mb-3">RESEARCH & PROTOCOLS</h4>
            <ul class="space-y-2 text-xs text-gym-secondary">
              <li><a href="/blog/push-pull-legs-hypertrophy-masterclass" class="hover:text-gym-lime">PPL Hypertrophy Split</a></li>
              <li><a href="/blog/creatine-monohydrate-science-dosage-timing" class="hover:text-gym-lime">Creatine Dosage Guide</a></li>
              <li><a href="/blog/best-gym-management-software-india" class="hover:text-gym-lime">Gym Management Software India</a></li>
              <li><a href="/blog/how-to-open-a-gym-in-india-cost-setup" class="hover:text-gym-lime">How to Open a Gym in India</a></li>
              <li><a href="/blog" class="text-gym-lime font-bold">All 21 Scientific Protocols &rarr;</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-heading text-xs font-black uppercase tracking-wider text-gym-primary mb-3">ATHLETE PORTAL</h4>
            <ul class="space-y-2 text-xs text-gym-secondary">
              <li><a href="/login" class="hover:text-gym-lime">Athlete Sign In</a></li>
              <li><a href="/register" class="hover:text-gym-lime">Apply For Membership</a></li>
              <li><a href="/member/attendance" class="hover:text-gym-lime">Turnstile QR Pass</a></li>
              <li><a href="/member/workouts" class="hover:text-gym-lime">Workout Logger</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-heading text-xs font-black uppercase tracking-wider text-gym-primary mb-3">INSTITUTIONAL & LEGAL</h4>
            <ul class="space-y-2 text-xs text-gym-secondary">
              <li><a href="/about" class="hover:text-gym-lime">About Our Sanctuary</a></li>
              <li><a href="/contact" class="hover:text-gym-lime">Contact Concierge</a></li>
              <li><a href="/privacy" class="hover:text-gym-lime">Privacy & AdSense Policy</a></li>
              <li><a href="/terms" class="hover:text-gym-lime">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div class="pt-8 border-t border-gym-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gym-muted">
          <div>&copy; 2026 PROFIT Training Club LLC. All rights reserved. &bull; profitgymclub.com</div>
          <div class="flex items-center gap-4">
            <a href="/about" class="hover:text-gym-lime">About</a>
            <span>&bull;</span>
            <a href="/contact" class="hover:text-gym-lime">Contact</a>
            <span>&bull;</span>
            <a href="/privacy" class="hover:text-gym-lime">Privacy</a>
            <span>&bull;</span>
            <a href="/terms" class="hover:text-gym-lime">Terms</a>
            <span>&bull;</span>
            <a href="/blog" class="hover:text-gym-lime">Protocols</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}

function buildHtmlPage({ title, description, canonicalUrl, ogType = 'website', ogImage, contentHtml, extraHead = '' }) {
  let html = baseTemplate;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);

  // Replace Meta Description
  if (html.includes('<meta name="description"')) {
    html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(description)}"`);
  }

  // Replace Canonical Link
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${canonicalUrl}"`);
  } else {
    html = html.replace('</head>', `    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
  }

  // Open Graph replacements
  if (ogImage) {
    html = html.replace(/<meta property="og:image" content="[^"]*"/g, `<meta property="og:image" content="${ogImage}"`);
    html = html.replace(/<meta name="twitter:image" content="[^"]*"/g, `<meta name="twitter:image" content="${ogImage}"`);
  }
  html = html.replace(/<meta property="og:title" content="[^"]*"/g, `<meta property="og:title" content="${escapeHtml(title)}"`);
  html = html.replace(/<meta property="og:description" content="[^"]*"/g, `<meta property="og:description" content="${escapeHtml(description)}"`);
  html = html.replace(/<meta property="og:type" content="[^"]*"/g, `<meta property="og:type" content="${ogType}"`);

  if (extraHead) {
    html = html.replace('</head>', `    ${extraHead}\n  </head>`);
  }

  // Inject prerendered content into #root
  html = html.replace('<div id="root"></div>', `<div id="root">${contentHtml}</div>`);

  return html;
}

function writeRouteFiles(subPath, htmlContent) {
  // 1. Write as subpath/index.html (e.g. dist/about/index.html)
  const fullSubDir = path.join(DIST_DIR, subPath);
  ensureDir(fullSubDir);
  fs.writeFileSync(path.join(fullSubDir, 'index.html'), htmlContent, 'utf8');

  // 2. Write as subpath.html (e.g. dist/about.html) for Vercel cleanUrls
  const directFilePath = path.join(DIST_DIR, `${subPath}.html`);
  fs.writeFileSync(directFilePath, htmlContent, 'utf8');
}

// ============================================================================
// 1. PRERENDER INDIVIDUAL BLOG ARTICLES (ALL 21 ARTICLES)
// ============================================================================
console.log('\n[Prerender] Generating static HTML for all 21 blog articles...');

articles.forEach((art, index) => {
  const canonicalUrl = `https://profitgymclub.com/blog/${art.slug}`;
  const title = `${art.title} | PROFIT Training Club`;
  const description = art.summary;

  const sectionsHtml = art.sections.map(sec => `
    <section class="space-y-4 my-8">
      <h2 class="font-heading text-2xl sm:text-3xl font-black uppercase tracking-wider text-gym-primary pt-4 border-t border-gym-border/40">
        ${escapeHtml(sec.heading)}
      </h2>
      <p class="text-gym-secondary leading-relaxed text-sm sm:text-base">
        ${escapeHtml(sec.content)}
      </p>
      ${sec.bullets && sec.bullets.length ? `
        <ul class="space-y-2.5 my-4 bg-gym-surface/60 border border-gym-border p-5 rounded-sm">
          ${sec.bullets.map(b => `
            <li class="flex items-start gap-2.5 text-xs sm:text-sm text-gym-primary">
              <span class="text-gym-lime font-bold">&check;</span>
              <span>${escapeHtml(b)}</span>
            </li>
          `).join('')}
        </ul>
      ` : ''}
      ${sec.callout ? `
        <div class="my-6 p-5 bg-gym-lime/5 border-l-4 border-gym-lime rounded-r text-xs sm:text-sm text-gym-primary font-medium">
          ${escapeHtml(sec.callout)}
        </div>
      ` : ''}
    </section>
  `).join('');

  const jsonLd = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${art.title.replace(/"/g, '\\"')}",
      "description": "${art.summary.replace(/"/g, '\\"')}",
      "image": ["${art.image}"],
      "datePublished": "2026-10-24T08:00:00+05:30",
      "dateModified": "2026-11-08T08:00:00+05:30",
      "author": {
        "@type": "Person",
        "name": "${art.author.name.replace(/"/g, '\\"')}",
        "jobTitle": "${art.author.role.replace(/"/g, '\\"')}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "PROFIT Training Club",
        "logo": {
          "@type": "ImageObject",
          "url": "https://profitgymclub.com/weightlifter.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${canonicalUrl}"
      }
    }
    </script>
  `;

  const articleContent = `
    <div class="bg-gym-black text-gym-primary font-sans min-h-screen flex flex-col">
      ${generateHeader('blog')}
      <article class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        <div class="flex flex-wrap items-center gap-3 mb-6">
          <span class="px-3 py-1 bg-gym-lime text-gym-black font-heading font-black uppercase text-[11px] tracking-wider rounded">
            ${escapeHtml(art.category)}
          </span>
          <span class="text-xs text-gym-muted font-mono">${escapeHtml(art.date)}</span>
          <span class="text-xs text-gym-muted font-mono">&bull; ${escapeHtml(art.readTime)}</span>
        </div>
        <h1 class="font-heading text-3xl sm:text-5xl font-black uppercase tracking-wide text-gym-primary mb-6 leading-tight">
          ${escapeHtml(art.title)}
        </h1>
        <p class="text-sm sm:text-base text-gym-secondary leading-relaxed border-l-2 border-gym-lime pl-4 mb-8 italic">
          ${escapeHtml(art.summary)}
        </p>
        <div class="flex items-center gap-4 py-4 px-5 bg-gym-surface border border-gym-border rounded mb-10">
          <img src="${art.author.avatar}" alt="${escapeHtml(art.author.name)}" class="w-12 h-12 rounded-full object-cover border border-gym-border" width="48" height="48" />
          <div>
            <div class="font-heading font-black text-sm uppercase text-gym-primary tracking-wide">${escapeHtml(art.author.name)}</div>
            <div class="text-xs text-gym-secondary">${escapeHtml(art.author.role)}</div>
          </div>
        </div>
        <div class="w-full h-72 sm:h-[420px] rounded-sm overflow-hidden mb-12 border border-gym-border shadow-card">
          <img src="${art.image}" alt="${escapeHtml(art.title)}" class="w-full h-full object-cover" width="1200" height="630" />
        </div>
        <div class="space-y-10 text-gym-secondary leading-relaxed">
          ${sectionsHtml}
        </div>
        <div class="mt-12 pt-8 border-t border-gym-border flex flex-wrap items-center gap-2">
          <span class="text-xs uppercase font-heading font-bold text-gym-muted mr-2">Topics:</span>
          ${art.tags.map(t => `<span class="px-3 py-1 bg-gym-surface text-gym-secondary text-xs rounded border border-gym-border font-mono">#${escapeHtml(t)}</span>`).join(' ')}
        </div>
        <div class="mt-16 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-200 space-y-2">
          <div class="text-yellow-400 font-heading font-black uppercase text-xs sm:text-sm">
            MEDICAL &amp; EXERCISE PHYSIOLOGY DISCLAIMER
          </div>
          <p class="text-xs leading-relaxed text-yellow-200/90">
            The training protocols, biomechanical recommendations, and nutritional dosages presented in this article are authored for educational, athletic, and informational purposes only. They do not constitute personalized medical advice or clinical diagnosis. Always consult with a licensed physician or physical therapist prior to executing maximal compound lifts or altering your nutritional intake.
          </p>
        </div>
      </article>
      ${generateFooter()}
    </div>
  `;

  const finalHtml = buildHtmlPage({
    title,
    description,
    canonicalUrl,
    ogType: 'article',
    ogImage: art.image,
    contentHtml: articleContent,
    extraHead: jsonLd
  });

  writeRouteFiles(`blog/${art.slug}`, finalHtml);
  console.log(`  [${index + 1}/21] Generated static HTML for: /blog/${art.slug}`);
});

// ============================================================================
// 2. PRERENDER BLOG ARCHIVE INDEX (/blog)
// ============================================================================
console.log('\n[Prerender] Generating static HTML for /blog archive index...');
const blogIndexCards = articles.map(art => `
  <a href="/blog/${art.slug}" class="group bg-gym-surface border border-gym-border rounded overflow-hidden hover:border-gym-lime/50 transition-all flex flex-col justify-between shadow-card">
    <div>
      <div class="h-48 relative overflow-hidden">
        <img src="${art.image}" alt="${escapeHtml(art.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" width="600" height="350" loading="lazy" />
        <div class="absolute top-3 left-3">
          <span class="px-2.5 py-0.5 bg-gym-black/90 backdrop-blur-md text-gym-lime font-heading font-bold uppercase text-[10px] tracking-wider rounded border border-gym-lime/30">
            ${escapeHtml(art.category)}
          </span>
        </div>
      </div>
      <div class="p-5">
        <div class="flex items-center gap-2 text-[11px] text-gym-muted mb-2 font-mono">
          <span>${escapeHtml(art.date)}</span>
          <span>&bull;</span>
          <span>${escapeHtml(art.readTime)}</span>
        </div>
        <h3 class="font-heading text-lg font-black uppercase tracking-wide text-gym-primary group-hover:text-gym-lime transition-colors mb-2 leading-snug">
          ${escapeHtml(art.title)}
        </h3>
        <p class="text-xs text-gym-secondary line-clamp-3 leading-relaxed mb-4">
          ${escapeHtml(art.summary)}
        </p>
      </div>
    </div>
    <div class="px-5 pb-5 pt-3 border-t border-gym-border/60 flex items-center justify-between text-xs font-heading font-bold text-gym-lime uppercase">
      <span>Read Scientific Protocol &rarr;</span>
      <span class="text-gym-muted font-mono font-normal">By ${escapeHtml(art.author.name)}</span>
    </div>
  </a>
`).join('');

const blogArchiveContent = `
  <div class="bg-gym-black text-gym-primary font-sans min-h-screen flex flex-col">
    ${generateHeader('blog')}
    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div class="mb-12">
        <span class="text-[11px] font-heading font-bold uppercase tracking-widest text-gym-lime block mb-2">
          EVIDENCE-BASED ATHLETIC PREPARATION
        </span>
        <h1 class="font-heading text-4xl sm:text-6xl font-black uppercase tracking-wider text-gym-primary mb-4">
          SCIENTIFIC PROTOCOLS &amp; KNOWLEDGE BASE
        </h1>
        <p class="text-sm sm:text-base text-gym-secondary max-w-2xl leading-relaxed">
          Explore all 21 peer-reviewed resistance protocols, clinical nutrition blueprints, hypertrophy methods, and gym management guides published by the PROFIT faculty.
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${blogIndexCards}
      </div>
    </main>
    ${generateFooter()}
  </div>
`;

const blogArchiveHtml = buildHtmlPage({
  title: 'Scientific Protocols & Strength Training Library | PROFIT Training Club',
  description: 'Explore all 21 evidence-based exercise science, hypertrophy programming, nutrition blueprints, and gym management guides curated by PROFIT coaches.',
  canonicalUrl: 'https://profitgymclub.com/blog',
  contentHtml: blogArchiveContent
});
writeRouteFiles('blog', blogArchiveHtml);

// ============================================================================
// 3. PRERENDER /about, /contact, /privacy, /terms
// ============================================================================
console.log('[Prerender] Generating static HTML for legal and institutional pages...');

// About
const aboutContent = `
  <div class="bg-gym-black text-gym-primary font-sans min-h-screen flex flex-col">
    ${generateHeader('about')}
    <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full space-y-12">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded bg-gym-surface border border-gym-border mb-4">
          <span class="text-[11px] font-heading font-bold uppercase tracking-wider text-gym-secondary">
            ABOUT OUR SANCTUARY &amp; EDITORIAL BOARD
          </span>
        </div>
        <h1 class="font-heading text-3xl sm:text-5xl font-black uppercase tracking-wider text-gym-primary mb-4">
          WHERE SCIENCE MEETS <span class="text-gym-lime">HUMAN PERFORMANCE.</span>
        </h1>
        <p class="text-base text-gym-secondary leading-relaxed max-w-3xl">
          PROFIT Training Club is an elite private strength &amp; conditioning sanctuary and an authoritative digital publication dedicated to exercise physiology, biomechanical optimization, and evidence-based athletic nutrition.
        </p>
      </div>
      <section class="p-8 bg-gym-surface/60 border border-gym-lime/40 rounded shadow-lime-glow space-y-4">
        <h2 class="font-heading text-2xl font-black uppercase tracking-wide text-gym-primary">
          OUR EDITORIAL GUIDELINES &amp; FACT-CHECKING POLICY
        </h2>
        <p class="text-sm text-gym-secondary leading-relaxed">
          At PROFIT Training Club (profitgymclub.com), our digital publication adheres to rigorous journalistic and scientific publishing standards. Every workout protocol, hypertrophy breakdown, and nutritional guide is vetted against peer-reviewed sports science literature (NSCA, ACSM, ISSN).
        </p>
      </section>
      <section class="space-y-6">
        <h2 class="font-heading text-2xl font-black uppercase tracking-wide text-gym-primary">
          EDITORIAL BOARD &amp; MASTER COACHES
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="p-6 bg-gym-surface border border-gym-border rounded">
            <h3 class="font-heading text-base font-black uppercase text-gym-primary">Dev Baliyan</h3>
            <span class="text-xs text-gym-lime font-mono block mb-2">Founder &amp; Chief Systems Architect</span>
            <p class="text-xs text-gym-muted leading-relaxed">Leads cloud platform engineering, IoT biometric turnstile architecture, and facility automation.</p>
          </div>
          <div class="p-6 bg-gym-surface border border-gym-border rounded">
            <h3 class="font-heading text-base font-black uppercase text-gym-primary">Marcus Drake, CSCS</h3>
            <span class="text-xs text-gym-lime font-mono block mb-2">Head of Strength &amp; Conditioning</span>
            <p class="text-xs text-gym-muted leading-relaxed">Specializes in mechanical tension principles, barbell biomechanics, and periodized volume loading.</p>
          </div>
        </div>
      </section>
      <section class="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-200 space-y-3">
        <div class="text-yellow-400 font-heading font-black uppercase text-sm">
          MANDATORY HEALTH, FITNESS &amp; MEDICAL DISCLAIMER
        </div>
        <p class="text-xs leading-relaxed text-yellow-200/90">
          The training programs, exercise demonstrations, biomechanical critiques, and nutritional protocols published on profitgymclub.com are provided strictly for educational and informational purposes. Consult a licensed physician before executing heavy resistance training.
        </p>
      </section>
    </main>
    ${generateFooter()}
  </div>
`;
writeRouteFiles('about', buildHtmlPage({
  title: 'About Us & Editorial Standards | PROFIT Training Club',
  description: 'Discover PROFIT Training Club: an elite strength sanctuary and evidence-based fitness publication led by CSCS coaches and sports scientists.',
  canonicalUrl: 'https://profitgymclub.com/about',
  contentHtml: aboutContent
}));

// Contact
const contactContent = `
  <div class="bg-gym-black text-gym-primary font-sans min-h-screen flex flex-col">
    ${generateHeader('contact')}
    <main class="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 w-full space-y-12">
      <div>
        <h1 class="font-heading text-3xl sm:text-5xl font-black uppercase tracking-wider text-gym-primary mb-4">
          CONNECT WITH <span class="text-gym-lime">OUR CONCIERGE.</span>
        </h1>
        <p class="text-base text-gym-secondary leading-relaxed max-w-3xl">
          Whether you have questions regarding membership tier allocations, require technical support with the athlete portal, or have an editorial inquiry regarding our published research, our concierge team responds within 24 hours.
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 bg-gym-surface border border-gym-border rounded">
          <h3 class="font-heading text-sm font-black uppercase text-gym-primary mb-2">Official Email</h3>
          <p class="text-xs text-gym-muted"><a href="mailto:concierge@profitgymclub.com" class="text-gym-lime">concierge@profitgymclub.com</a></p>
        </div>
        <div class="p-6 bg-gym-surface border border-gym-border rounded">
          <h3 class="font-heading text-sm font-black uppercase text-gym-primary mb-2">WhatsApp Concierge</h3>
          <p class="text-xs text-gym-muted"><a href="https://wa.me/919368593249" target="_blank" class="text-gym-lime">+91 9368593249</a></p>
        </div>
        <div class="p-6 bg-gym-surface border border-gym-border rounded">
          <h3 class="font-heading text-sm font-black uppercase text-gym-primary mb-2">Sanctuary Address</h3>
          <p class="text-xs text-gym-muted">PROFIT Flagship Athletic Sanctuary 01, NoHo Performance District</p>
        </div>
      </div>
    </main>
    ${generateFooter()}
  </div>
`;
writeRouteFiles('contact', buildHtmlPage({
  title: 'Contact Concierge & Editorial Desk | PROFIT Training Club',
  description: 'Connect with PROFIT Training Club concierge desk, schedule a sanctuary walkthrough, or submit editorial & press inquiries.',
  canonicalUrl: 'https://profitgymclub.com/contact',
  contentHtml: contactContent
}));

// Privacy Policy (with AdSense clause)
const privacyContent = `
  <div class="bg-gym-black text-gym-primary font-sans min-h-screen flex flex-col">
    ${generateHeader()}
    <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full space-y-8">
      <h1 class="font-heading text-3xl sm:text-5xl font-black uppercase tracking-wider text-gym-primary">
        PRIVACY POLICY &amp; DATA DISCLOSURE
      </h1>
      <section class="bg-gym-surface/60 border border-gym-lime/40 p-6 rounded shadow-lime-glow">
        <h2 class="text-gym-lime font-heading font-black uppercase text-sm mb-2">
          2. Google AdSense &amp; Third-Party Advertising Cookies
        </h2>
        <p class="text-xs sm:text-sm text-gym-secondary mb-4">
          We partner with Google AdSense and third-party advertising networks to display relevant advertisements when you visit our website (profitgymclub.com). Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.
        </p>
        <p class="text-xs sm:text-sm text-gym-secondary">
          Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" class="text-gym-lime underline">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices/" target="_blank" class="text-gym-lime underline">aboutads.info</a>.
        </p>
      </section>
      <section class="bg-gym-surface/40 border border-gym-border p-6 rounded">
        <h2 class="font-heading text-xl font-black uppercase text-gym-primary mb-3">Data Security &amp; Razorpay Compliance</h2>
        <p class="text-xs sm:text-sm text-gym-secondary">All transactions are processed through Level 1 PCI-DSS certified payment gateways (Razorpay and Stripe) with end-to-end TLS encryption.</p>
      </section>
    </main>
    ${generateFooter()}
  </div>
`;
writeRouteFiles('privacy', buildHtmlPage({
  title: 'Privacy Policy | PROFIT Training Club',
  description: 'Official Privacy Policy and Data Disclosure for PROFIT Training Club members and visitors.',
  canonicalUrl: 'https://profitgymclub.com/privacy',
  contentHtml: privacyContent
}));

// Terms of Service
const termsContent = `
  <div class="bg-gym-black text-gym-primary font-sans min-h-screen flex flex-col">
    ${generateHeader()}
    <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full space-y-8">
      <h1 class="font-heading text-3xl sm:text-5xl font-black uppercase tracking-wider text-gym-primary">
        TERMS OF SERVICE
      </h1>
      <section class="bg-gym-surface/40 border border-gym-border p-6 rounded">
        <h2 class="font-heading text-xl font-black uppercase text-gym-primary mb-3">1. Facility Access &amp; Membership Cap</h2>
        <p class="text-xs sm:text-sm text-gym-secondary">PROFIT Training Club operates as an exclusive athletic sanctuary strictly capped at 300 active athletes. Entry is granted via digital biometric QR pass upon subscription verification.</p>
      </section>
    </main>
    ${generateFooter()}
  </div>
`;
writeRouteFiles('terms', buildHtmlPage({
  title: 'Terms of Service | PROFIT Training Club',
  description: 'Official Terms of Service, membership privileges, and facility regulations for PROFIT Training Club.',
  canonicalUrl: 'https://profitgymclub.com/terms',
  contentHtml: termsContent
}));

// ============================================================================
// 4. PRERENDER HOMEPAGE (dist/index.html with rich static body)
// ============================================================================
console.log('[Prerender] Injecting rich pre-rendered landing page markup into dist/index.html...');

const featuredArticleCards = articles.slice(0, 6).map(art => `
  <a href="/blog/${art.slug}" class="group bg-gym-surface border border-gym-border rounded overflow-hidden hover:border-gym-lime/50 transition-all flex flex-col justify-between shadow-card">
    <div class="h-44 overflow-hidden relative">
      <img src="${art.image}" alt="${escapeHtml(art.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" width="400" height="225" loading="lazy" />
      <span class="absolute top-2 left-2 px-2 py-0.5 bg-gym-black/90 text-gym-lime text-[10px] font-heading font-bold uppercase rounded">
        ${escapeHtml(art.category)}
      </span>
    </div>
    <div class="p-4">
      <span class="text-[10px] text-gym-muted font-mono block mb-1">${escapeHtml(art.readTime)} &bull; ${escapeHtml(art.date)}</span>
      <h4 class="font-heading text-sm font-black uppercase text-gym-primary group-hover:text-gym-lime transition-colors line-clamp-2 mb-2">
        ${escapeHtml(art.title)}
      </h4>
      <p class="text-xs text-gym-secondary line-clamp-2">${escapeHtml(art.summary)}</p>
    </div>
  </a>
`).join('');

const homeContent = `
  <div class="bg-gym-black text-gym-primary font-sans min-h-screen flex flex-col selection:bg-gym-lime selection:text-gym-black">
    ${generateHeader()}
    <main class="flex-1">
      <!-- HERO -->
      <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-gym-border px-4 py-20 text-center">
        <div class="max-w-4xl mx-auto space-y-6">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gym-surface border border-gym-lime/30 text-gym-lime text-xs font-heading font-black uppercase tracking-widest shadow-lime-glow">
            <span>STRICT 300 ACTIVE MEMBER CAP &bull; ELEIKO IRON</span>
          </div>
          <h1 class="font-heading text-5xl sm:text-7xl font-black uppercase tracking-tight text-gym-primary leading-none">
            PRIVATE ATHLETIC <span class="text-gym-lime">SANCTUARY</span> &amp; SAAS
          </h1>
          <p class="text-base sm:text-xl text-gym-secondary max-w-2xl mx-auto leading-relaxed">
            Where elite resistance training meets biometric technology. Zero crowds, Olympic platforms, and progressive overload intelligence.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="/register" class="px-8 py-4 bg-gym-lime text-gym-black font-heading font-black uppercase text-sm tracking-wider rounded shadow-lime-glow hover:bg-gym-lime-hover transition-all">
              Apply For Membership Pass
            </a>
            <a href="/blog" class="px-8 py-4 bg-gym-surface hover:bg-gym-surface-hover border border-gym-border text-white font-heading font-bold uppercase text-sm tracking-wider rounded transition-all">
              Read 21 Scientific Protocols
            </a>
          </div>
        </div>
      </section>

      <!-- FEATURED PROTOCOLS & ARTICLES (Crucial for AdSense Crawler) -->
      <section class="py-20 border-b border-gym-border bg-gym-surface/40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span class="text-xs font-mono uppercase tracking-widest text-gym-lime font-bold">PEER-REVIEWED RESEARCH</span>
              <h2 class="font-heading text-3xl sm:text-5xl font-black uppercase tracking-tight text-gym-primary mt-1">
                LATEST SCIENTIFIC PROTOCOLS
              </h2>
              <p class="text-xs sm:text-sm text-gym-secondary mt-1">Evidence-based hypertrophy, nutrition dosage, and gym management architectures.</p>
            </div>
            <a href="/blog" class="text-xs font-heading font-bold uppercase tracking-wider text-gym-lime hover:underline">
              Explore All 21 Protocols &rarr;
            </a>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${featuredArticleCards}
          </div>
        </div>
      </section>
    </main>
    ${generateFooter()}
  </div>
`;

const homeFinalHtml = buildHtmlPage({
  title: 'PROFIT - Training Club | High Performance Strength Sanctuary & SaaS',
  description: 'Exclusive 300-member strength sanctuary. Eleiko calibrated plates, biometric turnstiles, and elite athlete management platform.',
  canonicalUrl: 'https://profitgymclub.com/',
  contentHtml: homeContent
});
fs.writeFileSync(path.join(DIST_DIR, 'index.html'), homeFinalHtml, 'utf8');

console.log('\n=============================================================');
console.log('✅ PRERENDER COMPLETE: ALL 27 ROUTES STATICALLY HYDRATED!');
console.log('=============================================================\n');
