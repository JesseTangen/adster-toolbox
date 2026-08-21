export type BusinessFamily = string;

export const schemaDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type SchemaDay = (typeof schemaDays)[number];

export type OpeningHoursRow = {
  id: string;
  dayOfWeek: SchemaDay[];
  opens: string;
  closes: string;
};

export type SchemaDraft = {
  id: string;
  label: string;
  businessType: BusinessFamily;
  businessSubtype: string;
  name: string;
  description: string;
  url: string;
  telephone: string;
  email: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  latitude: string;
  longitude: string;
  openingHours: string;
  openingHoursRows: OpeningHoursRow[];
  open24Hours: boolean;
  priceRange: string;
  logo: string;
  sameAs: string;
  servesCuisine: string;
  menu: string;
  acceptsReservations: boolean;
  medicalSpecialty: string;
  areaServed: string;
  currenciesAccepted: string;
  paymentAccepted: string;
};

export type ValidationIssue = {
  field: keyof SchemaDraft | "schema";
  label: string;
  message: string;
  severity: "error" | "recommended";
};

export const createSchemaDraft = (): SchemaDraft => ({
  id: crypto.randomUUID(),
  label: "",
  businessType: "LocalBusiness",
  businessSubtype: "LocalBusiness",
  name: "",
  description: "",
  url: "",
  telephone: "",
  email: "",
  streetAddress: "",
  addressLocality: "",
  addressRegion: "",
  postalCode: "",
  addressCountry: "",
  latitude: "",
  longitude: "",
  openingHours: "",
  openingHoursRows: [],
  open24Hours: false,
  priceRange: "",
  logo: "",
  sameAs: "",
  servesCuisine: "",
  menu: "",
  acceptsReservations: false,
  medicalSpecialty: "",
  areaServed: "",
  currenciesAccepted: "",
  paymentAccepted: "",
});

function compact(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => {
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null;
    }),
  );
}

function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map(item => item.trim())
    .filter(Boolean);
}

const dayAliases: Record<string, SchemaDay> = {
  mo: "Monday", mon: "Monday", monday: "Monday",
  tu: "Tuesday", tue: "Tuesday", tues: "Tuesday", tuesday: "Tuesday",
  we: "Wednesday", wed: "Wednesday", wednesday: "Wednesday",
  th: "Thursday", thu: "Thursday", thur: "Thursday", thurs: "Thursday", thursday: "Thursday",
  fr: "Friday", fri: "Friday", friday: "Friday",
  sa: "Saturday", sat: "Saturday", saturday: "Saturday",
  su: "Sunday", sun: "Sunday", sunday: "Sunday",
};

export type OpeningHoursSpecification = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: SchemaDay[];
  opens: string;
  closes: string;
};

function normalizeTime(value: string) {
  const [hours, minutes] = value.split(":");
  return `${hours?.padStart(2, "0")}:${minutes}`;
}

function expandDayRange(value: string) {
  return value.split(",").flatMap(part => {
    const [startToken, endToken] = part.trim().toLowerCase().split(/\s*[-–]\s*/);
    const start = startToken ? dayAliases[startToken] : undefined;
    const end = endToken ? dayAliases[endToken] : undefined;
    if (!start) return [];
    if (!end) return [start];
    const startIndex = schemaDays.indexOf(start);
    const endIndex = schemaDays.indexOf(end);
    if (startIndex <= endIndex) return schemaDays.slice(startIndex, endIndex + 1);
    return [...schemaDays.slice(startIndex), ...schemaDays.slice(0, endIndex + 1)];
  });
}

function parseOpeningHoursSpecification(value: string): OpeningHoursSpecification | undefined {
  const match = value.match(/^([A-Za-z]+(?:\s*[-–]\s*[A-Za-z]+)?(?:\s*,\s*[A-Za-z]+(?:\s*[-–]\s*[A-Za-z]+)?)*)\s*:?\s+(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})$/);
  if (!match) return undefined;
  const days = expandDayRange(match[1] ?? "");
  if (!days.length) return undefined;
  return { "@type": "OpeningHoursSpecification", dayOfWeek: days, opens: normalizeTime(match[2] ?? ""), closes: normalizeTime(match[3] ?? "") };
}

function groupOpeningHours(lines: string[]) {
  const specifications = lines.map(parseOpeningHoursSpecification);
  if (!specifications.every(Boolean)) return undefined;
  const grouped = new Map<string, OpeningHoursSpecification>();
  for (const specification of specifications) {
    if (!specification) continue;
    const key = `${specification.opens}-${specification.closes}`;
    const existing = grouped.get(key);
    if (existing) existing.dayOfWeek.push(...specification.dayOfWeek);
    else grouped.set(key, specification);
  }
  return Array.from(grouped.values());
}

export function createOpeningHoursRow(): OpeningHoursRow {
  return { id: crypto.randomUUID(), dayOfWeek: [], opens: "09:00", closes: "17:00" };
}

