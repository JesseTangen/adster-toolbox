export const wireframeSectionTypes = [
  "header",
  "hero",
  "columns",
  "split",
  "text",
  "faq",
  "footer",
] as const;

export type WireframeSectionType = (typeof wireframeSectionTypes)[number];

export const multiColumnContentStyles = [
  { id: "feature", label: "Feature", defaultTitle: "Ways to move the work forward", itemLabel: "Feature", media: ["image", "icon"], supportsReadMore: true, hasSummary: true, hasPrice: false, hasCart: false },
  { id: "service", label: "Service", defaultTitle: "How we can help", itemLabel: "Service", media: ["image", "icon", "none"], supportsReadMore: true, hasSummary: true, hasPrice: false, hasCart: false },
  { id: "collection", label: "Product collection", defaultTitle: "Explore collections", itemLabel: "Collection", media: ["image"], supportsReadMore: true, hasSummary: false, hasPrice: false, hasCart: false },
] as const;

export type MultiColumnContentStyle = (typeof multiColumnContentStyles)[number]["id"];
export type MultiColumnMedia = "image" | "icon" | "none";
export type MultiColumnPresentation = "basic" | "card";

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
  multiColumnStyle: MultiColumnContentStyle;
  multiColumnMedia: MultiColumnMedia;
  multiColumnPresentation: MultiColumnPresentation;
  showReadMore: boolean;
  showSeeAll: boolean;
};

export const wireframeSectionDefinitions: WireframeSectionDefinition[] = [
  { type: "header", label: "Header", category: "Frame", description: "Fixed brand, right-aligned navigation, and an action.", defaultTitle: "[Brand Name]", variants: [] },
  { type: "hero", label: "Hero", category: "Content", description: "First impression, primary message, and CTA.", defaultTitle: "A clear message for the people who matter.", variants: [{ id: "split", label: "Split image", description: "Copy beside a visual placeholder." }, { id: "centered", label: "Centered statement", description: "Focused message with supporting CTA." }, { id: "overlay", label: "Image overlay", description: "Copy over a full-bleed visual." }] },
  { type: "columns", label: "Multi column", category: "Content", description: "Configurable features, posts, services, collections, or products.", defaultTitle: "Ways to move the work forward", variants: [{ id: "two", label: "Two columns", description: "A paired, spacious comparison." }, { id: "three", label: "Three columns", description: "A balanced multi-item row." }, { id: "four", label: "Four columns", description: "A denser four-item row." }] },
  { type: "split", label: "Image + content", category: "Content", description: "An image paired with explanatory content.", defaultTitle: "A considered section with supporting detail", variants: [{ id: "image-left", label: "Image left", description: "Visual first, explanatory copy second." }, { id: "image-right", label: "Image right", description: "Copy first, visual second." }] },
  { type: "text", label: "Text block", category: "Content", description: "Narrative, value proposition, or structured copy.", defaultTitle: "A focused point of view", variants: [{ id: "narrow", label: "Narrow reading width", description: "Compact copy for a clear argument." }, { id: "statement", label: "Statement", description: "Large editorial statement with a rule." }, { id: "two-column", label: "Two columns", description: "Heading with two supporting text columns." }] },
  { type: "faq", label: "FAQ accordion", category: "Content", description: "Questions that reduce friction or clarify process.", defaultTitle: "Frequently asked questions", variants: [{ id: "simple", label: "Simple list", description: "Open rows with concise answers." }, { id: "bordered", label: "Bordered accordion", description: "Contained expandable question rows." }, { id: "side-by-side", label: "FAQ with intro", description: "Supporting narrative beside question rows." }] },
  { type: "footer", label: "Footer", category: "Frame", description: "Closing navigation, contact routes, and legal detail.", defaultTitle: "Make the next step easy", variants: [] },
];

export function getWireframeSectionDefinition(type: WireframeSectionType) {
  const definition = wireframeSectionDefinitions.find(item => item.type === type);
  if (!definition) throw new Error(`Unknown wireframe section: ${type}`);
  return definition;
}

export function getMultiColumnContentStyle(style: MultiColumnContentStyle) {
  const definition = multiColumnContentStyles.find(item => item.id === style);
  if (!definition) throw new Error(`Unknown Multi column style: ${style}`);
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
    multiColumnStyle: "feature",
    multiColumnMedia: "image",
    multiColumnPresentation: "basic",
    showReadMore: type === "columns",
    showSeeAll: false,
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
