import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown>;
}

const setMeta = (property: string, content: string, isName = false) => {
  const attr = isName ? "name" : "property";
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.content = content;
};

const SEOHead = ({ title, description, canonical, ogTitle, ogDescription, ogImage, ogUrl, ogType = "website", jsonLd }: SEOHeadProps) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    if (description) setMeta("description", description, true);
    setMeta("og:title", ogTitle || title);
    if (ogDescription || description) setMeta("og:description", ogDescription || description || "");
    if (ogImage) setMeta("og:image", ogImage);
    if (ogUrl || canonical) setMeta("og:url", ogUrl || canonical || "");
    setMeta("og:type", ogType);

    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", ogTitle || title, true);
    if (ogDescription || description) setMeta("twitter:description", ogDescription || description || "", true);
    if (ogImage) setMeta("twitter:image", ogImage, true);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // JSON-LD
    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = prevTitle;
      if (script) script.remove();
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, ogUrl, ogType, jsonLd]);

  return null;
};

export default SEOHead;
