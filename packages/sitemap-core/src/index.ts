export const sitemapPageKinds = ["Core", "Supporting", "Conversion", "Utility"] as const;
export type SitemapPageKind = (typeof sitemapPageKinds)[number];

export type SitemapPage = {
  id: string;
  title: string;
  slug: string;
  kind: SitemapPageKind;
  children: SitemapPage[];
};

export const defaultSitemap: SitemapPage = {
  id: "home",
  title: "Homepage",
  slug: "/",
  kind: "Core",
  children: [
    {
      id: "services",
      title: "Services",
      slug: "/services",
      kind: "Core",
      children: [
        { id: "service-detail", title: "Service detail", slug: "/services/service-name", kind: "Conversion", children: [] },
      ],
    },
    { id: "about", title: "About", slug: "/about", kind: "Supporting", children: [] },
    { id: "resources", title: "Resources", slug: "/resources", kind: "Supporting", children: [] },
    { id: "contact", title: "Contact", slug: "/contact", kind: "Conversion", children: [] },
  ],
};

export function cloneSitemapTree(page: SitemapPage): SitemapPage {
  return { ...page, children: page.children.map(cloneSitemapTree) };
}

export function findSitemapPage(root: SitemapPage, id: string): SitemapPage | undefined {
  if (root.id === id) return root;
  for (const child of root.children) {
    const match = findSitemapPage(child, id);
    if (match) return match;
  }
  return undefined;
}

export function slugifySitemapTitle(title: string) {
  const compact = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return compact ? `/${compact}` : "/new-page";
}

export function createSitemapPage(id: string, title = "New page"): SitemapPage {
  return { id, title, slug: slugifySitemapTitle(title), kind: "Supporting", children: [] };
}

export function addSitemapChild(root: SitemapPage, parentId: string, child: SitemapPage): SitemapPage {
  if (root.id === parentId) return { ...root, children: [...root.children, child] };
  return { ...root, children: root.children.map(page => addSitemapChild(page, parentId, child)) };
}

export function updateSitemapPage(root: SitemapPage, id: string, changes: Partial<Omit<SitemapPage, "id" | "children">>): SitemapPage {
  if (root.id === id) return { ...root, ...changes };
  return { ...root, children: root.children.map(page => updateSitemapPage(page, id, changes)) };
}

export function removeSitemapPage(root: SitemapPage, id: string): SitemapPage {
  if (root.id === id) return root;
  return {
    ...root,
    children: root.children.filter(page => page.id !== id).map(page => removeSitemapPage(page, id)),
  };
}

function moveWithinChildren(children: SitemapPage[], id: string, direction: -1 | 1) {
  const index = children.findIndex(page => page.id === id);
  if (index < 0 || index + direction < 0 || index + direction >= children.length) return children;
  const next = [...children];
  [next[index], next[index + direction]] = [next[index + direction], next[index]];
  return next;
}

export function moveSitemapPage(root: SitemapPage, id: string, direction: -1 | 1): SitemapPage {
  return {
    ...root,
    children: moveWithinChildren(root.children, id, direction).map(page => ({ ...page, children: moveSitemapPage(page, id, direction).children })),
  };
}

function reorderSiblingList(children: SitemapPage[], draggedId: string, targetId: string) {
  const draggedIndex = children.findIndex(page => page.id === draggedId);
  const targetIndex = children.findIndex(page => page.id === targetId);
  if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) return children;
  const reordered = [...children];
  const [dragged] = reordered.splice(draggedIndex, 1);
  const insertionIndex = reordered.findIndex(page => page.id === targetId);
  reordered.splice(insertionIndex, 0, dragged);
  return reordered;
}

/** Reorders a page before a sibling target. Pages in different branches are intentionally left unchanged. */
export function reorderSitemapSibling(root: SitemapPage, draggedId: string, targetId: string): SitemapPage {
  return {
    ...root,
    children: reorderSiblingList(root.children, draggedId, targetId).map(page => ({
      ...page,
      children: reorderSitemapSibling(page, draggedId, targetId).children,
    })),
  };
}

export function getSitemapStats(root: SitemapPage) {
  const walk = (page: SitemapPage, depth: number): { pages: number; maxDepth: number } => page.children.reduce(
    (result, child) => {
      const childStats = walk(child, depth + 1);
      return { pages: result.pages + childStats.pages, maxDepth: Math.max(result.maxDepth, childStats.maxDepth) };
    },
    { pages: 1, maxDepth: depth },
  );
  return walk(root, 0);
}
