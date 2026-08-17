import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createWireframeSection,
  getMultiColumnContentStyle,
  getWireframeSectionDefinition,
  isWireframeBoundarySection,
  moveWireframeSection,
  multiColumnContentStyles,
  wireframeSectionDefinitions,
  type WireframeSection,
  type WireframeSectionType,
} from "@adster/wireframe-core";
import { toJpeg } from "html-to-image";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
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
  createWireframeSection("columns", "wf-columns"),
  createWireframeSection("split", "wf-split"),
  createWireframeSection("faq", "wf-faq"),
  createWireframeSection("footer", "wf-footer"),
];

const typeIcons: Record<WireframeSectionType, typeof PanelTop> = {
  header: PanelTop,
  hero: Sparkles,
  columns: Columns3,
  split: Rows3,
  text: FileText,
  faq: MessageSquareText,
  footer: LayoutPanelTop,
};

const categoryOrder = ["Frame", "Content"] as const;

function PreviewSection({ section, selected, onSelect, onDrop, onDragStart }: {
  section: WireframeSection;
  selected: boolean;
  onSelect: () => void;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
  onDragStart: (event: React.DragEvent<HTMLElement>) => void;
}) {
  const definition = getWireframeSectionDefinition(section.type);
  const isBoundary = isWireframeBoundarySection(section);
  const isDark = section.type === "footer" || (section.type === "hero" && section.variant === "overlay");
  const common = `group relative ${isBoundary ? "cursor-default" : "cursor-pointer"} overflow-hidden border border-neutral-300 transition ${selected ? "border-neutral-900 ring-1 ring-neutral-500" : "hover:border-neutral-600"} ${isDark ? "bg-neutral-800 text-white" : "bg-white text-neutral-900"}`;

  const shell = (content: React.ReactNode, className = "") => (
    <section
      draggable={!isBoundary}
      onDragStart={event => { if (isBoundary) { event.preventDefault(); return; } onDragStart(event); }}
      onDragOver={event => { if (!isBoundary) event.preventDefault(); }}
      onDrop={event => { if (!isBoundary) onDrop(event); }}
      onClick={isBoundary ? undefined : onSelect}
      className={`${common} ${className}`}
      aria-label={`${definition.label} wireframe section`}
    >
      {!isBoundary ? <div className="absolute left-2 top-2 z-20 flex h-6 w-6 items-center justify-center bg-white/90 text-neutral-500 opacity-0 transition group-hover:opacity-100"><GripVertical className="h-3.5 w-3.5" /></div> : null}
      {content}
    </section>
  );

  if (section.type === "header") {
    const isSticky = section.variant === "sticky";
    return shell(<div className={`flex h-16 items-center px-6 ${isSticky ? "border-b-2 border-neutral-800" : ""}`}><div className="flex items-center gap-2 font-semibold"><span className="h-5 w-5 bg-neutral-800" />[Company]</div><div className="ml-auto flex items-center gap-5"><nav className="hidden gap-5 text-[10px] text-neutral-500 sm:flex"><span>Overview</span><span>Approach</span><span>Contact</span></nav><span className="bg-neutral-900 px-3 py-2 text-[10px] text-white">Start here</span></div></div>);
  }
  if (section.type === "hero") {
    const centered = section.variant === "centered";
    const overlay = section.variant === "overlay";
    return shell(<div className={`relative min-h-[220px] overflow-hidden p-8 sm:p-10 ${centered || overlay ? "" : "wireframe-stack grid gap-7 sm:grid-cols-[1fr_0.72fr] sm:items-center"} ${centered ? "text-center" : ""}`}><div className="absolute inset-0 hidden bg-[linear-gradient(135deg,rgba(23,23,23,0.72),rgba(64,64,64,0.9)),repeating-linear-gradient(45deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_14px)] overlay:block" /><div className={`relative ${centered || overlay ? "max-w-xl" : ""} ${centered ? "mx-auto" : ""}`}><span className={`mb-3 inline-flex border border-white/35 bg-white/10 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white ${overlay ? "" : "hidden"}`}>Background image behind overlay</span><h2 className="max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">{section.title}</h2><p className={`mt-3 max-w-md text-xs leading-5 ${isDark ? "text-white/70" : "text-neutral-500"}`}>A concise strategic narrative that frames the value, audience, and action.</p><span className="mt-5 inline-block bg-neutral-900 px-4 py-2 text-[10px] font-medium text-white">Primary action</span></div>{!centered && !overlay && <div className="min-h-[130px] border border-dashed border-neutral-400 bg-neutral-100 p-4"><ImageIcon className="h-5 w-5 text-neutral-500" /><p className="mt-9 font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-500">Hero visual</p></div>}</div>, overlay ? "bg-neutral-800 text-white" : "");
  }
  if (section.type === "columns") {
    const contentStyle = getMultiColumnContentStyle(section.multiColumnStyle);
    const itemCount = section.variant === "two" ? 2 : section.variant === "four" ? 4 : 3;
    const columnClass = section.variant === "two" ? "sm:grid-cols-2" : section.variant === "four" ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-3";
    const useCards = section.multiColumnPresentation === "card";
    const showReadMore = contentStyle.supportsReadMore && section.showReadMore;
    const mediaLabel = contentStyle.id === "collection" ? "Collection image" : section.multiColumnMedia === "icon" ? "Icon" : "Image";
    return shell(<div className="p-7"><h2 className="text-2xl font-semibold">{section.title}</h2><div className={`wireframe-card-grid mt-6 grid gap-3 ${columnClass}`}>{Array.from({ length: itemCount }, (_, index) => index + 1).map(item => <div key={item} className={`${useCards ? "border border-neutral-300 bg-white p-3" : "py-3"}`}>
      {section.multiColumnMedia !== "none" ? section.multiColumnMedia === "icon" ? <div className="flex h-14 w-14 items-center justify-center border border-neutral-300 bg-neutral-100"><Sparkles className="h-4 w-4 text-neutral-600" /></div> : <div className="flex h-16 items-end border border-neutral-300 bg-neutral-200 p-2 font-mono text-[8px] uppercase tracking-[0.1em] text-neutral-500">{mediaLabel}</div> : null}
      <p className="mt-3 text-[11px] font-semibold">{contentStyle.itemLabel} {item}</p>
      {contentStyle.hasSummary ? <p className="mt-1 text-[9px] leading-4 text-neutral-500">Brief summary describing the main value or supporting detail.</p> : null}
      {showReadMore ? <span className="mt-3 inline-block text-[9px] font-medium text-neutral-800">Read more →</span> : null}
    </div>)}</div>{section.showSeeAll ? <span className="mt-5 flex w-full items-center justify-center border border-neutral-400 bg-neutral-200 px-4 py-2.5 text-[10px] font-medium text-neutral-900">See All →</span> : null}</div>);
  }
  if (section.type === "split") {
    const imageFirst = section.variant !== "image-right";
    const visual = <div className="min-h-[170px] border border-dashed border-neutral-400 bg-neutral-100 p-4"><ImageIcon className="h-5 w-5 text-neutral-500" /><p className="mt-24 font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-500">Supporting image</p></div>;
    const copy = <div className="py-3"><h2 className="text-2xl font-semibold leading-tight">{section.title}</h2><p className="mt-3 text-[11px] leading-5 text-neutral-500">Use this space to explain a key process, product difference, or strategic detail.</p><span className="mt-5 inline-block text-[10px] font-medium text-neutral-800">Primary Action</span></div>;
    return shell(<div className="wireframe-stack grid gap-6 p-7 sm:grid-cols-2 sm:items-center">{imageFirst ? <>{visual}{copy}</> : <>{copy}{visual}</>}</div>);
  }
  if (section.type === "text") {
    const statement = section.variant === "statement";
    const twoColumn = section.variant === "two-column";
    return shell(<div className={`p-8 sm:p-10 ${statement ? "bg-neutral-100" : ""}`}><div className={statement ? "max-w-3xl" : twoColumn ? "max-w-4xl" : "max-w-xl"}><h2 className={`${statement ? "text-3xl sm:text-4xl" : "text-2xl"} font-semibold leading-tight`}>{section.title}</h2>{twoColumn ? <div className="mt-5 grid gap-5 text-xs leading-6 text-neutral-500 sm:grid-cols-2"><p>Use the first column to establish the context, challenge, or core point of view in a clear, readable narrative.</p><p>Use the second column to add supporting proof, process detail, or a practical next step for the visitor.</p></div> : <p className="mt-4 text-xs leading-6 text-neutral-500">A flexible text block for an argument, editorial message, or explanatory bridge between more visual sections.</p>}</div></div>);
  }
  if (section.type === "faq") {
    return shell(<div className="p-7"><h2 className="w-full text-2xl font-semibold leading-tight">{section.title}</h2><div className="mt-5 space-y-2">{["What should visitors understand first?", "How does the process work?", "What happens after I get in touch?"].map(question => <div key={question} className="flex items-center justify-between border border-neutral-300 px-3 py-3 text-[10px] font-medium"><span>{question}</span><ChevronDown className="h-3.5 w-3.5 text-neutral-500" /></div>)}</div></div>);
  }
  return shell(<div className="p-8"><div className="wireframe-stack grid gap-6 sm:grid-cols-[1.2fr_0.8fr]"><div><h2 className="text-2xl font-semibold">[Company]</h2><p className="mt-3 max-w-md text-[11px] leading-5 text-white/65">Close the page with a clear final action and useful navigation routes.</p></div><div className="grid grid-cols-2 gap-3 text-[10px] text-white/65"><div><p className="font-medium text-white">Explore</p><p className="mt-2">Services</p><p className="mt-1">Work</p></div><div><p className="font-medium text-white">Connect</p><p className="mt-2">Instagram</p><p className="mt-1">LinkedIn</p></div></div></div><div className="mt-7 border-t border-white/15 pt-3 font-mono text-[8px] uppercase tracking-[0.11em] text-white/45">© [Company] · Privacy · Terms</div></div>);
}

