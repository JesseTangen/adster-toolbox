import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LocalBusinessTypePicker } from "@/components/LocalBusinessTypePicker";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Copy,
  FilePlus2,
  Globe2,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  buildLocalBusinessSchema,
  createSchemaDraft,
  getEffectiveType,
  SchemaDraft,
  validateSchemaDraft,
  isLocalBusinessType,
} from "@adster/schema-core";

type SavedSchema = {
  id: string;
  updatedAt: number;
  draft: SchemaDraft;
};

type AutoSaveStatus = "idle" | "saving" | "saved";

const SESSION_STORAGE_KEY = "schema-studio-localbusiness-entries";
const ACTIVE_ENTRY_STORAGE_KEY = "schema-studio-localbusiness-active-entry";

const fieldClass =
  "h-10 rounded-xl border-border/80 bg-white/75 px-3 text-[13px] shadow-[0_1px_0_rgba(255,255,255,0.7)] placeholder:text-muted-foreground/65 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-[#102b40] dark:shadow-none";
const textareaClass =
  "min-h-[92px] w-full resize-y rounded-xl border border-border/80 bg-white/75 px-3 py-2.5 text-[13px] leading-5 shadow-[0_1px_0_rgba(255,255,255,0.7)] outline-none placeholder:text-muted-foreground/65 transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 dark:bg-[#102b40] dark:shadow-none";

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

