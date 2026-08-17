import { SearchResult } from './WebSearchService';

export interface ValidatedSource {
  title: string;
  url: string;
  domain: string;
}

export function processAndRankSources(rawResults: SearchResult[]): {
  sourcesList: ValidatedSource[];
  sourceContextText: string;
} {
  // 1. Remove duplicate URLs & invalid links
  const uniqueMap = new Map<string, SearchResult>();

  for (const item of rawResults) {
    if (!item.url || !item.title) continue;
    
    let cleanUrl = item.url;
    try {
      const parsed = new URL(item.url);
      cleanUrl = `${parsed.origin}${parsed.pathname}`;
    } catch (e) {
      // Keep original if parsing fails
    }

    if (!uniqueMap.has(cleanUrl)) {
      uniqueMap.set(cleanUrl, item);
    }
  }

  const items = Array.from(uniqueMap.values());

  // 2. Rank by domain authority
  const highAuthorityDomains = [
    'docs.python.org',
    'docs.oracle.com',
    'cppreference.com',
    'developer.mozilla.org',
    'wikipedia.org',
    'geeksforgeeks.org',
    'nasa.gov',
    'baeldung.com',
    'realpython.com',
    'physicsclassroom.com',
    'hyperphysics.phy-astr.gsu.edu',
    'britannica.com',
    'ieee.org',
    'libretexts.org',
  ];

  items.sort((a, b) => {
    const aAuth = highAuthorityDomains.some(d => a.sourceDomain.includes(d) || a.url.includes(d)) ? 1 : 0;
    const bAuth = highAuthorityDomains.some(d => b.sourceDomain.includes(d) || b.url.includes(d)) ? 1 : 0;
    return bAuth - aAuth;
  });

  // Limit to top 4 validated sources
  const topSources = items.slice(0, 4);

  const sourcesList: ValidatedSource[] = topSources.map(s => ({
    title: s.title,
    url: s.url,
    domain: s.sourceDomain,
  }));

  const sourceContextText = topSources
    .map((s, idx) => `[Source ${idx + 1}: ${s.title}] (${s.url})\nSnippet: ${s.snippet}`)
    .join('\n\n');

  return {
    sourcesList,
    sourceContextText,
  };
}
