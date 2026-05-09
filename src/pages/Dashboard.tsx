import { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ActionCard } from '../components/cards/ActionCard';
import { ApiConfigCard, type ApiConfig } from '../components/cards/ApiConfigCard';
import { ErrorBox } from '../components/cards/ErrorBox';
import { OutputCard } from '../components/cards/OutputCard';
import { ReferenceResultsCard } from '../components/cards/ReferenceResultsCard';
import { SearchConfigCard } from '../components/cards/SearchConfigCard';
import { ActiveSourcesCard } from '../components/cards/ActiveSourcesCard';
import { WispConfigCard, type WispConfig } from '../components/cards/WispConfigCard';
import { ConsoleLog } from '../components/console/ConsoleLog';
import { GlassCard } from '../components/ui/GlassCard';
import { Container } from '../components/layout/Container';
import { TopBar } from '../components/layout/TopBar';
import { CacheStats } from '../components/sidebar/CacheStats';

// ── Types ─────────────────────────────────────────────────────────────────────

type Settings = {
  topic: string;
  referenceStyle: string;
  startYear: number;
  endYear: number;
  searchDepth: number;
  includePreprints: boolean;
  excludePatents: boolean;
  onlyOpenAccess: boolean;
  externalAiEnabled: boolean;
  apiConfig: ApiConfig;
  wispConfig: WispConfig;
};

export type WispPaper = {
  title: string;
  doi: string | null;
  authors: string[];
  publication_year: number | null;
  url: string;
  oa_pdf_url: string | null;
  provider: string;
};

type ExportFormat = 'txt' | 'bibtex' | 'ris';

type HistoryEntry = {
  id: string;
  topic: string;
  count: number;
  timestamp: number;
};

type ClarifyQuestion = {
  question: string;
  placeholder: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

const initialSettings: Settings = {
  topic: '',
  referenceStyle: 'apa',
  startYear: 2000,
  endYear: CURRENT_YEAR,
  searchDepth: 50,
  includePreprints: true,
  excludePatents: true,
  onlyOpenAccess: false,
  externalAiEnabled: false,
  apiConfig: { nickname: '', baseUrl: '', modelId: '', apiKey: '' },
  wispConfig: { baseUrl: '', apiKey: '' },
};


const seedLines = ['[10:32:15] DeepScholar ready', '[10:32:28] Waiting for user action'];

const deepResearchProcess = [
  'Clarify objective and constraints',
  'Decompose topic into focused sub-questions',
  'Run broad discovery across enabled sources',
  'Refine and cross-validate high-signal evidence',
  'Synthesize, format, and stream references',
];

const styleLabelMap: Record<string, string> = {
  apa: 'APA',
  mla: 'MLA',
  chicago: 'Chicago',
  vancouver: 'Vancouver',
  'doi-only': 'DOI only',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const expandTopicLocally = (topic: string) => {
  const clean = topic.trim();
  if (!clean) return '';
  return [
    `Primary objective: Build a comprehensive deep-research map for "${clean}" that captures foundational work, current methods, real-world outcomes, and known limitations.`,
    'Scope expansion: include adjacent terminology, canonical synonyms, benchmark datasets, dominant methodological families, dissenting findings, and practical deployment constraints.',
    'Evidence strategy: prioritize primary literature, rigorous evaluations, replication studies, and the strongest comparative analyses across multiple independent sources.',
    'Output intent: produce a references-ready narrative that links key claims to evidence tiers, highlights consensus vs uncertainty, and surfaces actionable follow-up questions.',
  ].join('\n\n');
};

const formatPaperCitation = (paper: WispPaper, index: number, style: string): string => {
  const authorStr =
    paper.authors.length > 0
      ? paper.authors.slice(0, 3).join(', ') + (paper.authors.length > 3 ? ', et al.' : '')
      : 'Unknown Author';
  const year = paper.publication_year ?? 'n.d.';
  const link = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;

  switch (style) {
    case 'apa':
      return `${index}. ${authorStr} (${year}). ${paper.title}. ${link}`;
    case 'mla':
      return `${index}. ${authorStr}. "${paper.title}." ${year}. ${link}`;
    case 'chicago':
      return `${index}. ${authorStr}. "${paper.title}." ${year}. ${link}`;
    case 'vancouver':
      return `${index}. ${authorStr}. ${paper.title}. ${year}. Available from: ${link}`;
    case 'doi-only':
      return `${index}. ${paper.doi ?? paper.url}`;
    default:
      return `${index}. ${authorStr} (${year}). ${paper.title}. ${link}`;
  }
};

const isPreprint = (p: WispPaper): boolean => {
  const prov = p.provider.toLowerCase();
  return prov.includes('arxiv') || prov.includes('biorxiv') || prov.includes('medrxiv') || p.url.includes('arxiv.org');
};

const normalizeTitle = (t: string): string =>
  t.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);

const buildExport = (
  papers: WispPaper[],
  topic: string,
  expandedTopic: string,
  style: string,
  format: ExportFormat,
): { content: string; filename: string; mime: string } => {
  if (format === 'bibtex') {
    const entries = papers.map((p, i) => {
      const key = p.doi ? p.doi.replace(/[^a-zA-Z0-9]/g, '_') : `paper${i + 1}`;
      const authors = p.authors.join(' and ') || 'Unknown';
      const lines = [
        `@article{${key},`,
        `  author  = {${authors}},`,
        `  title   = {${p.title}},`,
        p.publication_year ? `  year    = {${p.publication_year}},` : '',
        p.doi ? `  doi     = {${p.doi}},` : '',
        `  url     = {${p.doi ? `https://doi.org/${p.doi}` : p.url}},`,
        `}`,
      ].filter(Boolean);
      return lines.join('\n');
    });
    return {
      content: `% DeepScholar export — ${topic}\n\n` + entries.join('\n\n'),
      filename: 'deepscholar-export.bib',
      mime: 'text/plain',
    };
  }

  if (format === 'ris') {
    const entries = papers.map((p) => {
      const lines = [
        'TY  - JOUR',
        ...p.authors.map((a) => `AU  - ${a}`),
        `TI  - ${p.title}`,
        p.publication_year ? `PY  - ${p.publication_year}` : '',
        p.doi ? `DO  - ${p.doi}` : '',
        `UR  - ${p.doi ? `https://doi.org/${p.doi}` : p.url}`,
        'ER  -',
      ].filter(Boolean);
      return lines.join('\n');
    });
    return {
      content: entries.join('\n\n'),
      filename: 'deepscholar-export.ris',
      mime: 'application/x-research-info-systems',
    };
  }

  // TXT
  const formatted = papers.map((p, i) => formatPaperCitation(p, i + 1, style));
  return {
    content: [
      `Topic: ${topic}`,
      '',
      'Expanded Topic:',
      expandedTopic,
      '',
      `Reference style: ${style}`,
      `Generated references: ${papers.length}`,
      '',
      ...formatted,
    ].join('\n'),
    filename: 'deepscholar-export.txt',
    mime: 'text/plain',
  };
};

const fetchWispPapers = async (query: string, wisp: WispConfig): Promise<WispPaper[]> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (wisp.apiKey.trim()) headers['X-API-Key'] = wisp.apiKey;

  const res = await fetch(`${wisp.baseUrl.replace(/\/$/, '')}/v1/academic`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt: query, question: '', max_papers: 40 }),
  });

  if (!res.ok) throw new Error(`WISP ${res.status}`);
  const data = await res.json();
  return (data.papers ?? []) as WispPaper[];
};

