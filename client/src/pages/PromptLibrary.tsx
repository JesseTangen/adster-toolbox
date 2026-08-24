import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPromptCategories, type PromptLibraryItem } from "@adster/prompt-library";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Check, Copy, Database, ExternalLink, FileSpreadsheet, Loader2, RefreshCw, Search, ShieldCheck, Sparkles, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function promptMatches(item: PromptLibraryItem, query: string) {
  const haystack = [item.title, item.prompt, item.category, item.description, item.tags.join(" "), Object.values(item.fields).join(" ")].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase().trim());
}

export default function PromptLibrary() {
  const [activeCategory, setActiveCategory] = useState("All prompts");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const isStaticExport = import.meta.env.BASE_URL !== "/";
  const promptSource = trpc.promptLibrary.get.useQuery(undefined, { retry: false, enabled: !isStaticExport });
  const refreshSource = trpc.promptLibrary.refresh.useMutation({ onSuccess: () => void promptSource.refetch() });
  const items = promptSource.data?.items ?? [];
  const sourceTitle = promptSource.data?.sourceTitle ?? "Prompt Library source";
  const loadedAt = promptSource.data?.refreshedAt ? new Date(promptSource.data.refreshedAt) : null;
  const loading = promptSource.isLoading || refreshSource.isPending;
  const error = isStaticExport ? "The proprietary Prompt Library source is available through the secured Toolbox server, not the GitHub Pages export." : promptSource.error?.message ?? refreshSource.error?.message ?? null;

  const categories = useMemo(() => getPromptCategories(items), [items]);
  const visibleItems = useMemo(() => items.filter(item => (activeCategory === "All prompts" || item.category === activeCategory) && promptMatches(item, query)), [activeCategory, items, query]);
  const selected = visibleItems.find(item => item.id === selectedId) ?? items.find(item => item.id === selectedId) ?? visibleItems[0] ?? null;

  useEffect(() => {
    if (items.length) setSelectedId(current => items.some(item => item.id === current) ? current : items[0]?.id ?? null);
  }, [items]);

  const copyPrompt = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.prompt);
    setCopied(true);
    toast.success("Prompt copied to clipboard");
    window.setTimeout(() => setCopied(false), 1_600);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] pb-10">
      <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-border/80 bg-background/95 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></div><div className="min-w-0"><p className="font-editorial text-xl leading-none tracking-tight">Prompt Library</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground">Adster Creative Toolbox</p></div></div>
        <div className="flex flex-wrap items-center gap-2"><Button size="sm" onClick={() => refreshSource.mutate()} disabled={loading} className="h-9 gap-1.5 rounded-xl px-3 text-xs">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}Refresh source</Button></div>
      </header>

      {promptSource.isLoading ? <section className="mt-5 flex min-h-64 items-center justify-center rounded-[1.5rem] border border-border/80 bg-white/70 dark:bg-[#102b40]"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-primary" />Loading approved prompts…</div></section> : null}

      {error ? <div role="alert" className="mt-5 flex gap-3 rounded-2xl border border-destructive/25 bg-destructive/[0.06] p-4 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /><div><p className="font-semibold text-destructive">Source connection needs attention</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{error}</p><Button onClick={() => refreshSource.mutate()} size="sm" variant="outline" className="mt-3 h-8 rounded-lg bg-white text-xs dark:bg-[#102b40]">Try refresh again</Button></div></div> : null}

      {!promptSource.isLoading && !error ? <div className="mt-5 grid gap-5 2xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="space-y-3 2xl:sticky 2xl:top-24 2xl:self-start"><div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]"><div className="flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /><div><p className="text-sm font-semibold">Prompt collections</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">Categories are read directly from the connected sheet.</p></div></div></div><div className="space-y-1 rounded-2xl border border-border/80 bg-card/70 p-2 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]">{["All prompts", ...categories].map(category => { const selectedCategory = category === activeCategory; const count = category === "All prompts" ? items.length : items.filter(item => item.category === category).length; return <button key={category} onClick={() => setActiveCategory(category)} className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition ${selectedCategory ? "border-primary/35 bg-primary/[0.07] shadow-sm" : "border-transparent hover:border-primary/20 hover:bg-primary/[0.025]"}`}><span className="truncate text-xs font-semibold">{category}</span><span className="rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[8px] text-secondary-foreground">{count}</span></button>; })}</div></aside>

        <main className="min-w-0"><section className="rounded-[1.5rem] border border-border/80 bg-white/70 p-5 shadow-[0_20px_55px_-40px_rgba(0,92,145,0.55)] dark:bg-[#102b40] sm:p-7"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="max-w-3xl"><p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-primary">Live sheet-backed library</p><h1 className="mt-2 font-editorial text-3xl leading-tight tracking-tight sm:text-4xl">Approved prompts, ready for the next strategic brief</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Search the current sheet contents, inspect the full source prompt, and copy it directly into your working session.</p></div><div className="shrink-0 rounded-2xl border border-primary/15 bg-primary/[0.035] px-4 py-3 text-left lg:w-44"><p className="font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-primary">Loaded prompts</p><p className="mt-2 text-2xl font-semibold">{items.length}</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">from {sourceTitle || "your sheet"}</p></div></div><div className="relative mt-6"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search prompts" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search prompts, tags, contexts, or categories" className="h-11 rounded-xl bg-white pl-10 text-xs dark:bg-[#102b40]" /></div></section>
          <div className="mt-5 space-y-2">{loading && !items.length ? <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card/70 p-5 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-primary" />Loading the latest rows from Google Sheets…</div> : null}{visibleItems.map(item => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === item.id ? "border-primary/45 bg-primary/[0.06] shadow-sm" : "border-border/80 bg-card/80 hover:border-primary/25"}`}><div className="flex items-start gap-3"><div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected?.id === item.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}><Sparkles className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{item.title}</p><span className="rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.08em] text-secondary-foreground">{item.category}</span></div>{item.description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p> : null}<p className="mt-2 line-clamp-2 whitespace-pre-wrap text-[11px] leading-5 text-foreground/80">{item.prompt}</p>{item.tags.length ? <div className="mt-2 flex flex-wrap gap-1.5">{item.tags.map(tag => <span key={tag} className="rounded-md bg-primary/[0.06] px-1.5 py-0.5 font-mono text-[8px] text-primary">{tag}</span>)}</div> : null}</div></div></button>)}{!loading && !items.length ? <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/[0.025] px-5 py-10 text-center"><FileSpreadsheet className="mx-auto h-6 w-6 text-primary" /><p className="mt-3 text-sm font-semibold">The source has no prompt rows yet</p><p className="mt-1 text-xs text-muted-foreground">Add approved prompt rows to the shared Sheet, then select Refresh source.</p></div> : null}{!loading && items.length > 0 && !visibleItems.length ? <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/[0.025] px-5 py-10 text-center"><Search className="mx-auto h-6 w-6 text-primary" /><p className="mt-3 text-sm font-semibold">No matching prompts</p><p className="mt-1 text-xs text-muted-foreground">Try another category or broader search term.</p></div> : null}</div>
        </main>

        <aside className="space-y-4 2xl:sticky 2xl:top-24 2xl:self-start">{selected ? <section className="rounded-2xl border border-border/80 bg-card/85 p-5 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-primary">Selected prompt</p><h2 className="mt-2 text-lg font-semibold">{selected.title}</h2></div><Button size="sm" onClick={() => void copyPrompt()} className="h-8 gap-1.5 rounded-lg px-2.5 text-[11px]">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy"}</Button></div>{selected.description ? <p className="mt-3 text-xs leading-5 text-muted-foreground">{selected.description}</p> : null}<div className="mt-5 rounded-xl border border-border bg-white p-3 dark:bg-[#102b40]"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Source prompt</p><pre className="mt-2 whitespace-pre-wrap break-words font-sans text-xs leading-5 text-foreground">{selected.prompt}</pre></div><p className="mt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Sheet row {selected.sourceRow}</p></section> : null}<section className="rounded-2xl border border-border/80 bg-card/85 p-5 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]"><div className="flex items-center gap-2"><Database className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">Source status</p></div><p className="mt-2 text-xs leading-5 text-muted-foreground">Reads the source with the Toolbox’s private service account. Google credentials and source access remain on the server.</p><div className="mt-4 rounded-xl border border-border bg-white px-3 py-3 dark:bg-[#102b40]"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Last synced</p><p className="mt-1 text-xs font-semibold">{loadedAt ? loadedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Waiting for source"}</p></div><p className="mt-4 text-[10px] leading-4 text-muted-foreground">Sheet edits can trigger a signed source refresh without requiring a Google sign-in from Toolbox users.</p></section></aside>
      </div> : null}
    </div>
  );
}
