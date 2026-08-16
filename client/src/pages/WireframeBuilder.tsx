import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createWireframeSection,
  getWireframeSectionDefinition,
  moveWireframeSection,
  wireframeSectionDefinitions,
  type WireframeSection,
  type WireframeSectionType,
} from "@adster/wireframe-core";
import { toJpeg } from "html-to-image";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ClipboardList,
  Columns3,
  Download,
  Eye,
  FileText,
  GripVertical,
  ImageIcon,
  LayoutPanelTop,
  Menu,
  MessageSquareText,
  Monitor,
  Package,
  PanelTop,
  Plus,
  Rows3,
  Smartphone,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const initialSections: WireframeSection[] = [
  createWireframeSection("header", "wf-header"),
  createWireframeSection("hero", "wf-hero"),
  createWireframeSection("cards", "wf-cards"),
  createWireframeSection("split", "wf-split"),
  createWireframeSection("faq", "wf-faq"),
  createWireframeSection("footer", "wf-footer"),
];

const typeIcons: Record<WireframeSectionType, typeof PanelTop> = {
  header: PanelTop,
  hero: Sparkles,
  cards: Columns3,
  split: Rows3,
  text: FileText,
  faq: MessageSquareText,
  articles: ClipboardList,
  products: Package,
  footer: LayoutPanelTop,
};

const categoryOrder = ["Frame", "Content", "Commerce"] as const;

