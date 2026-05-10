import { SlidersHorizontal } from 'lucide-react';
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

const inputCls = 'w-full rounded-lg px-3 py-2 text-sm transition input-recessed';
const labelCls = 'mb-1.5 block text-[11px] font-medium tracking-wide uppercase' as const;

export function SearchConfigCard(props: Props) {
  return (
    <GlassCard className="p-4">
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'rgba(33,85,214,0.18)', color: '#7BAAEE' }}
        >
          <SlidersHorizontal size={13} />
        </span>
        <h3 className="text-sm font-semibold" style={{ color: '#F3F6FB' }}>
          Search Configuration
        </h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className={labelCls} htmlFor="topic" style={{ color: '#8AAAC6' }}>
            Topic
          </label>
          <input
            id="topic"
            value={props.topic}
            onChange={(e) => props.setTopic(e.target.value)}
            className={inputCls}
            placeholder="e.g. foundation models for protein design"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="reference-style" style={{ color: '#8AAAC6' }}>
            Citation Style
          </label>
          <select
            id="reference-style"
            value={props.referenceStyle}
            onChange={(e) => props.setReferenceStyle(e.target.value)}
            className={`${inputCls} select input-recessed`}
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
            <label className={labelCls} htmlFor="start-year" style={{ color: '#8AAAC6' }}>
              Start Year
            </label>
            <input
              id="start-year"
              type="number"
              min={1900}
              max={props.endYear}
              value={props.startYear}
              onChange={(e) => props.setStartYear(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="end-year" style={{ color: '#8AAAC6' }}>
              End Year
            </label>
            <input
              id="end-year"
              type="number"
              min={props.startYear}
              max={new Date().getFullYear()}
              value={props.endYear}
              onChange={(e) => props.setEndYear(Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className={labelCls} htmlFor="depth" style={{ color: '#8AAAC6' }}>
              Search Breadth
            </label>
            <span className="text-xs font-medium" style={{ color: '#AABDD3' }}>
              {props.searchDepth} passes
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]" style={{ color: '#607A9E' }}>
            <span>1</span>
            <Slider id="depth" value={props.searchDepth} onChange={props.setSearchDepth} min={1} max={500} />
            <span>500</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-lg pt-0.5">
          <Checkbox id="include-preprints" checked={props.includePreprints} onChange={props.setIncludePreprints} label="Preprints" />
          <Checkbox id="exclude-patents"   checked={props.excludePatents}   onChange={props.setExcludePatents}   label="No patents" />
          <Checkbox id="only-oa"           checked={props.onlyOpenAccess}   onChange={props.setOnlyOpenAccess}   label="Open access" />
        </div>
      </div>
    </GlassCard>
  );
}
