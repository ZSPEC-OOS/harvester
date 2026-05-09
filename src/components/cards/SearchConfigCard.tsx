import { Checkbox } from '../ui/Checkbox';
import { GlassCard } from '../ui/GlassCard';
import { Slider } from '../ui/Slider';

type Props = {
  topic: string;
  setTopic: (v: string) => void;
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
  referenceStyle: string;
  setReferenceStyle: (v: string) => void;
};

export function SearchConfigCard(props: Props) {
  return (
    <GlassCard className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-[#F3F6FB]">Search Configuration</h3>

      <div className="space-y-2.5">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]" htmlFor="topic">
            Topic
          </label>
          <input
            id="topic"
            value={props.topic}
            onChange={(e) => props.setTopic(e.target.value)}
            className="ds-input"
            placeholder="e.g. foundation models for protein design"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]" htmlFor="reference-style">
            Citation Style
          </label>
          <select
            id="reference-style"
            value={props.referenceStyle}
            onChange={(e) => props.setReferenceStyle(e.target.value)}
            className="ds-input"
          >
            <option value="apa">APA</option>
            <option value="mla">MLA</option>
            <option value="chicago">Chicago</option>
            <option value="vancouver">Vancouver</option>
            <option value="doi-only">DOI only</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]" htmlFor="start-year">
              Start Year
            </label>
            <input
              id="start-year"
              type="number"
              min={1900}
              max={props.endYear}
              value={props.startYear}
              onChange={(e) => props.setStartYear(Number(e.target.value))}
              className="ds-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]" htmlFor="end-year">
              End Year
            </label>
            <input
              id="end-year"
              type="number"
              min={props.startYear}
              max={new Date().getFullYear()}
              value={props.endYear}
              onChange={(e) => props.setEndYear(Number(e.target.value))}
              className="ds-input"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium text-[#94A3B8]" htmlFor="depth">
              Search Breadth
            </label>
            <span className="text-xs text-slate-300">{props.searchDepth} passes</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>1</span>
            <Slider id="depth" value={props.searchDepth} onChange={props.setSearchDepth} min={1} max={500} />
            <span>500</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <Checkbox id="include-preprints" checked={props.includePreprints} onChange={props.setIncludePreprints} label="Preprints" />
          <Checkbox id="exclude-patents" checked={props.excludePatents} onChange={props.setExcludePatents} label="No patents" />
          <Checkbox id="only-oa" checked={props.onlyOpenAccess} onChange={props.setOnlyOpenAccess} label="Open access" />
        </div>
      </div>
    </GlassCard>
  );
}
