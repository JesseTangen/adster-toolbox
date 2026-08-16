export const wireframeSectionTypes = [
  "header",
  "hero",
  "cards",
  "split",
  "text",
  "faq",
  "articles",
  "products",
  "footer",
] as const;

export type WireframeSectionType = (typeof wireframeSectionTypes)[number];

export type WireframeSectionDefinition = {
  type: WireframeSectionType;
  label: string;
  category: "Frame" | "Content" | "Commerce";
  description: string;
  variants: { id: string; label: string; description: string }[];
  defaultTitle: string;
};

export type WireframeSection = {
  id: string;
  type: WireframeSectionType;
  variant: string;
  title: string;
  note: string;
  showViewAll: boolean;
};

export const wireframeSectionDefinitions: WireframeSectionDefinition[] = [
  { type: "header", label: "Header", category: "Frame", description: "Fixed brand, right-aligned navigation, and an action.", defaultTitle: "[Brand Name]", variants: [] },
  { type: "hero", label: "Hero", category: "Content", description: "First impression, primary message, and CTA.", defaultTitle: "A clear message for the people who matter.", variants: [{ id: "split", label: "Split image", description: "Copy beside a visual placeholder." }, { id: "centered", label: "Centered statement", description: "Focused message with supporting CTA." }, { id: "overlay", label: "Image overlay", description: "Copy over a full-bleed visual." }] },
  { type: "cards", label: "Card grid", category: "Content", description: "Feature, service, or proof-point cards.", defaultTitle: "Ways to move the work forward", variants: [{ id: "three", label: "Three columns", description: "Balanced feature comparison." }, { id: "four", label: "Four compact cards", description: "Dense option or category row." }] },
  { type: "split", label: "Image + content", category: "Content", description: "An image paired with explanatory content.", defaultTitle: "A considered section with supporting detail", variants: [{ id: "image-left", label: "Image left", description: "Visual first, explanatory copy second." }, { id: "image-right", label: "Image right", description: "Copy first, visual second." }] },
  { type: "text", label: "Text block", category: "Content", description: "Narrative, value proposition, or structured copy.", defaultTitle: "A focused point of view", variants: [{ id: "narrow", label: "Narrow reading width", description: "Compact copy for a clear argument." }, { id: "statement", label: "Statement", description: "Large editorial statement with a rule." }, { id: "two-column", label: "Two columns", description: "Heading with two supporting text columns." }] },
  { type: "faq", label: "FAQ accordion", category: "Content", description: "Questions that reduce friction or clarify process.", defaultTitle: "Frequently asked questions", variants: [{ id: "simple", label: "Simple list", description: "Open rows with concise answers." }, { id: "bordered", label: "Bordered accordion", description: "Contained expandable question rows." }, { id: "side-by-side", label: "FAQ with intro", description: "Supporting narrative beside question rows." }] },
  { type: "articles", label: "Blog articles", category: "Content", description: "Recent thinking, guides, or learning resources.", defaultTitle: "From the journal", variants: [{ id: "three", label: "Three article cards", description: "Balanced recent-post preview." }, { id: "featured", label: "Featured article", description: "One lead article plus two supporting stories." }, { id: "list", label: "Editorial list", description: "Title-first reading list." }] },
  { type: "products", label: "Product row", category: "Commerce", description: "Products, plans, collections, or offers.", defaultTitle: "Explore the collection", variants: [{ id: "three", label: "Three products", description: "Visual product cards with actions." }, { id: "carousel", label: "Product carousel", description: "Scrollable merchandising row." }, { id: "comparison", label: "Plan comparison", description: "Structured offering comparison." }] },
  { type: "footer", label: "Footer", category: "Frame", description: "Closing navigation, contact routes, and legal detail.", defaultTitle: "Make the next step easy", variants: [] },
];

export function getWireframeSectionDefinition(type: WireframeSectionType) {
const definition = wireframeSectionDefinitions.find(item => item.type === type);
if (!definition) throw new Error(`Unknown wireframe section: ${type}`);
return definition;
}

export function isWireframeBoundarySection(section: Pick<WireframeSection, "type">) {
  return section.type === "header" || section.type === "footer";
}

export function createWireframeSection(type: WireframeSectionType, id = `section-${type}-${Math.random().toString(36).slice(2, 9)}`): WireframeSection {
  const definition = getWireframeSectionDefinition(type);
  return {
    id,
    type,
    variant: definition.variants[0]?.id ?? "default",
    title: definition.defaultTitle,
    note: "",
    showViewAll: type === "cards",
  };
}

export function moveWireframeSection(sections: WireframeSection[], fromIndex: number, toIndex: number) {
if (fromIndex < 0 || toIndex < 0 || fromIndex >= sections.length || toIndex >= sections.length) return sections;
  const source = sections[fromIndex];
  if (!source || isWireframeBoundarySection(source)) return sections;
  const headerIndex = sections.findIndex(section => section.type === "header");
  const footerIndex = sections.findIndex(section => section.type === "footer");
  const firstContentIndex = headerIndex >= 0 ? headerIndex + 1 : 0;
  const lastContentIndex = footerIndex >= 0 ? footerIndex - 1 : sections.length - 1;
  if (toIndex < firstContentIndex || toIndex > lastContentIndex) return sections;
const next = [...sections];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return sections;
  next.splice(toIndex, 0, moved);
  return next;
}
