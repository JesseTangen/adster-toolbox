import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { approvedToolCategories, approvedTools, type ApprovedTool, type ApprovedToolCategory } from "@adster/toolbox-config";
import { ArrowUpRight, Link2, Palette, Search } from "lucide-react";
import { useMemo, useState } from "react";

const toolIcons: Record<ApprovedTool["id"], typeof Link2> = {
  "campaign-url-builder": Link2,
  canva: Palette,
};

export default function ApprovedTools() {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ApprovedToolCategory>("All tools");

  const matchingTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return approvedTools.filter(tool => {
      const matchesCategory = category === "All tools" || tool.category === category;
      const matchesQuery = !normalizedQuery || [tool.name, tool.category, tool.description, ...tool.outcomes]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="mx-auto w-full max-w-7xl pb-10 pt-2 sm:pt-6">
      <header>
        <h1 className="font-editorial text-3xl leading-tight tracking-tight sm:text-4xl">Approved Tool Directory</h1>
        <p className="mt-2 text-sm text-muted-foreground">Search the current list of approved external tools or filter by type.</p>
      </header>

      <section className="mt-6" aria-label="Approved tools directory">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search approved tools"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search tools, categories, or outcomes"
            className="h-11 rounded-full border-border/80 bg-white pl-11 shadow-[0_12px_28px_-24px_rgba(0,92,145,0.45)] dark:bg-card dark:shadow-none"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {approvedToolCategories.map(item => (
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

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {matchingTools.map(tool => {
            const Icon = toolIcons[tool.id];
            return (
              <article
                key={tool.id}
                style={theme === "dark" ? { background: "#122b3f", borderColor: "#2b607e" } : undefined}
                className="group flex min-h-[232px] flex-col rounded-2xl border border-primary/25 bg-white p-5 text-card-foreground shadow-[0_18px_44px_-36px_oklch(0.3_0.03_50)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-[0_26px_50px_-32px_rgba(0,117,166,0.4)] dark:border-[#2b607e] dark:bg-[#122b3f] dark:hover:border-primary/75 dark:hover:shadow-[0_26px_50px_-32px_rgba(0,174,239,0.3)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.09em] text-primary">{tool.category}</span>
                </div>
                <h2 className="mt-5 text-lg font-semibold tracking-tight">{tool.name}</h2>
                <p className="mt-2 max-w-md text-sm leading-5 text-muted-foreground">{tool.description}</p>
                <div className="mt-auto pt-5">
                  <Button asChild className="h-9 gap-2 rounded-xl px-3.5 text-xs">
                    <a href={tool.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${tool.name} in a new tab`}>
                      Open link <ArrowUpRight className="h-3.5 w-3.5 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {matchingTools.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-white/50 px-5 py-10 text-center dark:bg-card/35">
            <p className="text-sm font-medium">No approved tools match that search.</p>
            <Button onClick={() => { setQuery(""); setCategory("All tools"); }} variant="link" className="mt-1 h-auto px-0 text-xs">Clear filters</Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
