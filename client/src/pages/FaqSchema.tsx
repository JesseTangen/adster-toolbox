import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Copy,
  CopyPlus,
  FilePlus2,
  Globe2,
  LoaderCircle,
  MessageCircleQuestion,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  buildFaqPageSchema,
  createFaqQuestionDraft,
  createFaqSchemaDraft,
  type FaqQuestionDraft,
  type FaqSchemaDraft,
  validateFaqSchemaDraft,
} from "@adster/schema-core";

type SavedFaqSchema = {
  id: string;
  updatedAt: number;
  draft: FaqSchemaDraft;
};

type AutoSaveStatus = "idle" | "saving" | "saved";

const SESSION_STORAGE_KEY = "schema-studio-faq-entries";
const ACTIVE_ENTRY_STORAGE_KEY = "schema-studio-faq-active-entry";

const fieldClass =
  "h-10 rounded-xl border-border/80 bg-white/75 px-3 text-[13px] shadow-[0_1px_0_rgba(255,255,255,0.7)] placeholder:text-muted-foreground/65 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-[#102b40] dark:shadow-none";
const textareaClass =
  "min-h-[118px] w-full resize-y rounded-xl border border-border/80 bg-white/75 px-3 py-2.5 text-[13px] leading-5 shadow-[0_1px_0_rgba(255,255,255,0.7)] outline-none placeholder:text-muted-foreground/65 transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 dark:bg-[#102b40] dark:shadow-none";

