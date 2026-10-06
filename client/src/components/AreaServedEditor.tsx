import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  areaServedTypes,
  createAreaServedEntry,
  type AreaServedEntry,
} from "@adster/schema-core";
import { Plus, Trash2 } from "lucide-react";

const fieldClass = "h-10 rounded-xl border-border/80 bg-white/75 px-3 text-[13px] shadow-[0_1px_0_rgba(255,255,255,0.7)] placeholder:text-muted-foreground/65 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-[#102b40] dark:shadow-none";

type AreaServedEditorProps = {
  value: AreaServedEntry[];
  onChange: (value: AreaServedEntry[]) => void;
};

export function AreaServedEditor({ value, onChange }: AreaServedEditorProps) {
  const entries = value.length > 0 ? value : [{ id: "new-service-area", type: "City" as const, name: "" }];
  const updateEntry = (id: string, update: Partial<AreaServedEntry>) => {
    onChange(entries.map(entry => entry.id === id ? { ...entry, ...update } : entry));
  };

  return (
    <div className="space-y-2.5 rounded-xl border border-border/80 bg-secondary/[0.18] p-3 dark:bg-[#102b40]/60">
      {entries.map((entry, index) => (
        <div key={entry.id} className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-end">
          <div>
            <p className="mb-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Type</p>
            <select
              aria-label={`Area served ${index + 1} type`}
              value={entry.type}
              onChange={event => updateEntry(entry.id, { type: event.target.value as AreaServedEntry["type"] })}
              className={`${fieldClass} w-full`}
            >
              {areaServedTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <p className="mb-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Area</p>
            <Input
              aria-label={`Area served ${index + 1} name`}
              value={entry.name}
              onChange={event => updateEntry(entry.id, { name: event.target.value })}
              className={fieldClass}
              placeholder={entry.type === "City" ? "e.g. Edmonton" : entry.type === "State" ? "e.g. Alberta" : "e.g. Canada"}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            aria-label={`Remove service area ${index + 1}`}
            onClick={() => onChange(entries.length > 1 ? entries.filter(item => item.id !== entry.id) : [])}
            className="h-10 w-10 shrink-0 rounded-xl border-border/80 p-0 text-muted-foreground hover:border-destructive/35 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...entries, createAreaServedEntry()])} className="h-9 w-full gap-2 rounded-lg border-dashed bg-transparent text-[11px] hover:bg-secondary/70">
        <Plus className="h-3.5 w-3.5" /> Add service area
      </Button>
    </div>
  );
}
