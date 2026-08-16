import { describe, expect, it } from "vitest";
import { buildLocalBusinessSchema, createSchemaDraft, findLocalBusinessType, isLocalBusinessType, localBusinessTypes, validateSchemaDraft } from "@adster/schema-core";

describe("LocalBusiness schema builder", () => {
  it("includes the full unique LocalBusiness descendant catalog and resolves core subtype relationships", () => {
    expect(localBusinessTypes).toHaveLength(131);
    expect(new Set(localBusinessTypes.map(type => type.value)).size).toBe(131);
    expect(findLocalBusinessType("RoofingContractor")?.category).toBe("Home & construction");
    expect(findLocalBusinessType("GroceryStore")?.category).toBe("Retail");
    expect(isLocalBusinessType("Restaurant", "FoodEstablishment")).toBe(true);
    expect(isLocalBusinessType("PhysiciansOffice", "MedicalBusiness")).toBe(true);
    expect(isLocalBusinessType("AutoRepair", "Store")).toBe(false);
  });

  it("constructs a compact Restaurant JSON-LD object from a populated draft", () => {
    const draft = {
      ...createSchemaDraft(),
      businessType: "FoodEstablishment" as const,
      businessSubtype: "Restaurant",
      name: "Example Restaurant",
      url: "https://example.com",
      streetAddress: "123 Main Street",
      addressLocality: "Denver",
      addressRegion: "CO",
      postalCode: "80202",
      addressCountry: "US",
      latitude: "39.7392",
      longitude: "-104.9903",
      openingHours: "Mo-Fr 11:00-22:00\nSa-Su 12:00-22:00",
      servesCuisine: "Italian, Pizza",
      acceptsReservations: true,
    };

    expect(buildLocalBusinessSchema(draft)).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: "Example Restaurant",
      openingHours: ["Mo-Fr 11:00-22:00", "Sa-Su 12:00-22:00"],
      servesCuisine: ["Italian", "Pizza"],
      acceptsReservations: true,
      address: { "@type": "PostalAddress", addressLocality: "Denver" },
      geo: { "@type": "GeoCoordinates", latitude: "39.7392", longitude: "-104.9903" },
    });
  });

  it("does not emit empty properties", () => {
    const schema = buildLocalBusinessSchema(createSchemaDraft());

    expect(schema).toEqual({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
    });
  });

  it("reports malformed values and missing recommendations without inventing Schema.org required fields", () => {
    const validation = validateSchemaDraft({
      ...createSchemaDraft(),
      url: "not-a-url",
      latitude: "39.7",
      sameAs: "also-not-a-url",
    });

    expect(validation.errors.map(issue => issue.label)).toEqual(expect.arrayContaining(["url", "geo", "sameAs"]));
    expect(validation.recommendations.some(issue => issue.label === "name")).toBe(true);
  });

});
