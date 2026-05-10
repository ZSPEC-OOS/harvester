import { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ActionCard } from '../components/cards/ActionCard';
import { ApiConfigCard, type ApiConfig } from '../components/cards/ApiConfigCard';
import { ErrorBox } from '../components/cards/ErrorBox';
import { OutputCard } from '../components/cards/OutputCard';
import { ReferenceResultsCard } from '../components/cards/ReferenceResultsCard';
import { SearchConfigCard } from '../components/cards/SearchConfigCard';
import { ActiveSourcesCard } from '../components/cards/ActiveSourcesCard';
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
};

export type Paper = {
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

const formatPaperCitation = (paper: Paper, index: number, style: string): string => {
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

const isPreprint = (p: Paper): boolean => {
  const prov = p.provider.toLowerCase();
  return prov.includes('arxiv') || prov.includes('biorxiv') || prov.includes('medrxiv') || p.url.includes('arxiv.org');
};

const normalizeTitle = (t: string): string =>
  t.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);

const normalizeDoi = (doi: string): string =>
  doi.replace(/^https?:\/\/doi\.org\//i, '').toLowerCase().trim();

const buildExport = (
  papers: Paper[],
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
      `Reference style: ${styleLabelMap[style] ?? style}`,
      `Generated references: ${papers.length}`,
      '',
      ...formatted,
    ].join('\n'),
    filename: 'deepscholar-export.txt',
    mime: 'text/plain',
  };
};

const fetchPubMed = async (query: string): Promise<Paper[]> => {
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
      } satisfies Paper,
    ];
  });
};