const fetchPubMed = async (query: string): Promise<WispPaper[]> => {
  const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  const searchRes = await fetch(
    `${base}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=25&retmode=json&tool=deepscholar&email=app@deepscholar.ai`,
  );
  if (!searchRes.ok) return [];
  const searchData = await searchRes.json();
  const ids: string[] = searchData.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  const summaryRes = await fetch(
    `${base}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json&tool=deepscholar&email=app@deepscholar.ai`,
  );
  if (!summaryRes.ok) return [];
  const summaryData = await summaryRes.json();
  const result = summaryData.result ?? {};

  return ids.flatMap((id) => {
    const item = result[id];
    if (!item || item.error) return [];
    const doi =
      (item.articleids ?? []).find((a: { idtype: string; value: string }) => a.idtype === 'doi')
        ?.value ?? null;
    return [
      {
        title: item.title ?? '',
        doi: doi || null,
        authors: (item.authors ?? []).slice(0, 6).map((a: { name: string }) => a.name),
        publication_year: item.pubdate ? parseInt(item.pubdate.slice(0, 4)) || null : null,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        oa_pdf_url: null,
        provider: 'pubmed',
      } satisfies WispPaper,
    ];
  });
};

const fetchEuropePmc = async (query: string): Promise<WispPaper[]> => {
  const res = await fetch(
    `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=25&resultType=core`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.resultList?.result ?? []).map(
    (item: {
      title?: string;
      doi?: string;
      authorString?: string;
      pubYear?: string;
      source?: string;
      id?: string;
      isOpenAccess?: string;
      fullTextUrl?: string;
    }): WispPaper => ({
      title: item.title ?? '',
      doi: item.doi ?? null,
      authors: item.authorString ? item.authorString.split(', ').slice(0, 6) : [],
      publication_year: item.pubYear ? parseInt(item.pubYear) || null : null,
      url: item.doi
        ? `https://doi.org/${item.doi}`
        : `https://europepmc.org/article/${item.source ?? ''}/${item.id ?? ''}`,
      oa_pdf_url: item.isOpenAccess === 'Y' ? (item.fullTextUrl ?? null) : null,
      provider: 'europepmc',
    }),
  );
};

