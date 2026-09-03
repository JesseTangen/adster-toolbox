import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SavedProjectsCard } from "@/components/SavedProjectsCard";
import { cloneSavedProjectData, createSavedProject, deleteSavedProject, listSavedProjects, normalizeProjectName, saveSavedProject, type SavedProject } from "@/lib/savedProjects";
import {
  addSitemapChild,
  cloneSitemapTree,
  createSitemapPage,
  defaultSitemap,
  findSitemapPage,
  getSitemapStats,
  moveSitemapPage,
  removeSitemapPage,
  sitemapPageKinds,
  slugifySitemapTitle,
  updateSitemapPage,
  type SitemapPage,
  type SitemapPageKind,
} from "@adster/sitemap-core";
import { ChevronDown, ChevronUp, FilePlus2, FolderTree, Layers3, Link2, Map, Network, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "adster-sitemap-planner-tree";
const SELECTED_STORAGE_KEY = "adster-sitemap-planner-selected";

type SitemapProjectData = {
  tree: SitemapPage;
  selectedId: string;
};

const defaultSitemapData = (): SitemapProjectData => ({ tree: cloneSitemapTree(defaultSitemap), selectedId: "home" });

function loadLegacySitemapData(): SitemapProjectData {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as SitemapPage | null;
    return { tree: parsed?.id ? parsed : cloneSitemapTree(defaultSitemap), selectedId: localStorage.getItem(SELECTED_STORAGE_KEY) || "home" };
  } catch {
    return defaultSitemapData();
  }
}

function TreeNode({ page, depth, selectedId, onSelect }: { page: SitemapPage; depth: number; selectedId: string; onSelect: (id: string) => void }) {
  const selected = page.id === selectedId;
  return (
    <li className="relative" role="treeitem" aria-selected={selected}>
      {depth > 0 ? <span className="absolute -left-3 top-0 h-6 w-3 border-b border-primary/25" /> : null}
      <button onClick={() => onSelect(page.id)} className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition ${selected ? "border-primary/40 bg-primary/[0.08] shadow-sm" : "border-transparent hover:border-primary/20 hover:bg-primary/[0.025]"}`}>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}><Layers3 className="h-3.5 w-3.5" /></span>
        <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold">{page.title}</span><span className="mt-0.5 block truncate font-mono text-[8px] text-muted-foreground">{page.slug}</span></span>
        <span className="rounded-full bg-background/70 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.08em] text-muted-foreground">{page.kind}</span>
      </button>
      {page.children.length > 0 ? <ul role="group" className="ml-5 mt-1 space-y-1 border-l border-primary/15 pl-3">{page.children.map(child => <TreeNode key={child.id} page={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />)}</ul> : null}
    </li>
  );
}

function CanvasNode({ page, depth, selectedId, onSelect }: { page: SitemapPage; depth: number; selectedId: string; onSelect: (id: string) => void }) {
  const selected = page.id === selectedId;
  return (
    <li data-sitemap-page-id={page.id} className="relative pl-7" role="treeitem" aria-selected={selected}>
      <button onClick={() => onSelect(page.id)} className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition sm:p-4 ${selected ? "border-primary/45 bg-primary/[0.07] ring-1 ring-primary/15" : "border-border/80 bg-white/80 hover:border-primary/30 dark:bg-[#102b40]"}`}>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}><Link2 className="h-4 w-4" /></div>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{page.title}</p><p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{page.slug}</p></div>
        <span className="hidden rounded-full bg-secondary px-2 py-1 font-mono text-[8px] uppercase tracking-[0.09em] text-secondary-foreground sm:block">{page.kind}</span>
      </button>
      {page.children.length > 0 ? <ul role="group" className="mt-2 space-y-2">{page.children.map(child => <CanvasNode key={child.id} page={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />)}</ul> : null}
    </li>
  );
}

