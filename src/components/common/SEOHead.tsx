import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
}

const DEFAULT_TITLE = 'PROFIT Training Club | High Performance Strength Sanctuary & SaaS';
const DEFAULT_DESC = 'Exclusive 300-member strength sanctuary. Eleiko calibrated iron, biometric turnstiles, and elite athlete management platform.';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&h=630&q=80';
const SITE_ORIGIN = 'https://profitgymclub.com';

/**
 * Reusable SEO Head Manager that dynamically manages document title,
 * meta description, canonical link tag, Open Graph, Twitter cards, and robots indexing.
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = DEFAULT_DESC,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  noindex = false,
}) => {
  const location = useLocation();

  useEffect(() => {
    // 1. Page Title
    const finalTitle = title ? `${title} | PROFIT Training Club` : DEFAULT_TITLE;
    document.title = finalTitle;

    // Helper to get or create a tag
    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrVal);
        document.head.appendChild(tag);
      }
      tag.content = contentVal;
    };

    // 2. Canonical URL Tag
    const finalCanonical = canonicalUrl || `${SITE_ORIGIN}${location.pathname === '/' ? '/' : location.pathname.replace(/\/$/, '')}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = finalCanonical;

    // 3. Meta Description
    setMetaTag('name', 'description', description);

    // 4. Meta Robots
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // 5. Open Graph Metadata
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', finalCanonical);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'PROFIT Training Club');

    // 6. Twitter Card Metadata
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);
  }, [title, description, canonicalUrl, ogImage, ogType, noindex, location.pathname]);

  return null;
};
