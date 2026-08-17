import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUpRight,
  Boxes,
  Braces,
  CheckSquare2,
  Clock3,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { checklistDefinitions, getChecklistItemCount } from "@adster/checklists";
import { toolboxCategories, toolboxTools, type ToolboxCategory, type ToolboxTool } from "@adster/toolbox-config";
import { toolboxCardClassNames } from "@adster/toolbox-ui";
import { useTheme } from "@/contexts/ThemeContext";

const toolIcons: Record<ToolboxTool["id"], typeof Braces> = {
  "local-schema": Braces,
  "other-schema": Boxes,
  "wireframe-builder": Workflow,
  "qa-checklists": CheckSquare2,
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolboxCategory>("All tools");

  const matchingTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return toolboxTools.filter(tool => {
      const matchesCategory = category === "All tools" || tool.category === category;
      const matchesQuery = !normalizedQuery || [tool.name, tool.description, tool.category, tool.eyebrow]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);
  const checklistItemCount = checklistDefinitions.reduce((count, checklist) => count + getChecklistItemCount(checklist), 0);

  const openTool = (tool: ToolboxTool) => {
    if (tool.path) {
      setLocation(tool.path);
      return;
    }
    toast.info(`${tool.name} is mapped for a future Strategist Toolbox release.`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl pb-10 pt-2 sm:pt-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/65 bg-[#18354e] px-5 py-7 text-white shadow-[0_30px_80px_-42px_rgba(14,55,83,0.8)] dark:border-[#00aeef]/35 dark:bg-[#18354e] dark:shadow-[0_30px_80px_-42px_rgba(0,0,0,0.8)] sm:px-8 sm:py-10">
        <div className="absolute -right-28 -top-36 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-40 left-[28%] h-64 w-64 rounded-full bg-[#6bd5fa]/20 blur-3xl dark:bg-primary/20" />
        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div>
            <h1 className="max-w-3xl font-editorial text-4xl leading-[0.98] tracking-tight sm:text-5xl">
              Adster Creative Toolbox
            </h1>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-primary">Tool directory</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Find the right workspace</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Search the shared catalog or filter by the type of strategic work.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search strategist tools"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search tools, categories, or outcomes"
              className="h-11 rounded-xl border-border/80 bg-white pl-10 shadow-[0_12px_28px_-24px_rgba(0,92,145,0.45)] dark:bg-card dark:shadow-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {toolboxCategories.map(item => (
              <Button
                key={item}
                size="sm"
                variant={category === item ? "default" : "outline"}
                onClick={() => setCategory(item)}
                className={`h-9 shrink-0 rounded-full px-3.5 text-xs ${category === item ? "shadow-[0_10px_24px_-14px_rgba(0,174,239,0.8)] dark:shadow-[0_10px_24px_-14px_rgba(0,174,239,0.6)]" : "bg-white/65 hover:bg-white dark:bg-card dark:hover:bg-accent"}`}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {matchingTools.map(tool => {
            const Icon = toolIcons[tool.id];
            const available = tool.status === "available";
            return (
              <article key={tool.id} style={theme === "dark" ? { background: "#122b3f", borderColor: "#2b607e" } : undefined} className={`toolbox-directory-card group relative flex min-h-[232px] flex-col rounded-2xl border p-5 text-card-foreground shadow-[0_18px_44px_-36px_oklch(0.3_0.03_50)] transition duration-200 dark:border-[#2b607e] dark:bg-[#122b3f] ${available ? toolboxCardClassNames.available : toolboxCardClassNames.planned}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${available ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}><Icon className="h-5 w-5" /></div>
                  <span className={`rounded-full px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.09em] ${available ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>{tool.category}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{tool.name}</h3>
                <p className="mt-2 max-w-md text-sm leading-5 text-muted-foreground">{tool.description}</p>
                <div className="mt-auto pt-5">
                  <Button onClick={() => openTool(tool)} variant={available ? "default" : "outline"} className={`h-9 gap-2 rounded-xl px-3.5 text-xs ${available ? "" : "bg-transparent"}`}>
                    {available ? "Open tool" : "Coming soon"}
                    <ArrowUpRight className="h-3.5 w-3.5 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {matchingTools.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-white/50 px-5 py-10 text-center">
            <p className="text-sm font-medium">No tools match that search.</p>
            <Button onClick={() => { setQuery(""); setCategory("All tools"); }} variant="link" className="mt-1 h-auto px-0 text-xs">Clear filters</Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