export default function LocalSchema() {
  const [draft, setDraft] = useState<SchemaDraft>(() => createSchemaDraft());
  const [entries, setEntries] = useState<SavedSchema[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");

  const schema = useMemo(() => buildLocalBusinessSchema(draft), [draft]);
  const validation = useMemo(() => validateSchemaDraft(draft), [draft]);
  const serializedSchema = useMemo(() => JSON.stringify(schema, null, 2), [schema]);
  const subtypeFields = {
    food: isLocalBusinessType(getEffectiveType(draft), "FoodEstablishment"),
    medical: isLocalBusinessType(getEffectiveType(draft), "MedicalBusiness"),
    professional: isLocalBusinessType(getEffectiveType(draft), "LegalService") || getEffectiveType(draft) === "ProfessionalService",
    store: isLocalBusinessType(getEffectiveType(draft), "Store"),
  };

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const restoredEntries = JSON.parse(saved) as SavedSchema[];
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

  const persistDraft = useCallback((draftToPersist: SchemaDraft) => {
    const item: SavedSchema = { id: draftToPersist.id, updatedAt: Date.now(), draft: draftToPersist };
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

  const updateDraft = <K extends keyof SchemaDraft>(field: K, value: SchemaDraft[K]) => {
    setDraft(current => ({ ...current, [field]: value }));
    setHasDraftChanges(true);
  };

  const changeBusinessType = (type: string) => {
    setDraft(current => ({ ...current, businessType: type, businessSubtype: type }));
    setHasDraftChanges(true);
  };

  const createNew = () => {
    if (hasDraftChanges) {
      persistDraft(draft);
      setAutoSaveStatus("saved");
      toast.success("Current schema saved. New schema created.");
    }
    setDraft(createSchemaDraft());
    setActiveEntryId(null);
    sessionStorage.removeItem(ACTIVE_ENTRY_STORAGE_KEY);
    setHasDraftChanges(false);
    setAutoSaveStatus("idle");
  };

  const loadEntry = (entry: SavedSchema) => {
    setDraft(entry.draft);
    setActiveEntryId(entry.id);
    sessionStorage.setItem(ACTIVE_ENTRY_STORAGE_KEY, entry.id);
    setHasDraftChanges(false);
    setAutoSaveStatus("saved");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeEntry = (id: string) => {
    setEntries(current => current.filter(entry => entry.id !== id));
    if (activeEntryId === id) {
      setDraft(createSchemaDraft());
      setActiveEntryId(null);
      sessionStorage.removeItem(ACTIVE_ENTRY_STORAGE_KEY);
      setHasDraftChanges(false);
      setAutoSaveStatus("idle");
    }
    toast.success("Schema entry removed from this session");
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
  const statusText = validation.errors.length > 0 ? "Needs correction" : validation.recommendations.length > 0 ? "Ready to enrich" : "Schema ready";
  const autoSaveText = autoSaveStatus === "saving" ? "Saving to session" : autoSaveStatus === "saved" ? "Saved to session" : "Session workspace";

  return (
    <div className="mx-auto w-full max-w-[1600px] pb-10">
      <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-border/80 bg-background/95 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-[11px] font-medium text-primary">{`{}`}</div>
          <div className="min-w-0"><p className="font-editorial text-xl leading-none tracking-tight">LocalBusiness Schema</p><p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground">Adster Creative Toolbox</p></div>
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
                  <p className="text-[13px] font-semibold">Your locations</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Saved for this session</p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-secondary-foreground">{entries.length}</span>
              </div>
              <div className="max-h-[290px] space-y-1 overflow-auto p-2">
                {entries.length === 0 ? (
                  <div className="px-3 py-5 text-center">
                    <FilePlus2 className="mx-auto h-5 w-5 text-muted-foreground/55" />
                    <p className="mt-2 text-[11px] leading-4 text-muted-foreground">Start typing to save locations automatically during this session.</p>
                  </div>
                ) : (
                  entries.map(entry => (
                    <div key={entry.id} className={`group flex items-center gap-1 rounded-xl p-1 ${activeEntryId === entry.id ? "bg-primary/[0.08]" : "hover:bg-secondary/65"}`}>
                      <button onClick={() => loadEntry(entry)} className="min-w-0 flex-1 rounded-lg px-2 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <p className="truncate text-[12px] font-medium">{entry.draft.label || entry.draft.name || "Untitled LocalBusiness"}</p>
                        <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{getEffectiveType(entry.draft)}</p>
                      </button>
                      <button onClick={() => removeEntry(entry.id)} aria-label="Delete saved schema" className="rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive focus:opacity-100 focus:outline-none group-hover:opacity-100">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-border/70 p-2">
                <Button variant="outline" onClick={createNew} className="h-9 w-full justify-start gap-2 rounded-xl border-dashed bg-transparent text-[12px] hover:bg-secondary/70">
                  <Plus className="h-3.5 w-3.5" /> New schema
                </Button>
              </div>
            </div>

          </aside>

          <section className="space-y-5">
            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)] sm:p-6">
              <SectionTitle index="01" title="Identity & classification" description="Define the schema entity before adding the business’s public details." />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel name="workspace name" hint="Session label" />
                  <Input value={draft.label} onChange={event => updateDraft("label", event.target.value)} className={fieldClass} placeholder="e.g. Downtown location" />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel name="@type" hint="131 LocalBusiness types & subtypes" />
                  <LocalBusinessTypePicker value={getEffectiveType(draft)} onValueChange={changeBusinessType} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel name="name" />
                  <Input value={draft.name} onChange={event => updateDraft("name", event.target.value)} className={fieldClass} placeholder="Business name" />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel name="description" />
                  <Textarea value={draft.description} onChange={event => updateDraft("description", event.target.value)} className={textareaClass} placeholder="A concise description of the business." />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)] sm:p-6">
              <SectionTitle index="02" title="Contact & web presence" description="Use canonical URLs and public contact information that belongs to this location." />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><FieldLabel name="url" /> <Input value={draft.url} onChange={event => updateDraft("url", event.target.value)} className={fieldClass} placeholder="https://example.com/location" /></div>
                <div><FieldLabel name="telephone" /> <Input value={draft.telephone} onChange={event => updateDraft("telephone", event.target.value)} className={fieldClass} placeholder="+1-303-555-0123" /></div>
                <div><FieldLabel name="email" /> <Input value={draft.email} onChange={event => updateDraft("email", event.target.value)} className={fieldClass} placeholder="hello@example.com" /></div>
                <div className="sm:col-span-2"><FieldLabel name="logo" /> <Input value={draft.logo} onChange={event => updateDraft("logo", event.target.value)} className={fieldClass} placeholder="https://example.com/logo.png" /></div>
                <div className="sm:col-span-2"><FieldLabel name="sameAs" hint="One URL per line or comma-separated" /> <Textarea value={draft.sameAs} onChange={event => updateDraft("sameAs", event.target.value)} className={textareaClass} placeholder="https://www.instagram.com/yourbusiness" /></div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)] sm:p-6">
              <SectionTitle index="03" title="Address, geo & hours" description="Describe the physical branch using PostalAddress and GeoCoordinates." />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><FieldLabel name="streetAddress" /> <Input value={draft.streetAddress} onChange={event => updateDraft("streetAddress", event.target.value)} className={fieldClass} placeholder="123 Main Street" /></div>
                <div><FieldLabel name="addressLocality" /> <Input value={draft.addressLocality} onChange={event => updateDraft("addressLocality", event.target.value)} className={fieldClass} placeholder="City" /></div>
                <div><FieldLabel name="addressRegion" /> <Input value={draft.addressRegion} onChange={event => updateDraft("addressRegion", event.target.value)} className={fieldClass} placeholder="State or region" /></div>
                <div><FieldLabel name="postalCode" /> <Input value={draft.postalCode} onChange={event => updateDraft("postalCode", event.target.value)} className={fieldClass} placeholder="Postal code" /></div>
                <div><FieldLabel name="addressCountry" /> <Input value={draft.addressCountry} onChange={event => updateDraft("addressCountry", event.target.value)} className={fieldClass} placeholder="US" /></div>
                <div><FieldLabel name="latitude" /> <Input value={draft.latitude} onChange={event => updateDraft("latitude", event.target.value)} className={fieldClass} placeholder="39.7392" /></div>
                <div><FieldLabel name="longitude" /> <Input value={draft.longitude} onChange={event => updateDraft("longitude", event.target.value)} className={fieldClass} placeholder="-104.9903" /></div>
                <div className="sm:col-span-2"><FieldLabel name="openingHours" hint="e.g. Mo-Fr 09:00-17:00" /> <Textarea value={draft.openingHours} onChange={event => updateDraft("openingHours", event.target.value)} className={textareaClass} placeholder="Mo-Fr 09:00-17:00&#10;Sa 10:00-14:00" /></div>
                <div><FieldLabel name="priceRange" /> <Input value={draft.priceRange} onChange={event => updateDraft("priceRange", event.target.value)} className={fieldClass} placeholder="$$" /></div>
              </div>
            </div>

            {(subtypeFields.food || subtypeFields.medical || subtypeFields.professional || subtypeFields.store) ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/[0.025] p-5 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)] sm:p-6">
                <SectionTitle index="04" title={`${getEffectiveType(draft)} details`} description="These fields appear because of the selected LocalBusiness type." />
                <div className="grid gap-4 sm:grid-cols-2">
                  {subtypeFields.food ? <>
                    <div><FieldLabel name="servesCuisine" hint="Comma-separated" /> <Input value={draft.servesCuisine} onChange={event => updateDraft("servesCuisine", event.target.value)} className={fieldClass} placeholder="Italian, Pizza" /></div>
                    <div><FieldLabel name="menu" /> <Input value={draft.menu} onChange={event => updateDraft("menu", event.target.value)} className={fieldClass} placeholder="https://example.com/menu" /></div>
                    <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-border/80 bg-white/75 px-3 py-3 text-[13px] dark:bg-[#102b40]">
                      <input type="checkbox" checked={draft.acceptsReservations} onChange={event => updateDraft("acceptsReservations", event.target.checked)} className="h-4 w-4 accent-[oklch(0.36_0.06_154)] dark:accent-[#00aeef]" />
                      <span><span className="font-mono text-[11px] font-medium">acceptsReservations</span><span className="ml-2 text-muted-foreground">Reservation availability</span></span>
                    </label>
                  </> : null}
                  {subtypeFields.medical ? <div className="sm:col-span-2"><FieldLabel name="medicalSpecialty" /> <Input value={draft.medicalSpecialty} onChange={event => updateDraft("medicalSpecialty", event.target.value)} className={fieldClass} placeholder="e.g. Dentistry" /></div> : null}
                  {subtypeFields.professional ? <div className="sm:col-span-2"><FieldLabel name="areaServed" /> <Input value={draft.areaServed} onChange={event => updateDraft("areaServed", event.target.value)} className={fieldClass} placeholder="e.g. Denver metropolitan area" /></div> : null}
                  {subtypeFields.store ? <>
                    <div><FieldLabel name="currenciesAccepted" /> <Input value={draft.currenciesAccepted} onChange={event => updateDraft("currenciesAccepted", event.target.value)} className={fieldClass} placeholder="USD" /></div>
                    <div><FieldLabel name="paymentAccepted" /> <Input value={draft.paymentAccepted} onChange={event => updateDraft("paymentAccepted", event.target.value)} className={fieldClass} placeholder="Cash, Credit Card" /></div>
                  </> : null}
                </div>
              </div>
            ) : null}
          </section>

          <aside className="space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
            <div className="overflow-hidden rounded-2xl border border-[#485a73] bg-[#40516a] text-[#f5fbff] shadow-[0_22px_65px_-34px_rgba(0,92,145,0.6)] dark:border-[#2879a5] dark:bg-[#163950] dark:shadow-[0_22px_65px_-34px_rgba(0,0,0,0.7)]">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2"><Globe2 className="h-3.5 w-3.5 text-[#b9eeff]" /><p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#b9eeff]">Live JSON-LD</p></div>
                  <p className="mt-1 text-[12px] text-white/55">{getEffectiveType(draft)} structured data</p>
                </div>
                <Button onClick={copySchema} variant="outline" className="h-8 gap-1.5 rounded-lg border-white/15 bg-white/[0.06] px-2.5 text-[11px] text-white hover:bg-white/[0.12] hover:text-white">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
              <div className="code-scroll max-h-[480px] overflow-auto p-5">
                <pre className="font-mono text-[11px] leading-[1.75] text-[#e7f8ff]"><code>{`<script type="application/ld+json">\n${serializedSchema}\n</script>`}</code></pre>
              </div>
              <div className="border-t border-white/10 bg-black/10 px-5 py-3 text-[10px] leading-4 text-white/45">Copy the complete script tag and place it in the page source for this business location.</div>
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
                  <span className="font-medium text-foreground">Specification note.</span> Schema.org does not prescribe universally required LocalBusiness properties; this check separates recommended details from formatting corrections.
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
                {validation.errors.length === 0 && validation.recommendations.length === 0 ? <div className="flex items-center gap-2 rounded-xl bg-primary/[0.06] px-3 py-2.5 text-[11px] text-primary"><Check className="h-3.5 w-3.5" /> No formatting or enrichment suggestions remain.</div> : null}
              </div>
            </div>

            <a href="https://schema.org/LocalBusiness" target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card/65 px-4 py-3.5 text-[12px] shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)] transition hover:border-primary/30 hover:bg-card">
              <span className="flex items-center gap-2 text-muted-foreground"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary"><Globe2 className="h-3.5 w-3.5 text-primary" /></span> Read LocalBusiness documentation</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-primary" />
            </a>
          </aside>
        </div>
      </main>
    </div>
  );
}