function FieldLabel({ name, hint }: { name: string; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <label className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-foreground/75">{name}</label>
      {hint ? <span className="text-[10px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

function SectionTitle({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <div className="mb-5 flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/5 font-mono text-[10px] text-primary">
        {index}
      </span>
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
        <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function getDraftName(draft: FaqSchemaDraft) {
  return draft.label.trim() || draft.questions.find(item => item.question.trim())?.question.trim() || "Untitled FAQ schema";
}

export default function FaqSchema() {
  const [draft, setDraft] = useState<FaqSchemaDraft>(() => createFaqSchemaDraft());
  const [entries, setEntries] = useState<SavedFaqSchema[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");

  const schema = useMemo(() => buildFaqPageSchema(draft), [draft]);
  const validation = useMemo(() => validateFaqSchemaDraft(draft), [draft]);
  const serializedSchema = useMemo(() => JSON.stringify(schema, null, 2), [schema]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const restoredEntries = JSON.parse(saved) as SavedFaqSchema[];
        setEntries(restoredEntries);
        const activeId = sessionStorage.getItem(ACTIVE_ENTRY_STORAGE_KEY);
        const activeEntry = restoredEntries.find(entry => entry.id === activeId);
        if (activeEntry) {
          setDraft(activeEntry.draft);
          setActiveEntryId(activeEntry.id);
          setAutoSaveStatus("saved");
        }
      }
    } catch {
      toast.error("Could not restore this browser session.");
    } finally {
      setSessionLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(entries));
  }, [entries, sessionLoaded]);

  const persistDraft = useCallback((draftToPersist: FaqSchemaDraft) => {
    const item: SavedFaqSchema = { id: draftToPersist.id, updatedAt: Date.now(), draft: draftToPersist };
    setEntries(current => {
      const exists = current.some(entry => entry.id === item.id);
      const nextEntries = exists ? current.map(entry => (entry.id === item.id ? item : entry)) : [item, ...current];
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextEntries));
      } catch {
        toast.error("Could not save this browser session.");
      }
      return nextEntries;
    });
    setActiveEntryId(item.id);
    sessionStorage.setItem(ACTIVE_ENTRY_STORAGE_KEY, item.id);
  }, []);

  useEffect(() => {
    if (!sessionLoaded || !hasDraftChanges) return;
    setAutoSaveStatus("saving");
    const timer = window.setTimeout(() => {
      persistDraft(draft);
      setHasDraftChanges(false);
      setAutoSaveStatus("saved");
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draft, hasDraftChanges, persistDraft, sessionLoaded]);

  const updateDraft = <K extends keyof FaqSchemaDraft>(field: K, value: FaqSchemaDraft[K]) => {
    setDraft(current => ({ ...current, [field]: value }));
    setHasDraftChanges(true);
  };

  const updateQuestion = (id: string, update: Partial<FaqQuestionDraft>) => {
    updateDraft("questions", draft.questions.map(item => item.id === id ? { ...item, ...update } : item));
  };

  const addQuestion = () => updateDraft("questions", [...draft.questions, createFaqQuestionDraft()]);

  const removeQuestion = (id: string) => {
    const nextQuestions = draft.questions.filter(item => item.id !== id);
    updateDraft("questions", nextQuestions.length > 0 ? nextQuestions : [createFaqQuestionDraft()]);
  };

  const createNew = () => {
    if (hasDraftChanges) {
      persistDraft(draft);
      setAutoSaveStatus("saved");
      toast.success("Current FAQ schema saved. New schema created.");
    }
    setDraft(createFaqSchemaDraft());
    setActiveEntryId(null);
    sessionStorage.removeItem(ACTIVE_ENTRY_STORAGE_KEY);
    setHasDraftChanges(false);
    setAutoSaveStatus("idle");
  };

  const loadEntry = (entry: SavedFaqSchema) => {
    setDraft(entry.draft);
    setActiveEntryId(entry.id);
    sessionStorage.setItem(ACTIVE_ENTRY_STORAGE_KEY, entry.id);
    setHasDraftChanges(false);
    setAutoSaveStatus("saved");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const duplicateEntry = (entry: SavedFaqSchema) => {
    const duplicate: FaqSchemaDraft = {
      ...entry.draft,
      id: crypto.randomUUID(),
      label: entry.draft.label ? `${entry.draft.label} copy` : "FAQ copy",
      questions: entry.draft.questions.map(item => ({ ...item, id: crypto.randomUUID() })),
    };
    persistDraft(duplicate);
    setDraft(duplicate);
    setHasDraftChanges(false);
    setAutoSaveStatus("saved");
    toast.success("FAQ schema duplicate created. Update the page-specific questions and answers.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeEntry = (id: string) => {
    setEntries(current => current.filter(entry => entry.id !== id));
    if (activeEntryId === id) {
      setDraft(createFaqSchemaDraft());
      setActiveEntryId(null);
      sessionStorage.removeItem(ACTIVE_ENTRY_STORAGE_KEY);
      setHasDraftChanges(false);
      setAutoSaveStatus("idle");
    }
    toast.success("FAQ schema removed from this session");
  };

  const copySchema = async () => {
    const snippet = `<script type="application/ld+json">\n${serializedSchema}\n</script>`;
    try {
      await navigator.clipboard.writeText(snippet);
      toast.success("JSON-LD script copied to clipboard");
    } catch {
      toast.error("Clipboard access was unavailable. Select and copy the code manually.");
    }
  };

  const statusTone = validation.errors.length > 0 ? "issue" : validation.recommendations.length > 0 ? "review" : "ready";
  const statusText = validation.errors.length > 0 ? "Needs correction" : validation.recommendations.length > 0 ? "Ready to complete" : "Schema ready";
  const autoSaveText = autoSaveStatus === "saving" ? "Saving to session" : autoSaveStatus === "saved" ? "Saved to session" : "Session workspace";

  return (
    <div className="mx-auto w-full max-w-[1600px] pb-10">
      <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-border/80 bg-background/95 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><MessageCircleQuestion className="h-4.5 w-4.5" /></div>
          <div className="min-w-0"><p className="font-editorial text-xl leading-none tracking-tight">FAQ Schema</p><p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground">Adster Creative Toolbox</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div data-autosave-status className="rounded-xl border border-border bg-white p-1 dark:bg-[#102b40]"><span className="flex h-8 items-center gap-2 rounded-lg px-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{autoSaveStatus === "saving" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-primary" /> : <span className={`h-1.5 w-1.5 rounded-full ${autoSaveStatus === "saved" ? "bg-emerald-500 dark:bg-primary" : "bg-primary"}`} />}{autoSaveText}</span></div>
        </div>
      </header>

      <main className="mt-5">
        <div className="grid gap-6 2xl:grid-cols-[250px_minmax(0,1fr)_minmax(390px,0.88fr)]">
          <aside className="lift-in-delayed 2xl:sticky 2xl:top-24 2xl:self-start">
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]">
              <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5">
                <div>
                  <p className="text-[13px] font-semibold">Your FAQ schemas</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Saved for this session</p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-secondary-foreground">{entries.length}</span>
              </div>
              <div className="max-h-[290px] space-y-1 overflow-auto p-2">
                {entries.length === 0 ? (
                  <div className="px-3 py-5 text-center">
                    <FilePlus2 className="mx-auto h-5 w-5 text-muted-foreground/55" />
                    <p className="mt-2 text-[11px] leading-4 text-muted-foreground">Start typing to save FAQ schemas automatically during this session.</p>
                  </div>
                ) : (
                  entries.map(entry => (
                    <div key={entry.id} className={`group flex items-center gap-1 rounded-xl p-1 ${activeEntryId === entry.id ? "bg-primary/[0.08]" : "hover:bg-secondary/65"}`}>
                      <button onClick={() => loadEntry(entry)} className="min-w-0 flex-1 rounded-lg px-2 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <p className="truncate text-[12px] font-medium">{getDraftName(entry.draft)}</p>
                        <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{entry.draft.questions.filter(item => item.question.trim() && item.answer.trim()).length} complete questions</p>
                      </button>
                      <button onClick={() => duplicateEntry(entry)} aria-label="Duplicate saved FAQ schema" className="rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-primary/10 hover:text-primary focus:opacity-100 focus:outline-none group-hover:opacity-100">
                        <CopyPlus className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => removeEntry(entry.id)} aria-label="Delete saved FAQ schema" className="rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive focus:opacity-100 focus:outline-none group-hover:opacity-100">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-border/70 p-2">
                <Button variant="outline" onClick={createNew} className="h-9 w-full justify-start gap-2 rounded-xl border-dashed bg-transparent text-[12px] hover:bg-secondary/70">
                  <Plus className="h-3.5 w-3.5" /> New FAQ schema
                </Button>
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)] sm:p-6">
              <SectionTitle index="01" title="Schema workspace" description="Name this FAQ schema so you can find it later in this browser session." />
              <div>
                <FieldLabel name="workspace name" hint="Session label" />
                <Input value={draft.label} onChange={event => updateDraft("label", event.target.value)} className={fieldClass} placeholder="e.g. Services FAQ" />
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)] sm:p-6">
              <SectionTitle index="02" title="Questions & answers" description="Add each FAQ pair exactly as it is visible to visitors on the page." />
              <div className="mb-4 rounded-xl border border-primary/15 bg-primary/[0.035] px-3 py-2.5 text-[11px] leading-4 text-muted-foreground">
                <span className="font-medium text-foreground">Visible-content reminder.</span> FAQPage markup should represent the same questions and answers users can read on the published page.
              </div>
              <div className="space-y-4">
                {draft.questions.map((item, index) => (
                  <article key={item.id} className="rounded-xl border border-border/80 bg-secondary/[0.18] p-4 dark:bg-[#102b40]/60">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">FAQ {String(index + 1).padStart(2, "0")}</p>
                      <button onClick={() => removeQuestion(item.id)} aria-label={`Remove FAQ ${index + 1}`} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="mt-3 space-y-4">
                      <div>
                        <FieldLabel name="Question" hint="Exact visible question" />
                        <Input aria-label={`Question ${index + 1}`} value={item.question} onChange={event => updateQuestion(item.id, { question: event.target.value })} className={fieldClass} placeholder="e.g. What services do you offer?" />
                      </div>
                      <div>
                        <FieldLabel name="Answer" hint="Exact visible answer" />
                        <Textarea aria-label={`Answer ${index + 1}`} value={item.answer} onChange={event => updateQuestion(item.id, { answer: event.target.value })} className={textareaClass} placeholder="Write the answer exactly as visitors can read it on the page." />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addQuestion} className="mt-4 h-9 w-full gap-2 rounded-xl border-dashed bg-transparent text-[12px] hover:bg-secondary/70"><Plus className="h-3.5 w-3.5" /> Add question and answer</Button>
            </div>
          </section>

          <aside className="space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
            <div className="overflow-hidden rounded-2xl border border-[#485a73] bg-[#40516a] text-[#f5fbff] shadow-[0_22px_65px_-34px_rgba(0,92,145,0.6)] dark:border-[#2879a5] dark:bg-[#163950] dark:shadow-[0_22px_65px_-34px_rgba(0,0,0,0.7)]">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2"><Globe2 className="h-3.5 w-3.5 text-[#b9eeff]" /><p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#b9eeff]">Live JSON-LD</p></div>
                  <p className="mt-1 text-[12px] text-white/55">FAQPage structured data</p>
                </div>
                <Button onClick={copySchema} variant="outline" className="h-8 gap-1.5 rounded-lg border-white/15 bg-white/[0.06] px-2.5 text-[11px] text-white hover:bg-white/[0.12] hover:text-white">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
              <div className="code-scroll max-h-[480px] overflow-auto p-5">
                <pre className="font-mono text-[11px] leading-[1.75] text-[#e7f8ff]"><code>{`<script type="application/ld+json">\n${serializedSchema}\n</script>`}</code></pre>
              </div>
              <div className="border-t border-white/10 bg-black/10 px-5 py-3 text-[10px] leading-4 text-white/45">Copy the complete script tag and place it in the source of the page containing this FAQ.</div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/80 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]">
              <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
                <div>
                  <p className="text-[13px] font-semibold">Schema check</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Property-level guidance as you build.</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-[0.08em] ${statusTone === "ready" ? "bg-primary/10 text-primary" : statusTone === "review" ? "bg-[#e0f6ff] text-[#08769f] dark:bg-primary/15 dark:text-primary" : "bg-destructive/10 text-destructive"}`}>{statusText}</span>
              </div>
              <div className="space-y-3 p-4">
                <div className="rounded-xl border border-primary/15 bg-primary/[0.035] px-3 py-2.5 text-[11px] leading-4 text-muted-foreground">
                  <span className="font-medium text-foreground">FAQPage structure.</span> Each mainEntity item needs a Question name and one accepted Answer text value.
                </div>
                {validation.errors.map((issue, index) => (
                  <div key={`${issue.label}-${index}`} className="flex gap-2 rounded-xl bg-destructive/[0.055] px-3 py-2.5 text-[11px] leading-4 text-destructive">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span><b className="font-mono font-medium">{issue.label}</b> — {issue.message}</span>
                  </div>
                ))}
                {validation.recommendations.map((issue, index) => (
                  <div key={`${issue.label}-${index}`} className="flex gap-2 text-[11px] leading-4 text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> <span><b className="font-mono font-medium text-foreground/75">{issue.label}</b> — {issue.message}</span>
                  </div>
                ))}
                {validation.errors.length === 0 && validation.recommendations.length === 0 ? <div className="flex items-center gap-2 rounded-xl bg-primary/[0.06] px-3 py-2.5 text-[11px] text-primary"><Check className="h-3.5 w-3.5" /> Every FAQ entry has a question and accepted answer.</div> : null}
              </div>
            </div>

            <a href="https://schema.org/FAQPage" target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card/65 px-4 py-3.5 text-[12px] shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)] transition hover:border-primary/30 hover:bg-card">
              <span className="flex items-center gap-2 text-muted-foreground"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary"><Globe2 className="h-3.5 w-3.5 text-primary" /></span> Read FAQPage documentation</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-primary" />
            </a>
          </aside>
        </div>
      </main>
    </div>
  );
}
