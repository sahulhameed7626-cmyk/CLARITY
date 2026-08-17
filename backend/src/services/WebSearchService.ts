export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  sourceDomain: string;
}

export async function searchWeb(searchQuery: string, courseName: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    const cleanTerm = searchQuery
      .replace(/python|java|c\+\+|c programming|data structures|physics|semiconductors|thermodynamics/gi, '')
      .trim() || searchQuery;

    // 1. Wikipedia Open Search API
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanTerm)}&limit=3&format=json`;
    const wikiRes = await fetch(wikiUrl);
    if (wikiRes.ok) {
      const wikiData: any = await wikiRes.json();
      const titles = wikiData[1] || [];
      const snippets = wikiData[2] || [];
      const links = wikiData[3] || [];

      for (let i = 0; i < titles.length; i++) {
        if (titles[i] && links[i]) {
          results.push({
            title: `${titles[i]} - Wikipedia`,
            snippet: snippets[i] || `Educational reference for ${titles[i]} on Wikipedia.`,
            url: links[i],
            sourceDomain: 'wikipedia.org',
          });
        }
      }
    }
  } catch (err) {
    console.warn('Wikipedia API Search Error:', err);
  }

  // 2. DuckDuckGo Instant Search API
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`;
    const ddgRes = await fetch(ddgUrl);
    if (ddgRes.ok) {
      const ddgData: any = await ddgRes.json();
      if (ddgData.AbstractText && ddgData.AbstractURL) {
        results.push({
          title: ddgData.Heading || `${searchQuery} Documentation`,
          snippet: ddgData.AbstractText,
          url: ddgData.AbstractURL,
          sourceDomain: ddgData.AbstractSource || 'duckduckgo.com',
        });
      }

      if (Array.isArray(ddgData.RelatedTopics)) {
        for (const topic of ddgData.RelatedTopics.slice(0, 2)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || searchQuery,
              snippet: topic.Text,
              url: topic.FirstURL,
              sourceDomain: 'duckduckgo.com',
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('DuckDuckGo API Search Error:', err);
  }

  // 3. Domain-Specific Documentation Fallbacks
  const fallbackSources = getFallbackEducationalSources(courseName, searchQuery);
  for (const s of fallbackSources) {
    if (!results.some(r => r.url === s.url)) {
      results.push(s);
    }
  }

  return results;
}

function getFallbackEducationalSources(courseName: string, query: string): SearchResult[] {
  const c = courseName.toLowerCase();
  const q = encodeURIComponent(query);

  if (c.includes('python')) {
    return [
      {
        title: 'Python Official Documentation',
        snippet: 'Official Python programming language documentation, tutorials, and standard library references.',
        url: `https://docs.python.org/3/search.html?q=${q}`,
        sourceDomain: 'docs.python.org',
      },
      {
        title: 'Real Python Reference',
        snippet: 'In-depth Python guides, articles, and practical coding examples.',
        url: `https://realpython.com/search?q=${q}`,
        sourceDomain: 'realpython.com',
      }
    ];
  }

  if (c.includes('java')) {
    return [
      {
        title: 'Oracle Java Standard Library Documentation',
        snippet: 'Official Oracle Java SE documentation, specifications, and API guides.',
        url: `https://docs.oracle.com/en/java/search.html?q=${q}`,
        sourceDomain: 'docs.oracle.com',
      },
      {
        title: 'Baeldung Java Reference',
        snippet: 'Technical articles and deep-dives on Java programming and JVM internals.',
        url: `https://www.baeldung.com/?s=${q}`,
        sourceDomain: 'baeldung.com',
      }
    ];
  }

  if (c.includes('c++') || c.includes('c programming')) {
    return [
      {
        title: 'CppReference Standard Library Manual',
        snippet: 'Comprehensive C and C++ language specification, standard library, and syntax reference.',
        url: `https://en.cppreference.com/mwiki/index.php?search=${q}`,
        sourceDomain: 'en.cppreference.com',
      },
      {
        title: 'GeeksforGeeks C/C++ Portal',
        snippet: 'Detailed programming articles, tutorials, algorithms, and code snippets.',
        url: `https://www.geeksforgeeks.org/c-plus-plus/`,
        sourceDomain: 'geeksforgeeks.org',
      }
    ];
  }

  if (c.includes('data structure')) {
    return [
      {
        title: 'GeeksforGeeks Data Structures Archive',
        snippet: 'Complete guide to Arrays, Linked Lists, Stacks, Queues, Trees, and Graphs.',
        url: `https://www.geeksforgeeks.org/data-structures/`,
        sourceDomain: 'geeksforgeeks.org',
      },
      {
        title: 'VisuAlgo Algorithm Visualizations',
        snippet: 'Interactive animations and step-by-step visual breakdowns of data structures.',
        url: `https://visualgo.net/`,
        sourceDomain: 'visualgo.net',
      }
    ];
  }

  if (c.includes('physics')) {
    return [
      {
        title: 'The Physics Classroom Tutorials',
        snippet: 'Educational explanations for mechanics, dynamics, electromagnetism, and energy.',
        url: `https://www.physicsclassroom.com/`,
        sourceDomain: 'physicsclassroom.com',
      },
      {
        title: 'HyperPhysics Concepts Map',
        snippet: 'Structured concept mapping for classical mechanics, thermodynamics, and quantum physics.',
        url: `http://hyperphysics.phy-astr.gsu.edu/hbase/hframe.html`,
        sourceDomain: 'hyperphysics.phy-astr.gsu.edu',
      }
    ];
  }

  if (c.includes('semiconductor')) {
    return [
      {
        title: 'Britannica Semiconductor Technology',
        snippet: 'Scientific overview of P-N junctions, doping, band gaps, diodes, and transistors.',
        url: `https://www.britannica.com/technology/semiconductor`,
        sourceDomain: 'britannica.com',
      },
      {
        title: 'IEEE Microelectronics & Circuits',
        snippet: 'IEEE technical reference for solid-state electronics and semiconductor device physics.',
        url: `https://www.ieee.org/`,
        sourceDomain: 'ieee.org',
      }
    ];
  }

  if (c.includes('thermodynamics')) {
    return [
      {
        title: 'NASA Heat & Thermodynamics Mechanics',
        snippet: 'NASA Glenn Research Center guide to thermodynamics laws, heat transfer, and work.',
        url: `https://www.grc.nasa.gov/www/k-12/airplane/thermo.html`,
        sourceDomain: 'nasa.gov',
      },
      {
        title: 'LibreTexts Thermal Physics',
        snippet: 'Open access university textbook modules on heat engines, entropy, and internal energy.',
        url: `https://phys.libretexts.org/`,
        sourceDomain: 'libretexts.org',
      }
    ];
  }

  return [
    {
      title: 'Wikipedia Academic Open Search',
      snippet: 'Open-source encyclopedia entries for academic subjects.',
      url: `https://en.wikipedia.org/wiki/${q}`,
      sourceDomain: 'wikipedia.org',
    }
  ];
}
