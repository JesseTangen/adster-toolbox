import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { checklistDefinitions, getChecklistItemCount, type ChecklistDefinition } from "@adster/checklists";
import { CheckCheck, CheckCircle2, ClipboardCheck, Filter, ListChecks, RotateCcw, SearchCheck, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ChecklistProgress = Record<string, Record<string, boolean>>;
type ChecklistNotes = Record<string, Record<string, string>>;
type FilterMode = "all" | "remaining";

const STORAGE_KEY = "adster-qa-checklist-progress";
const NOTES_STORAGE_KEY = "adster-qa-checklist-notes";

function listProgress(list: ChecklistDefinition, entries: Record<string, boolean>) {
  const total = getChecklistItemCount(list);
  const complete = list.sections.reduce((count, currentSection) => count + currentSection.items.filter(currentItem => entries[currentItem.id]).length, 0);
  return { total, complete, percentage: total ? Math.round((complete / total) * 100) : 0 };
}

export default function QaChecklists() {
  const [activeId, setActiveId] = useState(checklistDefinitions[0]?.id ?? "");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [progress, setProgress] = useState<ChecklistProgress>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as ChecklistProgress;
    } catch {
      return {};
    }
  });
  const [notes, setNotes] = useState<ChecklistNotes>(() => {
    try {
      return JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) ?? "{}") as ChecklistNotes;
    } catch {
      return {};
    }
  });

  const activeList = checklistDefinitions.find(list => list.id === activeId) ?? checklistDefinitions[0];
  const currentEntries = progress[activeList?.id ?? ""] ?? {};
  const currentNotes = notes[activeList?.id ?? ""] ?? {};
  const activeProgress = activeList ? listProgress(activeList, currentEntries) : { total: 0, complete: 0, percentage: 0 };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const toggleItem = (itemId: string, checked: boolean) => {
    if (!activeList) return;
    setProgress(current => ({
      ...current,
      [activeList.id]: { ...current[activeList.id], [itemId]: checked },
    }));
  };

  const clearProgress = () => {
    if (!activeList || activeProgress.complete === 0) return;
    setProgress(current => ({ ...current, [activeList.id]: {} }));
    toast.success(`${activeList.name} progress cleared`);
  };

  const updateNote = (itemId: string, note: string) => {
    if (!activeList) return;
    setNotes(current => ({
      ...current,
      [activeList.id]: { ...current[activeList.id], [itemId]: note },
    }));
  };

  const visibleSections = useMemo(() => activeList?.sections.map(currentSection => ({
    ...currentSection,
    items: currentSection.items.filter(currentItem => filter === "all" || !currentEntries[currentItem.id]),
  })).filter(currentSection => currentSection.items.length > 0) ?? [], [activeList, currentEntries, filter]);

  if (!activeList) return null;

  return (
    <div className="mx-auto w-full max-w-[1600px] pb-10">
      <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-border/80 bg-background/95 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ClipboardCheck className="h-5 w-5" /></div>
          <div className="min-w-0"><p className="font-editorial text-xl leading-none tracking-tight">QA Checklists</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground">Adster Creative Toolbox</p></div>
        </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-white p-1 dark:bg-[#102b40]">
          <Button size="sm" variant={filter === "all" ? "default" : "ghost"} onClick={() => setFilter("all")} className="h-8 rounded-lg px-3 text-[11px]">All checks</Button>
          <Button size="sm" variant={filter === "remaining" ? "default" : "ghost"} onClick={() => setFilter("remaining")} className="h-8 gap-1.5 rounded-lg px-3 text-[11px]"><Filter className="h-3.5 w-3.5" />Remaining</Button>
        </div>
      </header>

      <div className="mt-5 grid gap-5 2xl:grid-cols-[260px_minmax(0,1fr)_280px]">
        <aside className="space-y-3 2xl:sticky 2xl:top-24 2xl:self-start">
          <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]">
            <div className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary" /><div><p className="text-sm font-semibold">QA list library</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">Choose a review workflow. Your checked items stay in this browser.</p></div></div>
          </div>
          <div className="space-y-2 rounded-2xl border border-border/80 bg-card/70 p-2 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]">
            {checklistDefinitions.map(list => {
              const listState = listProgress(list, progress[list.id] ?? {});
              const selected = list.id === activeList.id;
              return <button key={list.id} onClick={() => setActiveId(list.id)} className={`w-full rounded-xl border px-3 py-3 text-left transition ${selected ? "border-primary/35 bg-primary/[0.07] shadow-sm" : "border-transparent hover:border-primary/20 hover:bg-primary/[0.025]"}`}>
                <div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold leading-4">{list.name}</p><span className={`shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.08em] ${listState.percentage === 100 ? "bg-emerald-100 text-emerald-700 dark:bg-primary/15 dark:text-primary" : "bg-secondary text-secondary-foreground"}`}>{listState.complete}/{listState.total}</span></div>
                <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-muted-foreground">{list.shortDescription}</p>
              </button>;
            })}
          </div>
        </aside>

        <main className="min-w-0">
          <section className="rounded-[1.5rem] border border-border/80 bg-white/70 p-5 shadow-[0_20px_55px_-40px_rgba(0,92,145,0.55)] sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl"><p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-primary">Quality review workflow</p><h1 className="mt-2 font-editorial text-3xl leading-tight tracking-tight sm:text-4xl">{activeList.name}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{activeList.description}</p>{activeList.updatedLabel ? <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.11em] text-muted-foreground">{activeList.updatedLabel}</p> : null}</div>
              <div className="shrink-0 rounded-2xl border border-primary/15 bg-primary/[0.035] px-4 py-3 text-left lg:w-44"><p className="font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-primary">Completion</p><p className="mt-2 text-2xl font-semibold">{activeProgress.percentage}%</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{activeProgress.complete} of {activeProgress.total} checks complete</p></div>
            </div>
            <div className="mt-6"><Progress value={activeProgress.percentage} className="h-2 bg-secondary" /></div>
          </section>

          <div className="mt-5 space-y-3">
            {visibleSections.map(currentSection => {
              const sectionComplete = currentSection.items.filter(currentItem => currentEntries[currentItem.id]).length;
              return <details key={currentSection.id} open className="group rounded-2xl border border-border/80 bg-card/80 shadow-[0_16px_38px_-32px_rgba(0,92,145,0.5)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4"><div><p className="text-sm font-semibold">{currentSection.title}</p>{currentSection.description ? <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{currentSection.description}</p> : null}</div><div className="flex shrink-0 items-center gap-2"><span className="rounded-full bg-secondary px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-secondary-foreground">{sectionComplete}/{currentSection.items.length}</span><CheckCheck className="h-4 w-4 text-primary transition group-open:rotate-180" /></div></summary>
                <div className="border-t border-border/70 px-5 py-2">
                  {currentSection.items.map(currentItem => {
                    const checked = Boolean(currentEntries[currentItem.id]);
                    const inputId = `${activeList.id}-${currentItem.id}`;
                    const note = currentNotes[currentItem.id] ?? "";
                    return <div key={currentItem.id} className={`border-b border-border/50 py-4 last:border-0 ${checked ? "opacity-65" : ""}`}>
                      <div className="flex gap-3"><input id={inputId} type="checkbox" checked={checked} onChange={event => toggleItem(currentItem.id, event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-[oklch(0.7_0.14_220)] dark:accent-[#00aeef]" /><label htmlFor={inputId} className="min-w-0 cursor-pointer"><span className={`block text-xs leading-5 ${checked ? "line-through" : ""}`}>{currentItem.label}{currentItem.required ? <span className="ml-1.5 font-mono text-[8px] uppercase tracking-[0.08em] text-primary">Required</span> : null}</span>{currentItem.guidance ? <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{currentItem.guidance}</span> : null}</label></div>
                      <details className="ml-7 mt-2 text-left"><summary className="cursor-pointer font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-primary">{note ? "Edit note" : "Add note"}</summary><Textarea aria-label={`Notes for ${currentItem.label}`} value={note} onChange={event => updateNote(currentItem.id, event.target.value)} placeholder="Add evidence, an owner, a follow-up, or a review finding." className="mt-2 min-h-[78px] rounded-xl bg-white text-xs leading-5 dark:bg-[#102b40]" /></details>
                    </div>;
                  })}
                </div>
              </details>;
            })}
            {visibleSections.length === 0 ? <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/[0.025] px-5 py-10 text-center"><CheckCircle2 className="mx-auto h-6 w-6 text-primary" /><p className="mt-3 text-sm font-semibold">All checks are complete</p><p className="mt-1 text-xs text-muted-foreground">Switch back to All checks to review the completed items.</p></div> : null}
          </div>
        </main>

        <aside className="space-y-4 2xl:sticky 2xl:top-24 2xl:self-start">
          <div className="rounded-2xl border border-border/80 bg-card/85 p-5 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">Review status</p></div><p className="mt-2 text-xs leading-5 text-muted-foreground">Use this module to record which checks have been performed. A completed item does not replace the supporting evidence or approval required by the relevant workflow.</p><div className="mt-5 rounded-xl border border-border bg-white px-3 py-3 dark:bg-[#102b40]"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Current list</p><p className="mt-1 text-sm font-semibold">{activeProgress.complete} / {activeProgress.total} complete</p></div><Button variant="outline" onClick={clearProgress} disabled={activeProgress.complete === 0} className="mt-3 h-9 w-full gap-1.5 rounded-xl bg-white text-xs dark:bg-[#102b40]"><RotateCcw className="h-3.5 w-3.5" />Clear this list</Button></div>
        </aside>
      </div>
    </div>
  );
}