const fetchEuropePmc = async (query: string): Promise<Paper[]> => {
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
    }): Paper => ({
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

const fetchCORE = async (query: string): Promise<Paper[]> => {
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
    }): Paper => ({
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

const fetchERIC = async (query: string): Promise<Paper[]> => {
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
    }): Paper => ({
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

const generateSubQueriesWithAi = async (
  topic: string,
  expandedTopic: string,
  count: number,
  api: ApiConfig,
): Promise<string[] | null> => {
  const { baseUrl, apiKey, modelId } = api;
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: modelId || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You optimize literature discovery. Return ONLY valid JSON with shape {"queries":["..."]}. Create highly targeted sub-queries for database APIs. Keep each query under 18 words and centered on relevance to the expanded topic.',
        },
        {
          role: 'user',
          content: `Topic: ${topic}\nExpanded topic:\n${expandedTopic}\nNeed exactly ${count} deduplicated sub-queries.`,
        },
      ],
      max_tokens: 700,
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  const raw: string = data.choices?.[0]?.message?.content ?? '';
  let parsed: unknown = null;
  try {
    const jsonText = raw.replace(/```json|```/g, '').trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : jsonText);
  } catch {
    return null;
  }
  const queries = Array.isArray((parsed as { queries?: unknown }).queries)
    ? (parsed as { queries: unknown[] }).queries
    : [];
  const clean: string[] = queries
    .map((q: unknown) => (typeof q === 'string' ? q.trim() : ''))
    .filter((q: string): q is string => typeof q === 'string' && q.length > 3);
  const deduped: string[] = [...new Set(clean)];
  return deduped.length > 0 ? deduped.slice(0, count) : null;
};

const formatHistoryDate = (ts: number) =>
  new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// ── Component ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('paper-harvester-settings');
    if (!saved) return initialSettings;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...initialSettings,
        ...parsed,
        topic: '',
        apiConfig: { ...initialSettings.apiConfig, ...parsed.apiConfig },
      };
    } catch {
      return initialSettings;
    }
  });

  const [expandedTopic, setExpandedTopic] = useState('');
  const [expandedTopicDraft, setExpandedTopicDraft] = useState('');
  const [expansionAccepted, setExpansionAccepted] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  const [papers, setPapers] = useState<Paper[]>([]);
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
    try {
      return saved ? (JSON.parse(saved) as HistoryEntry[]) : [];
    } catch {
      return [];
    }
  });
  const [restoreTopicId, setRestoreTopicId] = useState<string | null>(null);

  // ── Persistence ────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      localStorage.setItem('paper-harvester-settings', JSON.stringify(settings));
    } catch {
      // storage full
    }
  }, [settings]);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem('paper-harvester-session');
    if (!saved) return;
    try {
      const session = JSON.parse(saved) as { papers: Paper[]; expandedTopic: string; sourceCounts: Record<string, number> };
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
    if (papers.length > 8000) return;
    try {
      localStorage.setItem(
        'paper-harvester-session',
        JSON.stringify({ papers, expandedTopic, sourceCounts }),
      );
    } catch {
      // storage full
    }
  }, [papers, expandedTopic, sourceCounts]);

  // ── New Task ───────────────────────────────────────────────────────────────

  const handleNewTask = () => {
    if (isRunning) return;
    setSettings((s) => ({ ...s, topic: '' }));
    setExpandedTopic('');
    setExpandedTopicDraft('');
    setExpansionAccepted(false);
    setClarifyQuestions([]);
    setClarifyAnswers([]);
    setClarifyPhase('idle');
    setPapers([]);
    setSourceCounts({});
    setLines(seedLines);
    setActiveStep(0);
    cancelRef.current = false;
    try { localStorage.removeItem('paper-harvester-session'); } catch { /* ignore */ }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const stamp = () => new Date().toLocaleTimeString('en-US', { hour12: false });

  const apiConfigured = Boolean(settings.apiConfig.baseUrl.trim() && settings.apiConfig.apiKey.trim());

  // Estimate based on 4 direct sources × ~20 papers/pass × dedup reduction
  const displayEstimate = useMemo(
    () => Math.round(settings.searchDepth * 20 * 0.6),
    [settings.searchDepth],
  );

  const validationError = useMemo(() => {
    if (!settings.topic.trim()) return 'Search Focus Topic is required.';
    if (!expandedTopic.trim() || !expansionAccepted) return 'Please process expansion and click Accept before running.';
    if (settings.startYear > settings.endYear) return 'Start year is later than end year.';
    if (settings.startYear < 1900 || settings.endYear > CURRENT_YEAR)
      return `Year range must be between 1900 and ${CURRENT_YEAR}.`;
    return null;
  }, [expandedTopic, expansionAccepted, settings]);

  // ── Topic expansion ────────────────────────────────────────────────────────

  const processExpansion = async () => {
    if (!settings.topic.trim()) return;
    setClarifyPhase('loading');

    if (apiConfigured) {
      const { baseUrl, apiKey, modelId, nickname } = settings.apiConfig;
      setLines((prev) => [...prev, `[${stamp()}] ${nickname || 'AI'} generating focused questions…`]);
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
      setLines((prev) => [...prev, `[${stamp()}] Calling ${nickname || 'AI'} for topic expansion…`]);
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
        setLines((prev) => [...prev, `[${stamp()}] Expansion received from ${nickname || 'AI'}`]);
        setIsExpanding(false);
        return;
      } catch (err) {
        setLines((prev) => [
          ...prev,
          `[${stamp()}] AI error: ${String(err)} — falling back to local expansion`,
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

  const runAiVerification = async (papersToVerify: Paper[]): Promise<Paper[]> => {
    if (!apiConfigured) {
      setLines((prev) => [...prev, `[${stamp()}] AI verification skipped — no API configured`]);
      return papersToVerify;
    }

    setIsVerifying(true);
    setLines((prev) => [
      ...prev,
      `[${stamp()}] Running AI relevance filter across ${papersToVerify.length} papers…`,
    ]);

    const { baseUrl, apiKey, modelId } = settings.apiConfig;
    const batchSize = 20;
    let totalRemoved = 0;
    const allVerified: Paper[] = [];

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
                  `You are a research relevance filter. Keep papers that are genuinely relevant to the expanded topic below, and remove papers that are off-topic, weakly related, or clearly low-signal.
Expanded topic:
${expandedTopicDraft.trim() || expandedTopic}
Return ONLY JSON: {"remove":[indices]}. Be conservative with removals when uncertain.`,
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
      `[${stamp()}] Relevance filtering complete — ${allVerified.length} papers kept${totalRemoved > 0 ? `, ${totalRemoved} removed` : ''}`,
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
    const localQueries = generateSubQueries(settings.topic, finalTopic, passes);

    // Fire AI sub-query generation concurrently — direct sources start immediately.
    // AI queries are applied from the first pass where they resolve.
    let resolvedAiQueries: string[] | null = null;
    let aiQueriesLogged = false;
    if (apiConfigured) {
      generateSubQueriesWithAi(settings.topic, finalTopic, passes, settings.apiConfig)
        .then((aiQueries) => {
          if (aiQueries && aiQueries.length > 0) {
            while (aiQueries.length < passes) aiQueries.push(settings.topic);
            resolvedAiQueries = aiQueries;
          }
        })
        .catch((err) => {
          setLines((prev) => [
            ...prev,
            `[${stamp()}] AI sub-query generation failed (${String(err)}) — using local query planner`,
          ]);
        });
    }

    const seenDois = new Set<string>();
    const seenTitles = new Set<string>();
    let totalCount = 0;
    let emptyStreak = 0;
    const MAX_EMPTY_STREAK = 3;
    const allPapers: Paper[] = [];
    const runSourceCounts: Record<string, number> = {};

    setLines((prev) => [
      ...prev,
      `[${stamp()}] Starting AI-driven search across PubMed · Europe PMC · CORE · ERIC — up to ${passes} passes`,
    ]);

    for (let i = 0; i < passes; i++) {
      if (cancelRef.current) break;

      const query = resolvedAiQueries?.[i] ?? localQueries[i] ?? settings.topic;
      if (resolvedAiQueries && !aiQueriesLogged) {
        aiQueriesLogged = true;
        setLines((prev) => [
          ...prev,
          `[${stamp()}] AI targeted sub-queries ready — applying from pass ${i + 1}`,
        ]);
      }

      setActiveStep(
        Math.min(deepResearchProcess.length - 1, Math.floor((i / passes) * deepResearchProcess.length)),
      );

      try {
        const settled = await Promise.allSettled([
          fetchPubMed(query),
          fetchEuropePmc(query),
          fetchCORE(query),
          fetchERIC(query),
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

        // Dedup: prefer DOI, fall back to normalized title
        const newPapers = filtered.filter((p) => {
          if (p.doi) {
            const nd = normalizeDoi(p.doi);
            if (seenDois.has(nd)) return false;
            seenDois.add(nd);
          }
          const nt = normalizeTitle(p.title);
          if (seenTitles.has(nt)) return false;
          seenTitles.add(nt);
          return true;
        });

        if (newPapers.length > 0) {
          emptyStreak = 0;

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
      const verified = await runAiVerification(allPapers);
      setPapers(verified);

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
          <h2
            className="mb-3 text-base font-semibold"
            style={{ color: '#F3F6FB' }}
          >
            Research Topic
          </h2>
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
            className="w-full rounded-lg px-4 py-3 text-sm transition input-recessed"
            placeholder="e.g. foundation models for protein design"
          />

          {clarifyPhase !== 'pending' && (
            <div className="mt-3">
              <button
                type="button"
                onClick={processExpansion}
                disabled={!settings.topic.trim() || isExpanding || clarifyPhase === 'loading'}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-35"
                style={{
                  background: 'linear-gradient(135deg, #2155D6 0%, #26BFA6 100%)',
                  border: '1px solid rgba(38,191,166,0.30)',
                  boxShadow: '0 4px 20px rgba(33,85,214,0.32), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                {clarifyPhase === 'loading' ? 'Generating questions…' : isExpanding ? 'Processing…' : 'Process Expansion'}
              </button>
            </div>
          )}

          {/* AI-generated topic-specific clarifying questions */}
          {clarifyPhase === 'pending' && clarifyQuestions.length > 0 && (
            <div
              className="mt-3 space-y-3 rounded-lg p-4"
              style={{
                background: 'rgba(8,18,44,0.68)',
                border: '1px solid rgba(33,85,214,0.28)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: '#93B4FF' }}>
                Answer to sharpen the search — all optional, skip any you don't need.
              </p>
              {clarifyQuestions.map((q, i) => (
                <div key={i}>
                  <label
                    className="mb-1.5 block text-[11px] uppercase tracking-wide"
                    style={{ color: '#8AAAC6' }}
                  >
                    {q.question}
                  </label>
                  <input
                    value={clarifyAnswers[i] ?? ''}
                    onChange={(e) => {
                      const next = [...clarifyAnswers];
                      next[i] = e.target.value;
                      setClarifyAnswers(next);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-xs transition input-recessed"
                    placeholder={q.placeholder}
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => runExpansion()}
                  disabled={isExpanding}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-35"
                  style={{
                    background: 'linear-gradient(135deg, #2155D6 0%, #26BFA6 100%)',
                    border: '1px solid rgba(38,191,166,0.30)',
                    boxShadow: '0 4px 16px rgba(33,85,214,0.28)',
                  }}
                >
                  {isExpanding ? 'Processing…' : 'Continue with Expansion'}
                </button>
                <button
                  type="button"
                  onClick={() => runExpansion([], [])}
                  disabled={isExpanding}
                  className="rounded-lg px-4 py-2 text-sm transition disabled:opacity-40"
                  style={{
                    border: '1px solid rgba(130,155,200,0.26)',
                    color: '#64748B',
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {expandedTopic && (
            <div className="mt-4 space-y-3">
              <div>
                <p
                  className="mb-1.5 text-[11px] font-medium uppercase tracking-wide"
                  style={{ color: '#8AAAC6' }}
                >
                  Expanded Scope
                </p>
                <textarea
                  value={expandedTopic}
                  readOnly
                  className="min-h-[110px] w-full rounded-lg px-4 py-3 text-xs leading-relaxed"
                  style={{
                    background: 'rgba(6,14,36,0.80)',
                    border: '1px solid rgba(130,155,200,0.17)',
                    color: '#AABDD3',
                    boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.35)',
                    resize: 'none',
                  }}
                />
              </div>
              <div>
                <p
                  className="mb-1.5 text-[11px] font-medium uppercase tracking-wide"
                  style={{ color: '#8AAAC6' }}
                >
                  Refine (optional)
                </p>
                <textarea
                  value={expandedTopicDraft}
                  onChange={(e) => {
                    setExpandedTopicDraft(e.target.value);
                    setExpansionAccepted(false);
                  }}
                  className="min-h-[110px] w-full rounded-lg px-4 py-3 text-xs leading-relaxed transition input-recessed"
                  style={{ color: '#E8EDF5' }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setExpandedTopic(expandedTopicDraft.trim() || expandedTopic);
                  setExpansionAccepted(true);
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium transition"
                style={
                  expansionAccepted
                    ? {
                        background: 'rgba(16,185,129,0.10)',
                        border: '1px solid rgba(16,185,129,0.30)',
                        color: '#6EE7B7',
                        boxShadow: '0 0 12px rgba(16,185,129,0.12)',
                      }
                    : {
                        background: 'rgba(16,185,129,0.07)',
                        border: '1px solid rgba(16,185,129,0.22)',
                        color: '#6EE7B7',
                      }
                }
              >
                {expansionAccepted ? 'Accepted ✓' : 'Accept & Confirm'}
              </button>
            </div>
          )}
        </GlassCard>

        {/* Research Steps */}
        <GlassCard className="p-5">
          <h2
            className="mb-3 text-base font-semibold"
            style={{ color: '#F3F6FB' }}
          >
            Research Steps
          </h2>
          <div className="space-y-1">
            {deepResearchProcess.map((item, i) => {
              const isActive = isRunning && i === activeStep;
              const isDone = !isRunning && papers.length > 0 && i <= activeStep;
              return (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all"
                  style={
                    isActive
                      ? {
                          background: 'rgba(33,85,214,0.10)',
                          color: '#E8EDF5',
                          boxShadow: 'inset 0 0 0 1px rgba(33,85,214,0.18)',
                        }
                      : { color: '#475569' }
                  }
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                    style={{
                      background: isActive
                        ? '#6B9EFF'
                        : isDone
                          ? '#6EE7B7'
                          : 'rgba(100,116,139,0.4)',
                    }}
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
      isRunning, isVerifying, papers, settings, validationError,
    ],
  );

  return (
    <div className="min-h-screen bg-transparent text-white">
      <TopBar onMenuClick={() => setSettingsMenuOpen(true)} onNewTask={handleNewTask} isRunning={isRunning} />
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

        {/* Mobile bottom bar */}
        <div
          className="fixed inset-x-0 bottom-0 z-40 px-4 py-2.5 backdrop-blur-xl xl:hidden"
          style={{
            background: 'rgba(5,8,22,0.97)',
            borderTop: '1px solid rgba(120,140,180,0.09)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.45)',
          }}
        >
          <button
            onClick={() => setSheetOpen((v) => !v)}
            className="w-full text-center text-xs font-medium transition"
            style={{ color: sheetOpen ? '#93B4FF' : '#475569' }}
          >
            {sheetOpen ? 'Hide' : 'Show'} Progress + Log
          </button>
        </div>

        {/* Mobile sheet */}
        <div
          className={`fixed inset-x-0 bottom-[42px] z-30 max-h-[70vh] overflow-auto rounded-t-2xl p-3 transition-transform xl:hidden ${sheetOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}
          style={{
            background: 'rgba(5,10,24,0.98)',
            border: '1px solid rgba(130,155,200,0.22)',
            borderBottom: 'none',
            boxShadow: '0 -16px 48px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="mx-auto mb-3 h-1 w-12 rounded-full"
            style={{ background: 'rgba(120,140,180,0.25)' }}
          />
          <div className="space-y-3">
            <CacheStats gatheredCount={papers.length} targetCount={displayEstimate} sourceCounts={sourceCounts} />
            <ConsoleLog lines={lines} />
          </div>
        </div>

        {/* Settings panel */}
        {settingsMenuOpen && (
          <div
            className="fixed inset-0 z-50 backdrop-blur-sm"
            style={{ background: 'rgba(2,5,16,0.75)' }}
            onClick={() => setSettingsMenuOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-full max-w-sm overflow-y-auto shadow-2xl"
              style={{
                background: '#050B1A',
                borderRight: '1px solid rgba(130,155,200,0.22)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 backdrop-blur"
                style={{
                  background: 'rgba(5,11,26,0.96)',
                  borderBottom: '1px solid rgba(130,155,200,0.20)',
                }}
              >
                <h2 className="text-sm font-semibold" style={{ color: '#F3F6FB' }}>
                  Settings
                </h2>
                <button
                  type="button"
                  onClick={() => setSettingsMenuOpen(false)}
                  className="rounded-md px-2.5 py-1 text-xs transition"
                  style={{
                    background: 'rgba(33,85,214,0.08)',
                    border: '1px solid rgba(130,155,200,0.28)',
                    color: '#94A3B8',
                  }}
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 p-4 pb-10">
                {/* AI Model */}
                <p className="section-label px-0.5">AI Model</p>
                <ApiConfigCard
                  config={settings.apiConfig}
                  onChange={(apiConfig) => setSettings((s) => ({ ...s, apiConfig }))}
                />

                {/* Search */}
                <p className="section-label px-0.5 pt-1">Search</p>
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
                <p className="section-label px-0.5 pt-1">Output</p>
                <OutputCard
                  expandedTopic={expandedTopic}
                  externalAiEnabled={settings.externalAiEnabled}
                  setExternalAiEnabled={(externalAiEnabled) => setSettings((s) => ({ ...s, externalAiEnabled }))}
                  apiConfigured={apiConfigured}
                  apiNickname={settings.apiConfig.nickname}
                />

                {/* History */}
                <p className="section-label px-0.5 pt-1">History</p>
                {history.length === 0 ? (
                  <p className="px-0.5 text-xs" style={{ color: '#506080' }}>
                    No completed runs yet.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {history.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg px-3 py-2"
                        style={{
                          background: 'rgba(12,24,52,0.75)',
                          border: '1px solid rgba(130,155,200,0.20)',
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          {restoreTopicId === entry.id ? (
                            <div className="space-y-1">
                              <p className="text-xs" style={{ color: '#94A3B8' }}>
                                Re-search this topic?
                              </p>
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
                                  className="rounded px-2 py-0.5 text-[10px]"
                                  style={{
                                    background: 'rgba(33,85,214,0.12)',
                                    border: '1px solid rgba(33,85,214,0.28)',
                                    color: '#93B4FF',
                                  }}
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRestoreTopicId(null)}
                                  className="rounded px-2 py-0.5 text-[10px]"
                                  style={{
                                    border: '1px solid rgba(130,155,200,0.26)',
                                    color: '#475569',
                                  }}
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
                              <p className="truncate text-xs" style={{ color: '#D4E0F0' }}>
                                {entry.topic}
                              </p>
                              <p className="text-[10px]" style={{ color: '#607A9E' }}>
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
                            try {
                              localStorage.setItem('paper-harvester-history', JSON.stringify(updated));
                            } catch {
                              // storage full
                            }
                          }}
                          className="ml-2 shrink-0 transition"
                          style={{ color: '#506080' }}
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