function SectionAnnotation({ section }: { section: WireframeSection }) {
  const definition = getWireframeSectionDefinition(section.type);
  return (
    <aside className="rounded-lg border border-[#cfe3ee] bg-[#eff8fc] p-3 text-left">
      <p className="font-mono text-[8px] font-medium uppercase tracking-[0.12em] text-primary">Template</p>
      <p className="mt-1 text-[11px] font-semibold text-[#20364d]">{definition.label}</p>
      <div className="mt-3 border-t border-primary/15 pt-2">
        <p className="font-mono text-[8px] font-medium uppercase tracking-[0.11em] text-muted-foreground">Notes</p>
        <p className="mt-1 text-[9px] leading-4 text-muted-foreground">{section.note.trim() || "No strategist notes added yet."}</p>
      </div>
    </aside>
  );
}

function WireframeRows({
  sections,
  selectedId,
  mode,
  onSelect,
  onDrop,
  onDragStart,
  showDropTarget = false,
  onAddAtEnd,
}: {
  sections: WireframeSection[];
  selectedId: string;
  mode: "desktop" | "mobile";
  onSelect?: (id: string) => void;
  onDrop?: (event: React.DragEvent<HTMLElement>, targetIndex: number) => void;
  onDragStart?: (event: React.DragEvent<HTMLElement>, index: number) => void;
  showDropTarget?: boolean;
  onAddAtEnd?: () => void;
}) {
  const isMobile = mode === "mobile";
  const header = sections.find(section => section.type === "header");
  const footer = sections.find(section => section.type === "footer");
  const contentSections = sections.filter(section => !isWireframeBoundarySection(section));
  const renderSection = (section: WireframeSection) => {
    const index = sections.findIndex(item => item.id === section.id);
    const isFrame = isWireframeBoundarySection(section);
    const preview = <PreviewSection key={section.id} section={section} selected={section.id === selectedId} onSelect={() => onSelect?.(section.id)} onDragStart={event => onDragStart?.(event, index)} onDrop={event => onDrop?.(event, index)} />;
    if (isFrame) return preview;
    return <div key={section.id} className={`grid gap-2 ${isMobile ? "grid-cols-1" : "grid-cols-[150px_minmax(0,1fr)]"}`}><SectionAnnotation section={section} />{preview}</div>;
  };
  const footerIndex = footer ? sections.findIndex(section => section.id === footer.id) : sections.length;
  return <div className="space-y-2">{header ? renderSection(header) : null}{contentSections.map(renderSection)}{showDropTarget ? <button data-export-hide="true" onClick={onAddAtEnd} onDragOver={event => event.preventDefault()} onDrop={event => onDrop?.(event, footerIndex)} className="flex h-14 w-full items-center justify-center gap-2 border border-dashed border-primary/30 bg-white/75 text-[10px] font-medium text-primary transition hover:bg-primary/[0.04]"><Plus className="h-3.5 w-3.5" />Drop a section here</button> : null}{footer ? renderSection(footer) : null}</div>;
}

