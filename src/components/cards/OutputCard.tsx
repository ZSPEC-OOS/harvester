import { Checkbox } from '../ui/Checkbox';
import { GlassCard } from '../ui/GlassCard';
import { RadioGroup } from '../ui/RadioGroup';

type Props = {
  outputDir: string;
  setOutputDir: (value: string) => void;
  naming: string;
  setNaming: (value: string) => void;
  bibtex: boolean;
  setBibtex: (value: boolean) => void;
  zotero: boolean;
  setZotero: (value: boolean) => void;
};

export function OutputCard(props: Props) {
  return (
    <GlassCard className="p-4 sm:p-6">
      <h2 className="mb-4 text-2xl font-semibold text-white sm:text-3xl">STEP 3: OUTPUT & ORGANIZATION</h2>

      <label className="mb-2 block text-slate-300" htmlFor="output-dir">
        Download Directory
      </label>
      <input
        id="output-dir"
        value={props.outputDir}
        onChange={(e) => props.setOutputDir(e.target.value)}
        className="mb-4 w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-3 text-white"
      />

      <div className="mb-4">
        <RadioGroup
          name="naming"
          value={props.naming}
          onChange={props.setNaming}
          options={[
            { value: 'author-year-title', label: 'Author_Year_Title' },
            { value: 'original', label: 'Keep original' },
            { value: 'doi', label: 'DOI only' },
          ]}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Checkbox id="bibtex" checked={props.bibtex} onChange={props.setBibtex} label="Generate BibTeX" />
          <Checkbox id="zotero" checked={props.zotero} onChange={props.setZotero} label="Auto-import to Zotero" />
        </div>
        <span className="inline-flex w-fit rounded-full border border-emerald-500/60 bg-emerald-600/20 px-3 py-1 text-emerald-300">Connected</span>
      </div>
    </GlassCard>
  );
}