export function buildOpeningHoursSpecifications(rows: OpeningHoursRow[] = [], open24Hours = false) {
  if (open24Hours) {
    return [{ "@type": "OpeningHoursSpecification" as const, dayOfWeek: [...schemaDays], opens: "00:00", closes: "23:59" }];
  }
  const grouped = new Map<string, OpeningHoursSpecification>();
  for (const row of rows) {
    const days = row.dayOfWeek.filter(day => schemaDays.includes(day));
    if (!days.length || !/^\d{1,2}:\d{2}$/.test(row.opens) || !/^\d{1,2}:\d{2}$/.test(row.closes)) continue;
    const opens = normalizeTime(row.opens);
    const closes = normalizeTime(row.closes);
    const key = `${opens}-${closes}`;
    const existing = grouped.get(key);
    if (existing) existing.dayOfWeek.push(...days);
    else grouped.set(key, { "@type": "OpeningHoursSpecification", dayOfWeek: [...days], opens, closes });
  }
  return Array.from(grouped.values()).map(specification => ({ ...specification, dayOfWeek: schemaDays.filter(day => specification.dayOfWeek.includes(day)) }));
}

export function getEffectiveType(draft: SchemaDraft) {
  return draft.businessSubtype || draft.businessType || "LocalBusiness";
}

export function buildLocalBusinessSchema(draft: SchemaDraft) {
  const address = compact({
    "@type": "PostalAddress",
    streetAddress: draft.streetAddress,
    addressLocality: draft.addressLocality,
    addressRegion: draft.addressRegion,
    postalCode: draft.postalCode,
    addressCountry: draft.addressCountry,
  });
  const geo = compact({
    "@type": "GeoCoordinates",
    latitude: draft.latitude,
    longitude: draft.longitude,
  });
  const openingHours = splitLines(draft.openingHours);
  const structuredHours = buildOpeningHoursSpecifications(draft.openingHoursRows ?? [], draft.open24Hours ?? false);
  const usesStructuredHours = Boolean(draft.open24Hours) || (draft.openingHoursRows?.length ?? 0) > 0;
  const openingHoursSpecification = usesStructuredHours ? structuredHours : groupOpeningHours(openingHours);
  const sameAs = splitLines(draft.sameAs);
  const servesCuisine = splitLines(draft.servesCuisine);

  const schema = compact({
    "@context": "https://schema.org",
    "@type": getEffectiveType(draft),
    name: draft.name,
    description: draft.description,
    url: draft.url,
    telephone: draft.telephone,
    email: draft.email,
    address: Object.keys(address).length > 1 ? address : undefined,
    geo: Object.keys(geo).length > 1 ? geo : undefined,
    openingHours: openingHoursSpecification ? undefined : openingHours.length === 1 ? openingHours[0] : openingHours,
    openingHoursSpecification,
    priceRange: draft.priceRange,
    logo: draft.logo,
    sameAs,
    servesCuisine,
    menu: draft.menu,
    acceptsReservations: draft.acceptsReservations ? true : undefined,
    medicalSpecialty: draft.medicalSpecialty,
    areaServed: draft.areaServed,
    currenciesAccepted: draft.currenciesAccepted,
    paymentAccepted: draft.paymentAccepted,
  });

  return schema;
}

function isUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateSchemaDraft(draft: SchemaDraft) {
  const errors: ValidationIssue[] = [];
  const recommendations: ValidationIssue[] = [];

  if (!draft.name.trim()) {
    recommendations.push({
      field: "name",
      label: "name",
      message: "Recommended to identify this LocalBusiness.",
      severity: "recommended",
    });
  }
  if (!draft.streetAddress.trim() || !draft.addressLocality.trim()) {
    recommendations.push({
      field: "streetAddress",
      label: "address",
      message: "Add a PostalAddress with streetAddress and addressLocality for a physical location.",
      severity: "recommended",
    });
  }
  if (!draft.telephone.trim()) {
    recommendations.push({
      field: "telephone",
      label: "telephone",
      message: "Recommended as a local business contact property.",
      severity: "recommended",
    });
  }
  if (!draft.url.trim()) {
    recommendations.push({
      field: "url",
      label: "url",
      message: "Recommended to connect the entity to its canonical web page.",
      severity: "recommended",
    });
  }
  if (!draft.openingHours.trim() && !(draft.openingHoursRows?.length ?? 0) && !draft.open24Hours) {
    recommendations.push({
      field: "openingHours",
      label: "openingHours",
      message: "Recommended when business hours are available.",
      severity: "recommended",
    });
  }
  if (!draft.latitude.trim() || !draft.longitude.trim()) {
    recommendations.push({
      field: "latitude",
      label: "geo",
      message: "Add latitude and longitude to describe the business location precisely.",
      severity: "recommended",
    });
  }
  if (draft.url.trim() && !isUrl(draft.url.trim())) {
    errors.push({ field: "url", label: "url", message: "Use a valid absolute URL.", severity: "error" });
  }
  if (draft.logo.trim() && !isUrl(draft.logo.trim())) {
    errors.push({ field: "logo", label: "logo", message: "Use a valid absolute URL.", severity: "error" });
  }
  if (draft.menu.trim() && !isUrl(draft.menu.trim())) {
    errors.push({ field: "menu", label: "menu", message: "Use a valid absolute URL.", severity: "error" });
  }
  if (draft.email.trim() && !isEmail(draft.email.trim())) {
    errors.push({ field: "email", label: "email", message: "Use a valid email address.", severity: "error" });
  }
  if (Boolean(draft.latitude.trim()) !== Boolean(draft.longitude.trim())) {
    errors.push({
      field: "latitude",
      label: "geo",
      message: "GeoCoordinates requires both latitude and longitude.",
      severity: "error",
    });
  }
  for (const url of splitLines(draft.sameAs)) {
    if (!isUrl(url)) {
      errors.push({ field: "sameAs", label: "sameAs", message: "Each sameAs value must be a valid absolute URL.", severity: "error" });
      break;
    }
  }

  return { errors, recommendations };
}
