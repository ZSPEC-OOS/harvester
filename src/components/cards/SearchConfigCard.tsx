import { Info } from 'lucide-react';
import { Checkbox } from '../ui/Checkbox';
import { GlassCard } from '../ui/GlassCard';
import { Slider } from '../ui/Slider';

type Props = {
  query: string;
  setQuery: (v: string) => void;
  startYear: number;
  setStartYear: (v: number) => void;
  endYear: number;
  setEndYear: (v: number) => void;
  searchDepth: number;
  setSearchDepth: (v: number) => void;
  includePreprints: boolean;
  setIncludePreprints: (v: boolean) => void;
  excludePatents: boolean;
  setExcludePatents: (v: boolean) => void;
  onlyOpenAccess: boolean;
  setOnlyOpenAccess: (v: boolean) => void;
};

export function SearchConfigCard(props: Props) {
  return (
    <GlassCard className="border-blue-300/20 p-4 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-white sm:text-3xl">
        STEP 1: BUILD SEARCH QUERY <Info size={18} className="text-slate-400" />
      </h2>

      <label className="mb-3 block text-slate-300" htmlFor="topic">
        Research Topic
      </label>
      <input
        id="topic"
        value={props.query}
        onChange={(e) => props.setQuery(e.target.value)}
        className="mb-4 w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-3 text-white"
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-slate-300">
          <span className="sr-only">Start Year</span>
          <select
            value={props.startYear}
            onChange={(e) => props.setStartYear(Number(e.target.value))}
            className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-3 text-white"
          >
            {Array.from({ length: 13 }, (_, i) => 2013 + i).map((year) => (
              <option key={year} value={year}>
                Start Year: {year}
              </option>
            ))}
          </select>
        </label>

        <label className="text-slate-300">
          <span className="sr-only">End Year</span>
          <select
            value={props.endYear}
            onChange={(e) => props.setEndYear(Number(e.target.value))}
            className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-3 text-white"
          >
            {Array.from({ length: 13 }, (_, i) => 2013 + i).map((year) => (
              <option key={year} value={year}>
                End Year: {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mb-2 text-lg text-slate-300">Search Depth: {props.searchDepth} Scholar Pages (~{props.searchDepth * 10} results)</p>
      <div className="mb-4 flex items-center gap-3 text-slate-300">
        <span>1</span>
        <Slider id="depth" value={props.searchDepth} onChange={props.setSearchDepth} />
        <span>10</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Checkbox id="include-preprints" checked={props.includePreprints} onChange={props.setIncludePreprints} label="Include preprints" />
        <Checkbox id="exclude-patents" checked={props.excludePatents} onChange={props.setExcludePatents} label="Exclude patents" />
        <Checkbox id="only-oa" checked={props.onlyOpenAccess} onChange={props.setOnlyOpenAccess} label="Only open access when available" />
      </div>
    </GlassCard>
  );
}