export default function SitemapPlanner() {
  const [tree, setTree] = useState<SitemapPage>(() => defaultSitemapData().tree);
  const [selectedId, setSelectedId] = useState("home");
  const [projectName, setProjectName] = useState("Website sitemap");
  const [projects, setProjects] = useState<SavedProject<SitemapProjectData>[]>([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [saveStatus, setSaveStatus] = useState<"loading" | "saving" | "saved" | "error">("loading");
  const saveTimer = useRef<number | undefined>(undefined);
  const selected = findSitemapPage(tree, selectedId) ?? tree;
  const stats = useMemo(() => getSitemapStats(tree), [tree]);

  const applyProject = (project: SavedProject<SitemapProjectData>) => {
    const data = cloneSavedProjectData(project.data);
    setActiveProjectId(project.id);
    setProjectName(project.name);
    setTree(data.tree?.id ? data.tree : cloneSitemapTree(defaultSitemap));
    setSelectedId(data.selectedId || "home");
    setSaveStatus("saved");
  };

  useEffect(() => {
    let active = true;
    const loadProjects = async () => {
      try {
        const savedProjects = await listSavedProjects<SitemapProjectData>("sitemap");
        if (!active) return;
        if (savedProjects.length > 0) {
          setProjects(savedProjects);
          applyProject(savedProjects[0]!);
          return;
        }
        const legacyData = loadLegacySitemapData();
        const project = createSavedProject("sitemap", "Website sitemap", legacyData);
        await saveSavedProject(project);
        if (!active) return;
        setProjects([project]);
        applyProject(project);
      } catch {
        if (!active) return;
        setSaveStatus("error");
        toast.error("Saved sitemaps are unavailable in this browser.");
      }
    };
    void loadProjects();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!activeProjectId || saveStatus === "loading") return;
    window.clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = window.setTimeout(() => {
      const project: SavedProject<SitemapProjectData> = {
        id: activeProjectId,
        kind: "sitemap",
        name: normalizeProjectName(projectName, "Untitled sitemap"),
        data: { tree: cloneSavedProjectData(tree), selectedId },
        createdAt: projects.find(item => item.id === activeProjectId)?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      };
      void saveSavedProject(project).then(() => {
        setProjects(current => [project, ...current.filter(item => item.id !== project.id)].sort((left, right) => right.updatedAt - left.updatedAt));
        setSaveStatus("saved");
      }).catch(() => setSaveStatus("error"));
    }, 450);
    return () => window.clearTimeout(saveTimer.current);
  }, [activeProjectId, projectName, selectedId, tree]);

  const openProject = (id: string) => {
    const project = projects.find(item => item.id === id);
    if (!project) return;
    window.clearTimeout(saveTimer.current);
    applyProject(project);
    toast.success(`${project.name} opened`);
  };

  const createProject = async (copyCurrent = false) => {
    window.clearTimeout(saveTimer.current);
    const data = copyCurrent ? cloneSavedProjectData({ tree, selectedId }) : defaultSitemapData();
    const name = copyCurrent ? `${normalizeProjectName(projectName, "Untitled sitemap")} copy` : "Untitled sitemap";
    const project = createSavedProject("sitemap", name, data);
    try {
      await saveSavedProject(project);
      setProjects(current => [project, ...current]);
      applyProject(project);
      toast.success(copyCurrent ? "Sitemap copied" : "New sitemap created");
    } catch {
      setSaveStatus("error");
      toast.error("The new sitemap could not be saved locally.");
    }
  };

  const removeProject = async () => {
    window.clearTimeout(saveTimer.current);
    const fallback = projects.find(item => item.id !== activeProjectId);
    try {
      await deleteSavedProject(activeProjectId);
      if (fallback) {
        setProjects(current => current.filter(item => item.id !== activeProjectId));
        applyProject(fallback);
      } else {
        const project = createSavedProject("sitemap", "Untitled sitemap", defaultSitemapData());
        await saveSavedProject(project);
        setProjects([project]);
        applyProject(project);
      }
      toast.success("Sitemap deleted");
    } catch {
      setSaveStatus("error");
      toast.error("The sitemap could not be deleted locally.");
    }
  };

  const addChild = (parentId = selected.id) => {
    const id = `page-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const child = createSitemapPage(id);
    setTree(current => addSitemapChild(current, parentId, child));
    setSelectedId(id);
    toast.success("New page added to the sitemap");
  };

  const updateSelected = (changes: Partial<Omit<SitemapPage, "id" | "children">>) => setTree(current => updateSitemapPage(current, selected.id, changes));

  const removeSelected = () => {
    if (selected.id === "home") return;
    setTree(current => removeSitemapPage(current, selected.id));
    setSelectedId("home");
    toast.success(`${selected.title} removed from the sitemap`);
  };

  const resetTree = () => {
    setTree(cloneSitemapTree(defaultSitemap));
    setSelectedId("home");
    toast.success("Sitemap reset to the starter structure");
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] pb-10">
      <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-border/80 bg-background/95 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Network className="h-5 w-5" /></div><div className="min-w-0"><p className="font-editorial text-xl leading-none tracking-tight">Sitemap Planner</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground">Adster Creative Toolbox</p></div></div>
        <div className="flex flex-wrap gap-2"><Button onClick={() => addChild("home")} size="sm" className="h-9 gap-1.5 rounded-xl px-3 text-xs"><Plus className="h-3.5 w-3.5" />Add top-level page</Button><Button onClick={resetTree} size="sm" variant="outline" className="h-9 rounded-xl bg-white px-3 text-xs dark:bg-[#102b40]">Reset starter tree</Button></div>
      </header>

      <div className="mt-5"><SavedProjectsCard label="sitemaps" projectNameLabel="Sitemap name" projects={projects} activeProjectId={activeProjectId} projectName={projectName} status={saveStatus} onSelect={openProject} onProjectNameChange={setProjectName} onNew={() => { void createProject(false); }} onDuplicate={() => { void createProject(true); }} onDelete={() => { void removeProject(); }} /></div>
      <div className="mt-5 grid gap-5 2xl:grid-cols-[280px_minmax(0,1fr)_300px]">
        <aside className="space-y-3 2xl:sticky 2xl:top-24 2xl:self-start"><div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]"><div className="flex items-center gap-2"><FolderTree className="h-4 w-4 text-primary" /><div><p className="text-sm font-semibold">Page tree</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">Select a page, then add child pages to build the site hierarchy.</p></div></div></div><div className="rounded-2xl border border-border/80 bg-card/70 p-2 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]"><ul role="tree" aria-label="Sitemap pages" className="space-y-1"><TreeNode page={tree} depth={0} selectedId={selected.id} onSelect={setSelectedId} /></ul></div></aside>

        <main className="min-w-0"><section className="rounded-[1.5rem] border border-border/80 bg-white/70 p-5 shadow-[0_20px_55px_-40px_rgba(0,92,145,0.55)] dark:bg-[#102b40] sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="max-w-2xl"><p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-primary">Navigation architecture</p><h1 className="mt-2 font-editorial text-3xl leading-tight tracking-tight sm:text-4xl">Map the website before production begins</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Plan page relationships, identify navigation depth, and create a simple shared source of truth for strategy, content, and development.</p></div><div data-sitemap-stats className="grid grid-cols-2 gap-2 rounded-2xl border border-primary/15 bg-primary/[0.035] p-3 sm:w-16 sm:grid-cols-1 sm:justify-items-center sm:gap-3 sm:text-center"><div data-sitemap-stat="pages"><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-primary">Pages</p><p className="mt-1 text-xl font-semibold">{stats.pages}</p></div><div data-sitemap-stat="depth"><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-primary">Depth</p><p className="mt-1 text-xl font-semibold">{stats.maxDepth + 1}</p></div></div></div></section><section className="mt-5 rounded-[1.5rem] border border-border/80 bg-card/70 p-4 shadow-[0_20px_55px_-40px_rgba(0,92,145,0.45)] sm:p-6"><div className="mb-4 flex items-center gap-2"><Map className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">Website navigation tree</p><p className="text-[10px] text-muted-foreground">Select a page to refine its details.</p></div><ul role="tree" aria-label="Website navigation canvas" className="space-y-2"><CanvasNode page={tree} depth={0} selectedId={selected.id} onSelect={setSelectedId} /></ul></section></main>

        <aside className="space-y-4 2xl:sticky 2xl:top-24 2xl:self-start"><section className="rounded-2xl border border-border/80 bg-card/85 p-5 shadow-[0_18px_44px_-34px_oklch(0.3_0.03_50)]"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-primary">Selected page</p><h2 className="mt-2 text-lg font-semibold">{selected.title}</h2></div><span className="rounded-full bg-secondary px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-secondary-foreground">{selected.kind}</span></div><div className="mt-5 space-y-4"><label className="block"><span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Page title</span><Input aria-label="Page title" value={selected.title} onChange={event => updateSelected({ title: event.target.value })} onBlur={() => updateSelected({ slug: slugifySitemapTitle(selected.title) })} className="mt-1.5 h-10 rounded-xl bg-white text-xs dark:bg-[#102b40]" /></label><label className="block"><span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">URL path</span><Input aria-label="Page URL path" value={selected.slug} onChange={event => updateSelected({ slug: event.target.value })} className="mt-1.5 h-10 rounded-xl bg-white font-mono text-xs dark:bg-[#102b40]" /></label><label className="block"><span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Page role</span><select aria-label="Page role" value={selected.kind} onChange={event => updateSelected({ kind: event.target.value as SitemapPageKind })} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 dark:bg-[#102b40]">{sitemapPageKinds.map(kind => <option key={kind} value={kind}>{kind}</option>)}</select></label></div><div className="mt-5 grid grid-cols-2 gap-2"><Button onClick={() => addChild()} size="sm" className="h-9 gap-1 rounded-xl text-xs"><FilePlus2 className="h-3.5 w-3.5" />Add child</Button><Button onClick={() => setTree(current => moveSitemapPage(current, selected.id, -1))} size="sm" variant="outline" disabled={selected.id === "home"} className="h-9 gap-1 rounded-xl bg-white text-xs dark:bg-[#102b40]"><ChevronUp className="h-3.5 w-3.5" />Move up</Button><Button onClick={() => setTree(current => moveSitemapPage(current, selected.id, 1))} size="sm" variant="outline" disabled={selected.id === "home"} className="h-9 gap-1 rounded-xl bg-white text-xs dark:bg-[#102b40]"><ChevronDown className="h-3.5 w-3.5" />Move down</Button><Button onClick={removeSelected} size="sm" variant="outline" disabled={selected.id === "home"} className="h-9 gap-1 rounded-xl border-destructive/30 bg-white text-xs text-destructive hover:bg-destructive/10 hover:text-destructive dark:bg-[#102b40]"><Trash2 className="h-3.5 w-3.5" />Remove</Button></div></section></aside>
      </div>
    </div>
  );
}