function PreviewSection({ section, selected, onSelect, onDrop, onDragStart }: {
  section: WireframeSection;
  selected: boolean;
  onSelect: () => void;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
  onDragStart: (event: React.DragEvent<HTMLElement>) => void;
}) {
  const definition = getWireframeSectionDefinition(section.type);
  const isDark = section.type === "footer" || (section.type === "hero" && section.variant === "overlay");
  const common = `group relative cursor-pointer overflow-hidden border transition ${selected ? "border-primary ring-2 ring-primary/20" : "border-[#d7e4ee] hover:border-primary/50"} ${isDark ? "bg-[#18354e] text-white" : "bg-white text-[#223b50]"}`;

  const shell = (content: React.ReactNode, className = "") => (
    <section
      draggable
      onDragStart={onDragStart}
      onDragOver={event => event.preventDefault()}
      onDrop={onDrop}
      onClick={onSelect}
      className={`${common} ${className}`}
      aria-label={`${definition.label} wireframe section`}
    >
      <div className="absolute left-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-md bg-white/80 text-[#597187] opacity-0 shadow-sm transition group-hover:opacity-100"><GripVertical className="h-3.5 w-3.5" /></div>
      {content}
    </section>
  );

  if (section.type === "header") {
    const isSticky = section.variant === "sticky";
    return shell(<div className={`flex h-16 items-center px-6 ${isSticky ? "border-b-2 border-primary/25 shadow-[0_8px_20px_-18px_rgba(0,92,145,0.55)]" : ""}`}><div className="flex items-center gap-2 font-semibold"><span className="h-5 w-5 rounded-md bg-primary/80" />[Brand Name]</div><div className="ml-auto flex items-center gap-5"><nav className="hidden gap-5 text-[10px] text-muted-foreground sm:flex"><span>Overview</span><span>Approach</span><span>Contact</span></nav><span className="rounded-md bg-[#18354e] px-3 py-2 text-[10px] text-white">Start here</span></div></div>);
  }
  if (section.type === "hero") {
    const centered = section.variant === "centered";
    const overlay = section.variant === "overlay";
    return shell(<div className={`relative min-h-[220px] overflow-hidden p-8 sm:p-10 ${centered || overlay ? "" : "wireframe-stack grid gap-7 sm:grid-cols-[1fr_0.72fr] sm:items-center"} ${centered ? "text-center" : ""}`}><div className="absolute inset-0 hidden bg-[linear-gradient(135deg,rgba(8,118,159,0.45),rgba(24,53,78,0.82)),repeating-linear-gradient(45deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_14px)] overlay:block" /><div className={`relative ${centered || overlay ? "max-w-xl" : ""} ${centered ? "mx-auto" : ""}`}><span className={`mb-3 inline-flex rounded-full border border-white/25 bg-white/10 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white ${overlay ? "" : "hidden"}`}>Background image behind overlay</span><h2 className="max-w-xl font-editorial text-3xl leading-tight sm:text-4xl">{section.title}</h2><p className={`mt-3 max-w-md text-xs leading-5 ${isDark ? "text-white/70" : "text-muted-foreground"}`}>A concise strategic narrative that frames the value, audience, and action.</p><span className="mt-5 inline-block rounded-md bg-primary px-4 py-2 text-[10px] font-medium text-white">Primary action</span></div>{!centered && !overlay && <div className="min-h-[130px] rounded-lg border border-dashed border-primary/30 bg-[#e9f8fe] p-4"><ImageIcon className="h-5 w-5 text-primary" /><p className="mt-9 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Hero visual</p></div>}</div>, overlay ? "bg-[#18354e] text-white" : "");
  }
  if (section.type === "cards" || section.type === "articles" || section.type === "products") {
    const isArticles = section.type === "articles";
    const isProducts = section.type === "products";
    const showViewAll = section.type === "cards" && section.showViewAll;
    return shell(<div className="p-7"><h2 className="font-editorial text-2xl">{section.title}</h2><div className={`wireframe-card-grid mt-6 grid gap-3 ${section.variant === "four" ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-3"}`}>{[1, 2, 3].map(item => <div key={item} className="rounded-lg border border-[#d7e4ee] bg-[#fbfdff] p-3"><div className={`h-16 rounded-md ${isProducts ? "bg-[#e9f8fe]" : isArticles ? "bg-[#d9e6f0]" : "bg-[#eff8fc]"}`} /><p className="mt-3 text-[11px] font-semibold">{isProducts ? `Product ${item}` : isArticles ? `Article title ${item}` : `Feature ${item}`}</p><p className="mt-1 text-[9px] leading-4 text-muted-foreground">Supporting detail appears here.</p></div>)}</div>{showViewAll ? <span className="mt-4 block w-full border-t border-[#d7e4ee] pt-3 text-center text-[10px] font-medium text-primary">View all →</span> : null}</div>);
  }
  if (section.type === "split") {
    const imageFirst = section.variant !== "image-right";
    const visual = <div className="min-h-[170px] rounded-lg border border-dashed border-primary/35 bg-[#e9f8fe] p-4"><ImageIcon className="h-5 w-5 text-primary" /><p className="mt-24 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Supporting image</p></div>;
    const copy = <div className="py-3"><h2 className="font-editorial text-2xl leading-tight">{section.title}</h2><p className="mt-3 text-[11px] leading-5 text-muted-foreground">Use this space to explain a key process, product difference, or strategic detail.</p><span className="mt-5 inline-block text-[10px] font-medium text-primary">Read the story →</span></div>;
    return shell(<div className="wireframe-stack grid gap-6 p-7 sm:grid-cols-2 sm:items-center">{imageFirst ? <>{visual}{copy}</> : <>{copy}{visual}</>}</div>);
  }
  if (section.type === "text") {
    const statement = section.variant === "statement";
    return shell(<div className={`p-8 sm:p-10 ${statement ? "bg-[#f2faff]" : ""}`}><div className={statement ? "max-w-3xl" : "max-w-xl"}><h2 className={`${statement ? "text-3xl sm:text-4xl" : "text-2xl"} font-editorial leading-tight`}>{section.title}</h2><p className="mt-4 text-xs leading-6 text-muted-foreground">A flexible text block for an argument, editorial message, or explanatory bridge between more visual sections.</p></div></div>);
  }
  if (section.type === "faq") {
    return shell(<div className="p-7"><h2 className="w-full font-editorial text-2xl leading-tight">{section.title}</h2><div className="mt-5 space-y-2">{["What should visitors understand first?", "How does the process work?", "What happens after I get in touch?"].map(question => <div key={question} className="flex items-center justify-between rounded-md border border-[#d7e4ee] px-3 py-3 text-[10px] font-medium"><span>{question}</span><ChevronDown className="h-3.5 w-3.5 text-primary" /></div>)}</div></div>);
  }
  return shell(<div className="p-8"><div className="wireframe-stack grid gap-6 sm:grid-cols-[1.2fr_0.8fr]"><div><h2 className="font-editorial text-2xl">{section.title}</h2><p className="mt-3 max-w-md text-[11px] leading-5 text-white/65">Close the page with a clear final action and useful navigation routes.</p><span className="mt-5 inline-block rounded-md bg-primary px-4 py-2 text-[10px] font-medium text-white">Contact us</span></div><div className="grid grid-cols-2 gap-3 text-[10px] text-white/65"><div><p className="font-medium text-white">Explore</p><p className="mt-2">Services</p><p className="mt-1">Work</p></div><div><p className="font-medium text-white">Connect</p><p className="mt-2">Instagram</p><p className="mt-1">LinkedIn</p></div></div></div><div className="mt-7 border-t border-white/15 pt-3 font-mono text-[8px] uppercase tracking-[0.11em] text-white/45">© Your company · Privacy · Terms</div></div>);
}

function WireframeRows({
  sections,
  selectedId,
  mode,
  onSelect,
  onDrop,
  onDragStart,
}: {
  sections: WireframeSection[];
  selectedId: string;
  mode: "desktop" | "mobile";
  onSelect?: (id: string) => void;
  onDrop?: (event: React.DragEvent<HTMLElement>, targetIndex: number) => void;
  onDragStart?: (event: React.DragEvent<HTMLElement>, index: number) => void;
}) {
  return <div className="space-y-2">{sections.map((section, index) => <PreviewSection key={section.id} section={section} selected={section.id === selectedId} onSelect={() => onSelect?.(section.id)} onDragStart={event => onDragStart?.(event, index)} onDrop={event => onDrop?.(event, index)} />)}</div>;
}

export default function WireframeBuilder() {
  const [sections, setSections] = useState<WireframeSection[]>(initialSections);
  const [selectedId, setSelectedId] = useState(initialSections[0]?.id ?? "");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [projectName, setProjectName] = useState("Campaign landing page");
  const [isExporting, setIsExporting] = useState<"desktop" | "mobile" | null>(null);
  const desktopExportRef = useRef<HTMLDivElement>(null);
  const mobileExportRef = useRef<HTMLDivElement>(null);

  const selectedIndex = sections.findIndex(section => section.id === selectedId);
  const selected = sections[selectedIndex] ?? sections[0];
  const selectedDefinition = selected ? getWireframeSectionDefinition(selected.type) : undefined;
  const groupedDefinitions = useMemo(() => categoryOrder.map(category => ({ category, items: wireframeSectionDefinitions.filter(item => item.category === category) })), []);

  const addSection = (type: WireframeSectionType, index = sections.length) => {
    const section = createWireframeSection(type);
    setSections(current => [...current.slice(0, index), section, ...current.slice(index)]);
    setSelectedId(section.id);
    toast.success(`${getWireframeSectionDefinition(type).label} added to wireframe`);
  };

  const updateSelected = (partial: Partial<WireframeSection>) => {
    if (!selected) return;
    setSections(current => current.map(section => section.id === selected.id ? { ...section, ...partial } : section));
  };

  const removeSelected = () => {
    if (!selected) return;
    setSections(current => current.filter(section => section.id !== selected.id));
    setSelectedId(sections.find(section => section.id !== selected.id)?.id ?? "");
    toast.success("Section removed from wireframe");
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const copy = { ...selected, id: `section-${selected.type}-${Math.random().toString(36).slice(2, 9)}`, title: `${selected.title} (copy)` };
    setSections(current => [...current.slice(0, selectedIndex + 1), copy, ...current.slice(selectedIndex + 1)]);
    setSelectedId(copy.id);
    toast.success("Section duplicated");
  };

  const moveSelected = (direction: -1 | 1) => {
    const targetIndex = selectedIndex + direction;
    if (selectedIndex < 0 || targetIndex < 0 || targetIndex >= sections.length) return;
    setSections(current => moveWireframeSection(current, selectedIndex, targetIndex));
  };

  const handleCanvasDrop = (event: React.DragEvent<HTMLElement>, targetIndex: number) => {
    event.preventDefault();
    const newType = event.dataTransfer.getData("application/x-adster-wireframe-new") as WireframeSectionType;
    if (newType) {
      addSection(newType, targetIndex);
      return;
    }
    const sourceRaw = event.dataTransfer.getData("application/x-adster-wireframe-index");
    if (!sourceRaw) return;
    const sourceIndex = Number(sourceRaw);
    setSections(current => moveWireframeSection(current, sourceIndex, targetIndex));
  };

  const exportJpg = async (mode: "desktop" | "mobile") => {
    const exportNode = mode === "desktop" ? desktopExportRef.current : mobileExportRef.current;
    if (!exportNode) return;
    setIsExporting(mode);
    try {
      const dataUrl = await toJpeg(exportNode, {
        cacheBust: true,
        pixelRatio: 2,
        quality: 0.94,
        backgroundColor: "#f6fbff",
        filter: node => !(node instanceof HTMLElement && node.dataset.exportHide === "true"),
      });
      const link = document.createElement("a");
      link.download = `${projectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "wireframe"}-${mode}-wireframe.jpg`;
      link.href = dataUrl;
      link.click();
      toast.success(`${mode === "desktop" ? "Desktop" : "Mobile"} JPG download started`);
    } catch {
      toast.error("The wireframe JPG could not be exported. Try again after the preview finishes loading.");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] pb-10">
      <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-border/80 bg-background/95 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><LayoutPanelTop className="h-5 w-5" /></div>
          <div className="min-w-0"><p className="font-editorial text-xl leading-none tracking-tight">Wireframe Builder</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground">Adster Creative Toolbox</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-border bg-white p-1"><Button size="sm" variant={previewMode === "desktop" ? "default" : "ghost"} onClick={() => setPreviewMode("desktop")} className="h-8 gap-1.5 rounded-lg px-2.5 text-[11px]"><Monitor className="h-3.5 w-3.5" />Desktop</Button><Button size="sm" variant={previewMode === "mobile" ? "default" : "ghost"} onClick={() => setPreviewMode("mobile")} className="h-8 gap-1.5 rounded-lg px-2.5 text-[11px]"><Smartphone className="h-3.5 w-3.5" />Mobile</Button></div>
          <Button onClick={() => exportJpg("desktop")} disabled={isExporting !== null} className="h-10 gap-2 rounded-xl px-3 text-xs shadow-[0_12px_28px_-16px_rgba(0,174,239,0.65)]"><Download className="h-3.5 w-3.5" />{isExporting === "desktop" ? "Preparing" : "Desktop JPG"}</Button>
          <Button onClick={() => exportJpg("mobile")} disabled={isExporting !== null} variant="outline" className="h-10 gap-2 rounded-xl bg-white px-3 text-xs"><Download className="h-3.5 w-3.5" />{isExporting === "mobile" ? "Preparing" : "Mobile JPG"}</Button>
        </div>
      </header>

      <div className="mt-5 grid gap-5 2xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="space-y-4 2xl:sticky 2xl:top-24 2xl:self-start">
          <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Section library</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">Drag a section onto the canvas or add it at the end.</p></div><Plus className="h-4 w-4 text-primary" /></div></div>
          {groupedDefinitions.map(group => <div key={group.category} className="rounded-2xl border border-border/80 bg-card/70 p-3 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]"><p className="px-1 pb-2 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{group.category}</p><div className="space-y-1.5">{group.items.map(definition => { const Icon = typeIcons[definition.type]; return <div key={definition.type} draggable onDragStart={event => { event.dataTransfer.effectAllowed = "copy"; event.dataTransfer.setData("application/x-adster-wireframe-new", definition.type); }} className="group flex cursor-grab items-center gap-2 rounded-xl border border-transparent px-2 py-2.5 transition hover:border-primary/25 hover:bg-primary/[0.035] active:cursor-grabbing"><Icon className="h-4 w-4 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="text-[11px] font-medium">{definition.label}</p><p className="mt-0.5 truncate text-[9px] text-muted-foreground">{definition.description}</p></div><button onClick={() => addSection(definition.type)} className="flex h-6 w-6 items-center justify-center rounded-md text-primary opacity-0 transition hover:bg-primary/10 focus:opacity-100 group-hover:opacity-100" aria-label={`Add ${definition.label}`}><Plus className="h-3.5 w-3.5" /></button></div>; })}</div></div>)}
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border/80 bg-white/70 p-3 shadow-[0_16px_38px_-30px_rgba(0,92,145,0.42)] sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /><div><p className="text-xs font-semibold">Page canvas</p><p className="text-[10px] text-muted-foreground">Drag sections to reorder; select one to refine its intent.</p></div></div><Input value={projectName} onChange={event => setProjectName(event.target.value)} aria-label="Wireframe project name" className="h-9 max-w-xs rounded-lg bg-white text-xs" /></div>
          <div className="overflow-auto rounded-[1.5rem] border border-border/80 bg-[#eaf5fa]/70 p-3 shadow-[0_20px_55px_-40px_rgba(0,92,145,0.55)] sm:p-5">
            <div data-wireframe-canvas="preview" className={`mx-auto overflow-hidden rounded-lg border border-[#c9dce8] bg-[#f6fbff] shadow-[0_20px_45px_-32px_rgba(20,63,91,0.55)] transition-[max-width] duration-200 ${previewMode === "mobile" ? "max-w-[390px]" : "max-w-[1040px]"}`}>
              <div className="flex items-center justify-between border-b border-[#d7e4ee] bg-white px-4 py-2" data-export-hide="true"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">{projectName || "Untitled wireframe"}</span></div><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">{previewMode} preview</span></div>
              <div className="p-2 sm:p-3">
                {sections.length === 0 ? <button onClick={() => addSection("hero", 0)} onDragOver={event => event.preventDefault()} onDrop={event => handleCanvasDrop(event, 0)} className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-white/60 text-center"><Plus className="h-6 w-6 text-primary" /><p className="mt-3 text-sm font-medium">Start with a section</p><p className="mt-1 text-xs text-muted-foreground">Drag one from the library, or click here to add a hero.</p></button> : <WireframeRows sections={sections} selectedId={selected?.id ?? ""} mode={previewMode} onSelect={setSelectedId} onDragStart={(event, index) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("application/x-adster-wireframe-index", String(index)); }} onDrop={handleCanvasDrop} />}
                <button data-export-hide="true" onClick={() => addSection("text")} onDragOver={event => event.preventDefault()} onDrop={event => handleCanvasDrop(event, sections.length)} className="flex h-14 w-full items-center justify-center gap-2 border border-dashed border-primary/30 bg-white/75 text-[10px] font-medium text-primary transition hover:bg-primary/[0.04]"><Plus className="h-3.5 w-3.5" />Drop a section here</button>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="pointer-events-none fixed left-[-12000px] top-0">
            <div ref={desktopExportRef} className="wireframe-mode-desktop w-[1040px] overflow-hidden border border-[#c9dce8] bg-[#f6fbff]"><div className="flex items-center justify-between border-b border-[#d7e4ee] bg-white px-4 py-2"><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">{projectName || "Untitled wireframe"}</span><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">desktop handoff</span></div><div className="p-3"><WireframeRows sections={sections} selectedId="" mode="desktop" /></div></div>
            <div ref={mobileExportRef} className="wireframe-mode-mobile w-[390px] overflow-hidden border border-[#c9dce8] bg-[#f6fbff]"><div className="flex items-center justify-between border-b border-[#d7e4ee] bg-white px-4 py-2"><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">{projectName || "Untitled wireframe"}</span><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">mobile handoff</span></div><div className="p-3"><WireframeRows sections={sections} selectedId="" mode="mobile" /></div></div>
          </div>
        </main>

        <aside className="2xl:sticky 2xl:top-24 2xl:self-start">
          {selected && selectedDefinition ? <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/85 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]">
            <div className="border-b border-border/70 px-5 py-4"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-primary">Selected section</p><h2 className="mt-1 text-sm font-semibold">{selectedDefinition.label}</h2></div><span className="rounded-full bg-secondary px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-secondary-foreground">#{selectedIndex + 1}</span></div></div>
            <div className="space-y-4 p-5">
              <div><label className="mb-1.5 block font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-muted-foreground">Style option</label><select value={selected.variant} onChange={event => updateSelected({ variant: event.target.value })} className="h-10 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20">{selectedDefinition.variants.map(variant => <option key={variant.id} value={variant.id}>{variant.label}</option>)}</select><p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">{selectedDefinition.variants.find(variant => variant.id === selected.variant)?.description}</p></div>
              {selected.type !== "header" ? <div><label className="mb-1.5 block font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-muted-foreground">Section heading</label><Input value={selected.title} onChange={event => updateSelected({ title: event.target.value })} className="h-10 rounded-xl bg-white text-xs" /></div> : <div className="rounded-xl border border-primary/15 bg-primary/[0.035] px-3 py-2.5"><p className="font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-primary">Brand label</p><p className="mt-1 text-xs text-muted-foreground">[Brand Name] is fixed for developer handoff.</p></div>}
              {selected.type === "cards" ? <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-white px-3 py-2.5 text-xs"><span><span className="block font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-foreground/80">View all link</span><span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">Show a full-width link below the card grid.</span></span><input aria-label="Show View all link" type="checkbox" checked={selected.showViewAll} onChange={event => updateSelected({ showViewAll: event.target.checked })} className="h-4 w-4 accent-[oklch(0.7_0.14_220)]" /></label> : null}
              <div><label className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-muted-foreground"><MessageSquareText className="h-3.5 w-3.5 text-primary" />Strategist / design notes</label><Textarea value={selected.note} onChange={event => updateSelected({ note: event.target.value })} placeholder="Call out requirements, content dependencies, accessibility notes, or visual direction for the developer." className="min-h-[120px] rounded-xl border-border bg-white text-xs leading-5" /></div>
              <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => moveSelected(-1)} disabled={selectedIndex <= 0} className="h-9 gap-1.5 rounded-xl bg-white text-[11px]"><ArrowUp className="h-3.5 w-3.5" />Move up</Button><Button variant="outline" onClick={() => moveSelected(1)} disabled={selectedIndex >= sections.length - 1} className="h-9 gap-1.5 rounded-xl bg-white text-[11px]"><ArrowDown className="h-3.5 w-3.5" />Move down</Button></div>
              <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={duplicateSelected} className="h-9 rounded-xl bg-white text-[11px]">Duplicate</Button><Button variant="outline" onClick={removeSelected} className="h-9 gap-1.5 rounded-xl border-destructive/20 bg-white text-[11px] text-destructive hover:bg-destructive/5 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" />Remove</Button></div>
            </div>
          </div> : <div className="rounded-2xl border border-dashed border-border bg-card/65 p-6 text-center"><Menu className="mx-auto h-5 w-5 text-primary" /><p className="mt-3 text-sm font-medium">Select a section</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Choose a canvas section to set its style and leave handoff notes.</p></div>}
        </aside>
      </div>
    </div>
  );
}