const fetchCORE = async (query: string): Promise<WispPaper[]> => {
  const res = await fetch(
    `https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(query)}&limit=20`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map(
    (item: {
      title?: string;
      doi?: string;
      authors?: Array<string | { name?: string }>;
      yearPublished?: number;
      downloadUrl?: string;
    }): WispPaper => ({
      title: item.title ?? '',
      doi: item.doi ?? null,
      authors: (item.authors ?? [])
        .slice(0, 6)
        .map((a) => (typeof a === 'string' ? a : (a.name ?? ''))),
      publication_year: item.yearPublished ?? null,
      url: item.doi ? `https://doi.org/${item.doi}` : (item.downloadUrl ?? ''),
      oa_pdf_url: item.downloadUrl ?? null,
      provider: 'core',
    }),
  );
};

const fetchERIC = async (query: string): Promise<WispPaper[]> => {
  const res = await fetch(
    `https://api.ies.ed.gov/eric/?search=${encodeURIComponent(query)}&format=json&rows=20`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.response?.docs ?? []).map(
    (item: {
      title?: string;
      author?: string | string[];
      publicationdateyear?: number;
      url?: string;
      id?: string;
    }): WispPaper => ({
      title: item.title ?? '',
      doi: null,
      authors: Array.isArray(item.author)
        ? item.author.slice(0, 6)
        : item.author
          ? [item.author]
          : [],
      publication_year: item.publicationdateyear ?? null,
      url: item.url ?? `https://eric.ed.gov/?id=${item.id ?? ''}`,
      oa_pdf_url: null,
      provider: 'eric',
    }),
  );
};

const generateSubQueries = (topic: string, expandedTopic: string, count: number): string[] => {
  const topicKeywords = new Set(topic.toLowerCase().split(/\s+/).filter((w) => w.length > 3));

  const phrases = expandedTopic
    .split(/[\n.]+/)
    .map((l) => l.replace(/^[^:]+:\s*/, '').trim())
    .filter((l) => l.length > 10 && l.length < 200);

  const queries: string[] = [topic];

  for (const phrase of phrases) {
    if (queries.length >= count) break;
    const phraseLC = phrase.toLowerCase();
    const topicOverlap = [...topicKeywords].some((kw) => phraseLC.includes(kw));
    const q = topicOverlap ? phrase : `${topic} — ${phrase.split(',')[0].trim()}`;
    if (q.length > 10 && !queries.includes(q)) queries.push(q);
  }

  while (queries.length < count) queries.push(topic);
  return queries.slice(0, count);
};

const formatHistoryDate = (ts: number) =>
  new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// ── Component ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('paper-harvester-settings');
    if (!saved) return initialSettings;
    const parsed = JSON.parse(saved);
    return {
      ...initialSettings,
      ...parsed,
      topic: '',
      apiConfig: { ...initialSettings.apiConfig, ...parsed.apiConfig },
      wispConfig: { ...initialSettings.wispConfig, ...parsed.wispConfig },
    };
  });

  const [expandedTopic, setExpandedTopic] = useState('');
  const [expandedTopicDraft, setExpandedTopicDraft] = useState('');
  const [expansionAccepted, setExpansionAccepted] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  const [papers, setPapers] = useState<WispPaper[]>([]);
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({});
  const [isVerifying, setIsVerifying] = useState(false);

  const [lines, setLines] = useState(seedLines);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const cancelRef = useRef(false);

  const [clarifyQuestions, setClarifyQuestions] = useState<ClarifyQuestion[]>([]);
  const [clarifyAnswers, setClarifyAnswers] = useState<string[]>([]);
  const [clarifyPhase, setClarifyPhase] = useState<'idle' | 'loading' | 'pending'>('idle');

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('paper-harvester-history');
    return saved ? (JSON.parse(saved) as HistoryEntry[]) : [];
  });
  const [restoreTopicId, setRestoreTopicId] = useState<string | null>(null);

  // ── Persistence ────────────────────────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem('paper-harvester-settings', JSON.stringify(settings));
  }, [settings]);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem('paper-harvester-session');
    if (!saved) return;
    try {
      const session = JSON.parse(saved) as { papers: WispPaper[]; expandedTopic: string; sourceCounts: Record<string, number> };
      if (session.papers?.length > 0) {
        setPapers(session.papers);
        setSourceCounts(session.sourceCounts ?? {});
        if (session.expandedTopic) {
          setExpandedTopic(session.expandedTopic);
          setExpandedTopicDraft(session.expandedTopic);
          setExpansionAccepted(true);
        }
      }
    } catch {
      // corrupt session — ignore
    }
  }, []);

  // Save session whenever papers change
  useEffect(() => {
    if (papers.length === 0) return;
    if (papers.length > 8000) return; // guard localStorage limit
    try {
      localStorage.setItem(
        'paper-harvester-session',
        JSON.stringify({ papers, expandedTopic, sourceCounts }),
      );
    } catch {
      // storage full — ignore
    }
  }, [papers, expandedTopic, sourceCounts]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const stamp = () => new Date().toLocaleTimeString('en-US', { hour12: false });

  const wispConfigured = Boolean(settings.wispConfig.baseUrl.trim());
  const apiConfigured = Boolean(settings.apiConfig.baseUrl.trim() && settings.apiConfig.apiKey.trim());

  const displayEstimate = useMemo(
    () => (wispConfigured ? Math.round(settings.searchDepth * 40 * 0.65) : 0),
    [wispConfigured, settings.searchDepth],
  );

  const validationError = useMemo(() => {
    if (!wispConfigured) return 'WISP backend required — add your WISP URL in settings to run a search.';
    if (!settings.topic.trim()) return 'Search Focus Topic is required.';
    if (!expandedTopic.trim() || !expansionAccepted) return 'Please process expansion and click Accept before running.';
    if (settings.startYear > settings.endYear) return 'Start year is later than end year.';
    if (settings.startYear < 1900 || settings.endYear > CURRENT_YEAR)
      return `Year range must be between 1900 and ${CURRENT_YEAR}.`;
    return null;
  }, [expandedTopic, expansionAccepted, settings, wispConfigured]);

  // ── Topic expansion ────────────────────────────────────────────────────────

  // Step 1: generate topic-specific clarifying questions
  const processExpansion = async () => {
    if (!settings.topic.trim()) return;
    setClarifyPhase('loading');

    if (apiConfigured) {
      const { baseUrl, apiKey, modelId, nickname } = settings.apiConfig;
      setLines((prev) => [...prev, `[${stamp()}] ${nickname || 'AI API'} generating focused questions…`]);
      try {
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: modelId || 'gpt-4o',
            messages: [
              {
                role: 'system',
                content:
                  'You are a research assistant preparing a deep literature search. Generate exactly 3 short, specific clarifying questions for the research topic. Focus on the most important ambiguities that — if answered — would meaningfully change which papers get found (e.g. target population, disease subtype, comparison methodology, application domain, geographic scope, regulatory context). Return ONLY valid JSON with no markdown: {"questions":[{"question":"...","placeholder":"..."}]}',
              },
              { role: 'user', content: `Research topic: "${settings.topic.trim()}"` },
            ],
            max_tokens: 400,
          }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        const raw: string = data.choices?.[0]?.message?.content ?? '';
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
        const questions: ClarifyQuestion[] = parsed.questions ?? [];
        if (questions.length > 0) {
          setClarifyQuestions(questions);
          setClarifyAnswers(new Array(questions.length).fill(''));
          setClarifyPhase('pending');
          setLines((prev) => [...prev, `[${stamp()}] Questions ready — answer to sharpen the search`]);
          return;
        }
      } catch (err) {
        setLines((prev) => [...prev, `[${stamp()}] Question generation failed (${String(err)}) — using defaults`]);
      }
    }

    // Static fallback — still topic-specific
    const t = settings.topic.trim();
    const staticQuestions: ClarifyQuestion[] = [
      {
        question: `What specific aspect of "${t}" are you researching?`,
        placeholder: 'e.g. safety mechanisms, clinical outcomes, performance benchmarks…',
      },
      {
        question: 'Foundational/seminal work, recent advances (last 5 years), or both?',
        placeholder: 'e.g. recent advances, seminal papers from the 1990s, both…',
      },
      {
        question: 'Any specific methodology, population, or application domain to prioritise?',
        placeholder: 'e.g. transformer architectures, paediatric patients, drug discovery…',
      },
    ];
    setClarifyQuestions(staticQuestions);
    setClarifyAnswers(['', '', '']);
    setClarifyPhase('pending');
  };

  // Step 2: run actual expansion with answers injected
  // Accepts explicit q/a to avoid stale closure when skipping
  const runExpansion = async (questionsIn = clarifyQuestions, answersIn = clarifyAnswers) => {
    if (!settings.topic.trim()) return;
    setIsExpanding(true);
    setClarifyPhase('idle');

    const answeredPairs = questionsIn
      .map((q, i) => (answersIn[i]?.trim() ? `${q.question} ${answersIn[i].trim()}` : null))
      .filter(Boolean);
    const clarifyContext =
      answeredPairs.length > 0
        ? `\n\nResearcher clarifications:\n${answeredPairs.join('\n')}`
        : '';
    const topicForExpansion = settings.topic.trim() + clarifyContext;

    if (apiConfigured) {
      const { baseUrl, apiKey, modelId, nickname } = settings.apiConfig;
      setLines((prev) => [...prev, `[${stamp()}] Calling ${nickname || 'AI API'} for topic expansion…`]);
      try {
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: modelId || 'gpt-4o',
            messages: [
              {
                role: 'system',
                content:
                  'You are a research assistant. Expand the given research topic into a comprehensive deep-research scope covering foundational work, current methods, adjacent terminology, dissenting findings, and actionable follow-up questions. Honour any focus, recency, or domain constraints provided. Be concise and structured.',
              },
              { role: 'user', content: `Expand this research topic: "${topicForExpansion}"` },
            ],
            max_tokens: 800,
          }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        const content: string = data.choices?.[0]?.message?.content ?? '';
        if (!content) throw new Error('Empty response');
        setExpandedTopic(content);
        setExpandedTopicDraft(content);
        setExpansionAccepted(false);
        setLines((prev) => [...prev, `[${stamp()}] Expansion received from ${nickname || 'AI API'}`]);
        setIsExpanding(false);
        return;
      } catch (err) {
        setLines((prev) => [
          ...prev,
          `[${stamp()}] AI API error: ${String(err)} — falling back to local expansion`,
        ]);
      }
    }

    const next = expandTopicLocally(settings.topic);
    setExpandedTopic(next);
    setExpandedTopicDraft(next);
    setExpansionAccepted(false);
    setLines((prev) => [...prev, `[${stamp()}] Expansion generated locally`]);
    setIsExpanding(false);
  };

  // ── AI verification ────────────────────────────────────────────────────────

  const runAiVerification = async (papersToVerify: WispPaper[]): Promise<WispPaper[]> => {
    if (!apiConfigured) {
      setLines((prev) => [...prev, `[${stamp()}] AI verification skipped — no API configured`]);
      return papersToVerify;
    }

    setIsVerifying(true);
    setLines((prev) => [
      ...prev,
      `[${stamp()}] Running AI citation verification across ${papersToVerify.length} papers…`,
    ]);

    const { baseUrl, apiKey, modelId } = settings.apiConfig;
    const batchSize = 20;
    let totalRemoved = 0;
    const allVerified: WispPaper[] = [];

    for (let i = 0; i < papersToVerify.length; i += batchSize) {
      if (cancelRef.current) break;
      const batch = papersToVerify.slice(i, i + batchSize);

      try {
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: modelId || 'gpt-4o',
            messages: [
              {
                role: 'system',
                content:
                  'You are a citation validator. Given JSON papers with index, title, authors, year, doi — return a JSON object {"remove": [indices]} listing only papers that are clearly fabricated (impossible year, nonsensical title, obvious placeholders). Be conservative: only flag obvious fakes. Real papers from databases should be kept.',
              },
              {
                role: 'user',
                content: JSON.stringify(
                  batch.map((p, idx) => ({
                    index: idx,
                    title: p.title,
                    authors: p.authors.slice(0, 2),
                    year: p.publication_year,
                    doi: p.doi,
                  })),
                ),
              },
            ],
            max_tokens: 200,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content: string = data.choices?.[0]?.message?.content ?? '';
          let removeIndices: number[] = [];
          try {
            const parsed = JSON.parse(content);
            removeIndices = Array.isArray(parsed.remove) ? parsed.remove : [];
          } catch {
            // unparseable — keep all
          }
          const removeSet = new Set(removeIndices);
          const kept = batch.filter((_, idx) => !removeSet.has(idx));
          totalRemoved += batch.length - kept.length;
          allVerified.push(...kept);
        } else {
          allVerified.push(...batch);
        }
      } catch {
        allVerified.push(...batch);
      }
    }

    setLines((prev) => [
      ...prev,
      `[${stamp()}] Verification complete — ${allVerified.length} papers kept${totalRemoved > 0 ? `, ${totalRemoved} removed` : ''}`,
    ]);
    setIsVerifying(false);
    return allVerified;
  };

  // ── Harvest ────────────────────────────────────────────────────────────────

  const runHarvest = async () => {
    if (isRunning) {
      cancelRef.current = true;
      setIsRunning(false);
      setLines((prev) => [...prev, `[${stamp()}] Run cancelled by user`]);
      return;
    }

    if (validationError) {
      setLines((prev) => [...prev, `[${stamp()}] Cannot run: ${validationError}`]);
      return;
    }

    const finalTopic = expandedTopicDraft.trim() || expandedTopic;
    setExpandedTopic(finalTopic);
    setPapers([]);
    setSourceCounts({});
    setActiveStep(0);
    cancelRef.current = false;
    setIsRunning(true);

    const passes = settings.searchDepth;
    const queries = generateSubQueries(settings.topic, finalTopic, passes);
    const seenDois = new Set<string>();
    const seenTitles = new Set<string>();
    let totalCount = 0;
    let emptyStreak = 0;
    const MAX_EMPTY_STREAK = 3;
    const allPapers: WispPaper[] = [];
    const runSourceCounts: Record<string, number> = {};

    setLines((prev) => [
      ...prev,
      `[${stamp()}] Starting search across WISP + PubMed + Europe PMC + CORE + ERIC — up to ${passes} passes`,
    ]);

    for (let i = 0; i < queries.length; i++) {
      if (cancelRef.current) break;

      setActiveStep(
        Math.min(deepResearchProcess.length - 1, Math.floor((i / queries.length) * deepResearchProcess.length)),
      );

      try {
        const settled = await Promise.allSettled([
          fetchWispPapers(queries[i], settings.wispConfig),
          fetchPubMed(queries[i]),
          fetchEuropePmc(queries[i]),
          fetchCORE(queries[i]),
          fetchERIC(queries[i]),
        ]);
        const fetched = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

        // Client-side filters
        const filtered = fetched.filter((p) => {
          const yr = p.publication_year;
          if (yr !== null && yr < settings.startYear) return false;
          if (yr !== null && yr > settings.endYear) return false;
          if (!settings.includePreprints && isPreprint(p)) return false;
          if (settings.onlyOpenAccess && !p.oa_pdf_url) return false;
          return true;
        });

        // Dedup by DOI, then title fallback
        const newPapers = filtered.filter((p) => {
          if (p.doi) {
            if (seenDois.has(p.doi)) return false;
            seenDois.add(p.doi);
            return true;
          }
          // No DOI — dedup by title
          const nt = normalizeTitle(p.title);
          if (seenTitles.has(nt)) return false;
          seenTitles.add(nt);
          return true;
        });

        if (newPapers.length > 0) {
          emptyStreak = 0;

          // Track source counts
          for (const p of newPapers) {
            runSourceCounts[p.provider] = (runSourceCounts[p.provider] ?? 0) + 1;
          }
          setSourceCounts({ ...runSourceCounts });

          allPapers.push(...newPapers);
          totalCount += newPapers.length;
          setPapers((prev) => [...prev, ...newPapers]);

          const providers = [...new Set(newPapers.map((p) => p.provider))].join(', ');
          setLines((prev) => [
            ...prev,
            `[${stamp()}] Pass ${i + 1}/${passes}: +${newPapers.length} papers (${providers})`,
          ]);
        } else {
          emptyStreak += 1;
          if (emptyStreak >= MAX_EMPTY_STREAK) {
            setLines((prev) => [
              ...prev,
              `[${stamp()}] No new references after ${MAX_EMPTY_STREAK} consecutive passes — sources exhausted`,
            ]);
            break;
          }
        }
      } catch (err) {
        setLines((prev) => [...prev, `[${stamp()}] Pass ${i + 1} error: ${String(err)}`]);
      }
    }

    setActiveStep(deepResearchProcess.length - 1);
    setIsRunning(false);
    setLines((prev) => [
      ...prev,
      cancelRef.current
        ? `[${stamp()}] Stopped by user: ${totalCount} unique papers`
        : `[${stamp()}] Search complete: ${totalCount} unique papers`,
    ]);

    if (!cancelRef.current && allPapers.length > 0) {
      // AI verification pass
      const verified = await runAiVerification(allPapers);
      setPapers(verified);

      // Save to history (metadata only)
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        topic: settings.topic,
        count: verified.length,
        timestamp: Date.now(),
      };
      const newHistory = [entry, ...history].slice(0, 10);
      setHistory(newHistory);
      try {
        localStorage.setItem('paper-harvester-history', JSON.stringify(newHistory));
      } catch {
        // storage full
      }
    }
  };

  // ── Export ─────────────────────────────────────────────────────────────────

  const exportPapers = (format: ExportFormat) => {
    if (papers.length === 0) return;
    const { content, filename, mime } = buildExport(
      papers,
      settings.topic,
      expandedTopicDraft || expandedTopic,
      settings.referenceStyle,
      format,
    );
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const cards = useMemo(
    () => (
      <div className="space-y-4">
        {/* Research Topic */}
        <GlassCard className="p-5">
          <h2 className="mb-3 text-base font-semibold text-white">Research Topic</h2>
          <input
            id="main-topic"
            value={settings.topic}
            onChange={(e) => {
              const topic = e.target.value;
              setSettings((s) => ({ ...s, topic }));
              setExpandedTopic('');
              setExpandedTopicDraft('');
              setExpansionAccepted(false);
              setClarifyQuestions([]);
              setClarifyAnswers([]);
              setClarifyPhase('idle');
            }}
            className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/40 focus:outline-none"
            placeholder="e.g. foundation models for protein design"
          />

          {clarifyPhase !== 'pending' && (
            <div className="mt-3">
              <button
                type="button"
                onClick={processExpansion}
                disabled={!settings.topic.trim() || isExpanding || clarifyPhase === 'loading'}
                className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {clarifyPhase === 'loading' ? 'Generating questions…' : isExpanding ? 'Processing…' : 'Process Expansion'}
              </button>
            </div>
          )}

          {/* AI-generated topic-specific clarifying questions */}
          {clarifyPhase === 'pending' && clarifyQuestions.length > 0 && (
            <div className="mt-3 space-y-3 rounded-lg border border-violet-500/20 bg-slate-900/40 p-4">
              <p className="text-xs font-medium text-violet-300/80">
                Answer to sharpen the search — all optional, skip any you don't need.
              </p>
              {clarifyQuestions.map((q, i) => (
                <div key={i}>
                  <label className="mb-1 block text-xs text-slate-400">{q.question}</label>
                  <input
                    value={clarifyAnswers[i] ?? ''}
                    onChange={(e) => {
                      const next = [...clarifyAnswers];
                      next[i] = e.target.value;
                      setClarifyAnswers(next);
                    }}
                    className="w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:outline-none"
                    placeholder={q.placeholder}
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => runExpansion()}
                  disabled={isExpanding}
                  className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isExpanding ? 'Processing…' : 'Continue with Expansion'}
                </button>
                <button
                  type="button"
                  onClick={() => runExpansion([], [])}
                  disabled={isExpanding}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-500 transition hover:text-slate-300 disabled:opacity-40"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {expandedTopic && (
            <div className="mt-4 space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-400">Expanded Scope</p>
                <textarea
                  value={expandedTopic}
                  readOnly
                  className="min-h-[110px] w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-xs leading-relaxed text-slate-300"
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-400">Refine (optional)</p>
                <textarea
                  value={expandedTopicDraft}
                  onChange={(e) => {
                    setExpandedTopicDraft(e.target.value);
                    setExpansionAccepted(false);
                  }}
                  className="min-h-[110px] w-full rounded-lg border border-white/15 bg-slate-900/60 px-4 py-3 text-xs leading-relaxed text-slate-100 focus:border-cyan-500/40 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setExpandedTopic(expandedTopicDraft.trim() || expandedTopic);
                  setExpansionAccepted(true);
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  expansionAccepted
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                {expansionAccepted ? 'Accepted ✓' : 'Accept & Confirm'}
              </button>
            </div>
          )}
        </GlassCard>

        {/* Research Steps */}
        <GlassCard className="p-5">
          <h2 className="mb-3 text-base font-semibold text-white">Research Steps</h2>
          <div className="space-y-1.5">
            {deepResearchProcess.map((item, i) => {
              const isActive = isRunning && i === activeStep;
              const isDone = !isRunning && papers.length > 0 && i <= activeStep;
              return (
                <div
                  key={item}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-cyan-500/10 text-white' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      isActive ? 'animate-pulse bg-cyan-400' : isDone ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                  {item}
                </div>
              );
            })}
          </div>
        </GlassCard>

        <ReferenceResultsCard
          papers={papers}
          referenceStyle={settings.referenceStyle}
          isRunning={isRunning}
          isVerifying={isVerifying}
        />

        {validationError && (
          <ErrorBox
            message={validationError}
            onFix={() => {
              if (!settings.topic.trim()) return;
              if (!expandedTopic.trim()) { processExpansion(); return; }
              if (!expansionAccepted) { setExpansionAccepted(true); return; }
              if (settings.startYear > settings.endYear) {
                setSettings((s) => ({ ...s, endYear: s.startYear }));
                return;
              }
              if (settings.startYear < 1900 || settings.endYear > CURRENT_YEAR) {
                setSettings((s) => ({
                  ...s,
                  startYear: initialSettings.startYear,
                  endYear: initialSettings.endYear,
                }));
                return;
              }
              if (!wispConfigured) setSettingsMenuOpen(true);
            }}
          />
        )}

        <ActionCard
          onRun={runHarvest}
          onExport={exportPapers}
          estimatedPapers={displayEstimate}
          disableRun={Boolean(validationError)}
          isRunning={isRunning}
          hasPapers={papers.length > 0}
        />
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      activeStep, apiConfigured, clarifyAnswers, clarifyPhase, clarifyQuestions, displayEstimate,
      expandedTopic, expandedTopicDraft, expansionAccepted, isExpanding,
      isRunning, isVerifying, papers, settings, validationError, wispConfigured,
    ],
  );

  return (
    <div className="min-h-screen bg-transparent text-white">
      <TopBar onMenuClick={() => setSettingsMenuOpen(true)} isRunning={isRunning} wispConfigured={wispConfigured} />
      <Container>
        <div className="relative grid grid-cols-1 gap-4 pb-16 xl:grid-cols-[minmax(0,800px)_340px] xl:items-start xl:pb-0">
          {cards}
          <aside className="hidden xl:sticky xl:top-24 xl:block">
            <CacheStats
              gatheredCount={papers.length}
              targetCount={displayEstimate}
              sourceCounts={sourceCounts}
            />
          </aside>
        </div>

        <div className="mt-4 hidden xl:block">
          <ConsoleLog lines={lines} />
        </div>

        {/* Mobile bottom bar — Progress + Log toggle only; Run is in ActionCard */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#060913]/95 px-4 py-2 backdrop-blur-xl xl:hidden">
          <button
            onClick={() => setSheetOpen((v) => !v)}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-200 transition"
          >
            {sheetOpen ? 'Hide' : 'Show'} Progress + Log
          </button>
        </div>

        {/* Mobile sheet */}
        <div
          className={`fixed inset-x-0 bottom-20 z-30 max-h-[70vh] overflow-auto rounded-t-2xl border border-white/10 bg-[#060913]/95 p-3 transition-transform xl:hidden ${sheetOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}
        >
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-slate-600" />
          <div className="space-y-3">
            <CacheStats gatheredCount={papers.length} targetCount={displayEstimate} sourceCounts={sourceCounts} />
            <ConsoleLog lines={lines} />
          </div>
        </div>

        {/* Settings panel */}
        {settingsMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setSettingsMenuOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-full max-w-sm overflow-y-auto border-r border-white/10 bg-[#060913] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#060913]/95 px-4 py-3 backdrop-blur">
                <h2 className="text-sm font-semibold text-white">Settings</h2>
                <button
                  type="button"
                  onClick={() => setSettingsMenuOpen(false)}
                  className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 p-4 pb-10">
                {/* Backends */}
                <p className="px-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Backends</p>
                <WispConfigCard
                  config={settings.wispConfig}
                  onChange={(wispConfig) => setSettings((s) => ({ ...s, wispConfig }))}
                />
                <ApiConfigCard
                  config={settings.apiConfig}
                  onChange={(apiConfig) => setSettings((s) => ({ ...s, apiConfig }))}
                />

                {/* Search */}
                <p className="px-0.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Search</p>
                <SearchConfigCard
                  topic={settings.topic}
                  setTopic={(topic) => setSettings((s) => ({ ...s, topic }))}
                  referenceStyle={settings.referenceStyle}
                  setReferenceStyle={(referenceStyle) => setSettings((s) => ({ ...s, referenceStyle }))}
                  startYear={settings.startYear}
                  setStartYear={(startYear) => setSettings((s) => ({ ...s, startYear }))}
                  endYear={settings.endYear}
                  setEndYear={(endYear) => setSettings((s) => ({ ...s, endYear }))}
                  searchDepth={settings.searchDepth}
                  setSearchDepth={(searchDepth) => setSettings((s) => ({ ...s, searchDepth }))}
                  includePreprints={settings.includePreprints}
                  setIncludePreprints={(includePreprints) => setSettings((s) => ({ ...s, includePreprints }))}
                  excludePatents={settings.excludePatents}
                  setExcludePatents={(excludePatents) => setSettings((s) => ({ ...s, excludePatents }))}
                  onlyOpenAccess={settings.onlyOpenAccess}
                  setOnlyOpenAccess={(onlyOpenAccess) => setSettings((s) => ({ ...s, onlyOpenAccess }))}
                />
                <ActiveSourcesCard estimatedPapers={displayEstimate} />

                {/* Output */}
                <p className="px-0.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Output</p>
                <OutputCard
                  expandedTopic={expandedTopic}
                  externalAiEnabled={settings.externalAiEnabled}
                  setExternalAiEnabled={(externalAiEnabled) => setSettings((s) => ({ ...s, externalAiEnabled }))}
                  apiConfigured={apiConfigured}
                  apiNickname={settings.apiConfig.nickname}
                />

                {/* History */}
                <p className="px-0.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">History</p>
                {history.length === 0 ? (
                  <p className="px-0.5 text-xs text-slate-600">No completed runs yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {history.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          {restoreTopicId === entry.id ? (
                            <div className="space-y-1">
                              <p className="text-xs text-slate-300">Re-search this topic?</p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSettings((s) => ({ ...s, topic: entry.topic }));
                                    setExpandedTopic('');
                                    setExpandedTopicDraft('');
                                    setExpansionAccepted(false);
                                    setPapers([]);
                                    setSourceCounts({});
                                    setRestoreTopicId(null);
                                    setSettingsMenuOpen(false);
                                  }}
                                  className="rounded border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRestoreTopicId(null)}
                                  className="rounded border border-white/10 px-2 py-0.5 text-[10px] text-slate-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="w-full text-left"
                              onClick={() => setRestoreTopicId(entry.id)}
                            >
                              <p className="truncate text-xs text-slate-200">{entry.topic}</p>
                              <p className="text-[10px] text-slate-500">
                                {entry.count.toLocaleString()} refs · {formatHistoryDate(entry.timestamp)}
                              </p>
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = history.filter((h) => h.id !== entry.id);
                            setHistory(updated);
                            localStorage.setItem('paper-harvester-history', JSON.stringify(updated));
                          }}
                          className="ml-2 shrink-0 text-slate-600 transition hover:text-red-400"
                          aria-label="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
