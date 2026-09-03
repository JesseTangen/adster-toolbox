import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SavedProject } from "@/lib/savedProjects";
import { Check, Copy, FolderOpen, LoaderCircle, Plus, Trash2 } from "lucide-react";

type SaveStatus = "loading" | "saving" | "saved" | "error";

type SavedProjectsCardProps<T> = {
  label: string;
  projectNameLabel: string;
  projects: SavedProject<T>[];
  activeProjectId: string;
  projectName: string;
  status: SaveStatus;
  onSelect: (id: string) => void;
  onProjectNameChange: (value: string) => void;
  onNew: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

function relativeDate(timestamp: number) {
  const elapsed = Math.max(0, Date.now() - timestamp);
  if (elapsed < 60_000) return "Just now";
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
  return `${Math.floor(elapsed / 86_400_000)}d ago`;
}

export function SavedProjectsCard<T>({
  label,
  projectNameLabel,
  projects,
  activeProjectId,
  projectName,
  status,
  onSelect,
  onProjectNameChange,
  onNew,
  onDuplicate,
  onDelete,
}: SavedProjectsCardProps<T>) {
  const statusLabel = status === "loading" ? "Loading local projects" : status === "saving" ? "Saving locally" : status === "error" ? "Save needs attention" : "Saved locally";
  const StatusIcon = status === "loading" || status === "saving" ? LoaderCircle : status === "error" ? FolderOpen : Check;

  return (
    <section className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]" aria-label={`${label} saved projects`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FolderOpen className="h-4 w-4" /></div>
          <div className="min-w-0"><p className="text-sm font-semibold">Saved {label}</p><p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">Stored in this browser.</p></div>
        </div>
        <span className={`flex shrink-0 items-center gap-1 font-mono text-[8px] uppercase tracking-[0.08em] ${status === "error" ? "text-destructive" : "text-primary"}`} aria-live="polite"><StatusIcon className={`h-3 w-3 ${status === "loading" || status === "saving" ? "animate-spin" : ""}`} />{statusLabel}</span>
      </div>

      <div className="mt-4 space-y-2">
        <label className="block"><span className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">Open project</span><select aria-label={`Open saved ${label}`} value={activeProjectId} onChange={event => onSelect(event.target.value)} disabled={status === "loading" || projects.length === 0} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 dark:bg-[#102b40]">{projects.map(project => <option key={project.id} value={project.id}>{project.name} · {relativeDate(project.updatedAt)}</option>)}</select></label>
        <label className="block"><span className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">{projectNameLabel}</span><Input aria-label={projectNameLabel} value={projectName} onChange={event => onProjectNameChange(event.target.value)} disabled={status === "loading"} className="mt-1.5 h-10 rounded-xl bg-white text-xs dark:bg-[#102b40]" /></label>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Button size="sm" onClick={onNew} disabled={status === "loading"} className="h-8 gap-1 rounded-lg px-2 text-[10px]"><Plus className="h-3 w-3" />New</Button>
        <Button size="sm" variant="outline" onClick={onDuplicate} disabled={status === "loading"} className="h-8 gap-1 rounded-lg bg-white px-2 text-[10px] dark:bg-[#102b40]"><Copy className="h-3 w-3" />Copy</Button>
        <Button size="sm" variant="outline" onClick={onDelete} disabled={status === "loading"} className="h-8 gap-1 rounded-lg border-destructive/30 bg-white px-2 text-[10px] text-destructive hover:bg-destructive/5 hover:text-destructive dark:bg-[#102b40]"><Trash2 className="h-3 w-3" />Delete</Button>
      </div>
    </section>
  );
}