export default function WireframeBuilder() {
  const [sections, setSections] = useState<WireframeSection[]>(initialSections);
  const [selectedId, setSelectedId] = useState(initialSections.find(section => !isWireframeBoundarySection(section))?.id ?? "");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [projectName, setProjectName] = useState("Campaign landing page");
  const [isExporting, setIsExporting] = useState<"desktop" | "mobile" | null>(null);
  const desktopExportRef = useRef<HTMLDivElement>(null);
  const mobileExportRef = useRef<HTMLDivElement>(null);

  const selectedIndex = sections.findIndex(section => section.id === selectedId);
  const selected = sections[selectedIndex] ?? sections.find(section => !isWireframeBoundarySection(section)) ?? sections[0];
  const selectedDefinition = selected ? getWireframeSectionDefinition(selected.type) : undefined;
  const selectedIsBoundary = selected ? isWireframeBoundarySection(selected) : false;
  const groupedDefinitions = useMemo(() => categoryOrder.filter(category => category !== "Frame").map(category => ({ category, items: wireframeSectionDefinitions.filter(item => item.category === category) })), []);

  const addSection = (type: WireframeSectionType, index?: number) => {
    if (type === "header" || type === "footer") return;
    const section = createWireframeSection(type);
    setSections(current => {
      const footerIndex = current.findIndex(item => item.type === "footer");
      const firstContentIndex = current[0]?.type === "header" ? 1 : 0;
      const finalContentIndex = footerIndex >= 0 ? footerIndex : current.length;
      const insertAt = Math.min(Math.max(index ?? finalContentIndex, firstContentIndex), finalContentIndex);
      return [...current.slice(0, insertAt), section, ...current.slice(insertAt)];
    });
    setSelectedId(section.id);
    toast.success(`${getWireframeSectionDefinition(type).label} added to wireframe`);
  };

  const updateSelected = (partial: Partial<WireframeSection>) => {
    if (!selected) return;
    setSections(current => current.map(section => section.id === selected.id ? { ...section, ...partial } : section));
  };

  const removeSelected = () => {
    if (!selected || isWireframeBoundarySection(selected)) return;
    setSections(current => current.filter(section => section.id !== selected.id));
    setSelectedId(sections.find(section => section.id !== selected.id)?.id ?? "");
    toast.success("Section removed from wireframe");
  };

  const duplicateSelected = () => {
    if (!selected || isWireframeBoundarySection(selected)) return;
    const copy = { ...selected, id: `section-${selected.type}-${Math.random().toString(36).slice(2, 9)}`, title: `${selected.title} (copy)` };
    setSections(current => [...current.slice(0, selectedIndex + 1), copy, ...current.slice(selectedIndex + 1)]);
    setSelectedId(copy.id);
    toast.success("Section duplicated");
  };

  const moveSelected = (direction: -1 | 1) => {
    if (!selected || isWireframeBoundarySection(selected)) return;
    const targetIndex = selectedIndex + direction;
    if (selectedIndex < 0 || targetIndex < 0 || targetIndex >= sections.length) return;
    setSections(current => moveWireframeSection(current, selectedIndex, targetIndex));
  };

  const handleCanvasDrop = (event: React.DragEvent<HTMLElement>, targetIndex: number) => {
    event.preventDefault();
    const newType = event.dataTransfer.getData("application/x-adster-wireframe-new") as WireframeSectionType;
    if (newType) {
      if (newType === "header" || newType === "footer") return;
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
        filter: element => !(element instanceof HTMLElement && element.dataset.exportHide === "true"),
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
            <div data-wireframe-canvas="preview" className={`light-wireframe-document mx-auto overflow-hidden rounded-lg border border-[#c9dce8] bg-[#f6fbff] shadow-[0_20px_45px_-32px_rgba(20,63,91,0.55)] transition-[max-width] duration-200 ${previewMode === "mobile" ? "max-w-[390px]" : "max-w-[1040px]"}`}>
              <div className="flex items-center justify-between border-b border-[#d7e4ee] bg-white px-4 py-2" data-export-hide="true"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">{projectName || "Untitled wireframe"}</span></div><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">{previewMode} preview</span></div>
              <div className="p-2 sm:p-3">
                {sections.length === 0 ? <button onClick={() => addSection("hero", 0)} onDragOver={event => event.preventDefault()} onDrop={event => handleCanvasDrop(event, 0)} className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-white/60 text-center"><Plus className="h-6 w-6 text-primary" /><p className="mt-3 text-sm font-medium">Start with a section</p><p className="mt-1 text-xs text-muted-foreground">Drag one from the library, or click here to add a hero.</p></button> : <WireframeRows sections={sections} selectedId={selected?.id ?? ""} mode={previewMode} onSelect={setSelectedId} onDragStart={(event, index) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("application/x-adster-wireframe-index", String(index)); }} onDrop={handleCanvasDrop} showDropTarget onAddAtEnd={() => addSection("text")} />}
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="pointer-events-none fixed left-[-12000px] top-0">
            <div ref={desktopExportRef} data-wireframe-export="desktop" className="light-wireframe-document wireframe-mode-desktop w-[1040px] overflow-hidden border border-[#c9dce8] bg-[#f6fbff]"><div className="flex items-center justify-between border-b border-[#d7e4ee] bg-white px-4 py-2"><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">{projectName || "Untitled wireframe"}</span><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">desktop handoff</span></div><div className="p-3"><WireframeRows sections={sections} selectedId="" mode="desktop" /></div></div>
            <div ref={mobileExportRef} data-wireframe-export="mobile" className="light-wireframe-document wireframe-mode-mobile w-[390px] overflow-hidden border border-[#c9dce8] bg-[#f6fbff]"><div className="flex items-center justify-between border-b border-[#d7e4ee] bg-white px-4 py-2"><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">{projectName || "Untitled wireframe"}</span><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">mobile handoff</span></div><div className="p-3"><WireframeRows sections={sections} selectedId="" mode="mobile" /></div></div>
          </div>
        </main>

        <aside className="2xl:sticky 2xl:top-24 2xl:self-start">
          {selected && selectedDefinition ? <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/85 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]">
            <div className="border-b border-border/70 px-5 py-4"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-primary">Selected section</p><h2 className="mt-1 text-sm font-semibold">{selectedDefinition.label}</h2></div><span className="rounded-full bg-secondary px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-secondary-foreground">#{sections.filter(section => !isWireframeBoundarySection(section)).findIndex(section => section.id === selected.id) + 1}</span></div></div>
            <div className="space-y-4 p-5">{selectedIsBoundary ? <div className="rounded-xl border border-primary/15 bg-primary/[0.035] px-3 py-3"><p className="font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-primary">Fixed canvas boundary</p><p className="mt-1 text-xs leading-5 text-muted-foreground">The {selectedDefinition.label} is locked at the {selected.type === "header" ? "top" : "bottom"} of every wireframe and has no editable sidebar options.</p></div> : <>
              <div><label className="mb-1.5 block font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-muted-foreground">Style option</label><select value={selected.variant} onChange={event => updateSelected({ variant: event.target.value })} className="h-10 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20">{selectedDefinition.variants.map(variant => <option key={variant.id} value={variant.id}>{variant.label}</option>)}</select><p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">{selectedDefinition.variants.find(variant => variant.id === selected.variant)?.description}</p></div>
              {selected.type !== "header" ? <div><label className="mb-1.5 block font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-muted-foreground">Section heading</label><Input value={selected.title} onChange={event => updateSelected({ title: event.target.value })} className="h-10 rounded-xl bg-white text-xs" /></div> : <div className="rounded-xl border border-primary/15 bg-primary/[0.035] px-3 py-2.5"><p className="font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-primary">Brand label</p><p className="mt-1 text-xs text-muted-foreground">[Brand Name] is fixed for developer handoff.</p></div>}
              {selected.type === "columns" ? (() => {
                const contentStyle = getMultiColumnContentStyle(selected.multiColumnStyle);
                return <>
                  <div><label className="mb-1.5 block font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-muted-foreground">Content style</label><select aria-label="Multi column content style" value={selected.multiColumnStyle} onChange={event => { const nextStyle = getMultiColumnContentStyle(event.target.value as typeof selected.multiColumnStyle); updateSelected({ multiColumnStyle: nextStyle.id, multiColumnMedia: nextStyle.media[0], showReadMore: nextStyle.supportsReadMore, title: nextStyle.defaultTitle }); }} className="h-10 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20">{multiColumnContentStyles.map(style => <option key={style.id} value={style.id}>{style.label}</option>)}</select><p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">Choose the content and visual treatment for each column.</p></div>
                  <div><label className="mb-1.5 block font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-muted-foreground">Media</label><select aria-label="Multi column media" value={selected.multiColumnMedia} onChange={event => updateSelected({ multiColumnMedia: event.target.value as typeof selected.multiColumnMedia })} className="h-10 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20">{contentStyle.media.map(media => <option key={media} value={media}>{media === "none" ? "No media" : `${media[0]?.toUpperCase()}${media.slice(1)}`}</option>)}</select><p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">{contentStyle.media.length === 1 ? "This content style uses a consistent image treatment." : "Set the visual treatment for every column."}</p></div>
                  <div><label className="mb-1.5 block font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-muted-foreground">Presentation</label><select aria-label="Multi column presentation" value={selected.multiColumnPresentation} onChange={event => updateSelected({ multiColumnPresentation: event.target.value as typeof selected.multiColumnPresentation })} className="h-10 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"><option value="basic">Basic</option><option value="card">Card</option></select><p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">Use a simple row treatment or visually separated cards.</p></div>
                  {contentStyle.supportsReadMore ? <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-white px-3 py-2.5 text-xs"><span><span className="block font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-foreground/80">Read more links</span><span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">Show an optional arrow link beneath each item.</span></span><input aria-label="Show Read more links" type="checkbox" checked={selected.showReadMore} onChange={event => updateSelected({ showReadMore: event.target.checked })} className="h-4 w-4 accent-[oklch(0.7_0.14_220)]" /></label> : null}
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-white px-3 py-2.5 text-xs"><span><span className="block font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-foreground/80">See All button</span><span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">Show a full-width secondary action after the column set.</span></span><input aria-label="Show See All button" type="checkbox" checked={selected.showSeeAll} onChange={event => updateSelected({ showSeeAll: event.target.checked })} className="h-4 w-4 accent-[oklch(0.7_0.14_220)]" /></label>
                </>;
              })() : null}
              <div><label className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-muted-foreground"><MessageSquareText className="h-3.5 w-3.5 text-primary" />Strategist / design notes</label><Textarea value={selected.note} onChange={event => updateSelected({ note: event.target.value })} placeholder="Call out requirements, content dependencies, accessibility notes, or visual direction for the developer." className="min-h-[120px] rounded-xl border-border bg-white text-xs leading-5" /></div>
              <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => moveSelected(-1)} disabled={selectedIndex <= 0} className="h-9 gap-1.5 rounded-xl bg-white text-[11px]"><ArrowUp className="h-3.5 w-3.5" />Move up</Button><Button variant="outline" onClick={() => moveSelected(1)} disabled={selectedIndex >= sections.length - 1} className="h-9 gap-1.5 rounded-xl bg-white text-[11px]"><ArrowDown className="h-3.5 w-3.5" />Move down</Button></div>
              <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={duplicateSelected} className="h-9 rounded-xl bg-white text-[11px]">Duplicate</Button><Button variant="outline" onClick={removeSelected} className="h-9 gap-1.5 rounded-xl border-destructive/20 bg-white text-[11px] text-destructive hover:bg-destructive/5 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" />Remove</Button></div>
            </>}</div>
          </div> : <div className="rounded-2xl border border-dashed border-border bg-card/65 p-6 text-center"><Menu className="mx-auto h-5 w-5 text-primary" /><p className="mt-3 text-sm font-medium">Select a section</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Choose a canvas section to set its style and leave handoff notes.</p></div>}
        </aside>
      </div>
    </div>
  );
}
