export type ChecklistItem = {
  id: string;
  label: string;
  guidance?: string;
  required?: boolean;
};

export type ChecklistSection = {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
};

export type ChecklistDefinition = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  updatedLabel?: string;
  sections: ChecklistSection[];
};

const section = (id: string, title: string, description: string, items: ChecklistItem[]): ChecklistSection => ({ id, title, description, items });
const item = (id: string, label: string, guidance?: string, required = false): ChecklistItem => ({ id, label, guidance, required });

export const checklistDefinitions: ChecklistDefinition[] = [
  {
    id: "seo-qa",
    name: "SEO QA Checklist",
    shortDescription: "Protect crawlability, indexation, structured data, redirects, and search visibility around a launch.",
    description: "Use before and immediately after a new page, removal, URL change, or site update. These checks are distinct from build-focused Technical QA and copy-focused Content QA.",
    sections: [
      section("crawl-indexation", "Crawling & indexation", "Confirm a change did not introduce new crawlability or indexation problems.", [
        item("site-audit", "Run an Ahrefs Site Audit after the update is live.", undefined, true),
        item("new-issues", "Review the New Issues and Affected URLs sections."),
        item("crawl-impact", "Confirm no new crawl errors, redirect issues, canonical errors, or indexing problems resulted from the change.", undefined, true),
      ]),
      section("structured-data", "Structured data (Schema)", "Confirm the updated page type still emits the expected structured data.", [
        item("schema-loads", "Confirm schema markup loads for the relevant template, such as Article, LocalBusiness, Product, FAQ, or Service.", undefined, true),
        item("schema-validates", "Confirm the updated template has no schema errors or warnings in a schema validator.", undefined, true),
      ]),
      section("redirects", "Redirects & URL handling", "Preserve SEO equity and keep URL signals stable.", [
        item("new-url-final", "For a new landing page, confirm the URL is final, stable, and not expected to change after launch."),
        item("new-url-redirects", "For a new landing page, confirm there are no unintentional redirects on the new URL."),
        item("removed-target", "For a removed page, confirm a planned 301 redirect target is in place.", undefined, true),
        item("removed-relevance", "Confirm a removed page redirects to a topically relevant target."),
        item("removed-links", "Confirm old URLs no longer appear in internal linking patterns."),
        item("changed-redirect", "When a URL changed, confirm the old URL redirects correctly."),
        item("changed-canonical", "When a URL changed, confirm the canonical tag reflects the new URL."),
      ]),
      section("indexing", "Indexing & Search Console monitoring", "Confirm search engines can index updated pages and that removals resolve correctly.", [
        item("new-inspect", "For a new page, inspect the URL in Google Search Console to confirm it is indexable."),
        item("new-submit", "For a new page, submit the URL for indexing."),
        item("removed-gsc", "For a removed page, confirm Search Console shows the redirect working properly."),
        item("removed-soft-404", "Check for soft 404 or incorrect removal warnings."),
      ]),
      section("post-launch", "Post-launch performance monitoring", "Watch for avoidable search-visibility damage after release.", [
        item("monitor-traffic", "Monitor organic traffic, impressions, and clicks for the next 7–14 days."),
        item("monitor-rankings", "Confirm no unexpected ranking drops occur for major page-related keywords."),
        item("monitor-coverage", "Review new Search Console coverage warnings that appear after launch."),
      ]),
    ],
  },
  {
    id: "technical-qa",
    name: "Technical QA Checklist",
    shortDescription: "Validate responsive implementation, interaction quality, accessibility, forms, and measurement before User QA.",
    description: "Work mobile first. Validate the build on an actual phone or equivalent mobile testing workflow before relying on desktop inspection.",
    updatedLabel: "Last updated Nov 14, 2025",
    sections: [
      section("content-media", "Content review · media", "Ensure media is configured, accessible, and resilient.", [
        item("responsive-sources", "Responsive media sources are configured where needed."),
        item("decorative-role", "Decorative graphics use role=presentation so screen readers can ignore them."),
        item("video-controls", "Video controls are enabled."),
        item("captions", "Captions or subtitles are available when provided."),
        item("posters", "Video posters or fallbacks are configured."),
        item("transcripts", "Transcripts are added where required."),
      ]),
      section("links", "Content review · links", "Confirm every route behaves as intended.", [
        item("links-resolve", "All internal and external links resolve to the correct destination with HTTP 200.", undefined, true),
        item("no-loops", "No 404s or redirect loops occur."),
        item("anchor-spacing", "When a sticky header exists, anchor-link spacing is implemented correctly."),
      ]),
      section("layout", "UI & UX · layout and design", "Confirm the page feels native to the existing design system.", [
        item("site-style", "The page or feature stylistically matches the rest of the site."),
        item("brand-colours", "Proper brand colours are used."),
        item("typography", "Typography, heading sizes, and paragraph styles are consistent."),
        item("buttons", "Buttons use the established design system for shape, hover states, shadows, and colour-coded actions."),
        item("imagery", "Imagery and icons are consistent in tone and proportions."),
        item("nav-footer", "Navigation and footer integrate with the rest of the site in placement, colour, and behaviour."),
        item("alignment", "Consistent alignment is maintained across the site."),
        item("scanning", "Elements align to shared axes and guide the eye through sections without unnecessary strain."),
      ]),
      section("forms-interaction", "UI & UX · navigation, forms, and interaction", "Exercise the practical paths a visitor can take.", [
        item("touch-nav", "Navigation is fully usable on touch devices."),
        item("required-fields", "Required form fields are validated."),
        item("input-validation", "Email formats, character limits, and related input validation work."),
        item("form-submission", "Form submission completes successfully."),
        item("spam", "Spam protection is enabled and working."),
        item("errors", "Error messages are clear, attach to the correct field, and describe the needed correction."),
        item("confirmation", "A thank-you message or page appears after a successful submission."),
        item("notifications", "The client receives submissions properly and confirmation emails are sent to the submitter."),
        item("modal-close", "Escape or overlay click closes modals and focus returns to the trigger."),
        item("no-js", "Core information and features have an appropriate no-JavaScript fallback for users and crawlers."),
      ]),
      section("core-functionality", "Core functionality", "Validate optional product capabilities when they exist.", [
        item("search", "If search exists, it returns relevant results, includes a no-results state, and preserves state when returning from a result."),
        item("filters", "If filtering exists, Clear all works, URL parameters reflect filtering, and state is preserved when navigating back."),
        item("auth", "Registration, login, logout, and password-recovery flows complete successfully when present."),
        item("auth-expiry", "Password reset links expire appropriately."),
        item("auth-enumeration", "Authentication errors do not reveal whether an account, email, or username exists."),
      ]),
      section("accessibility", "Accessibility & usability", "Confirm the experience works without a mouse and remains understandable.", [
        item("keyboard", "Navigate the full site with only the Tab key; interactive elements are reachable in a logical order.", undefined, true),
        item("contrast", "Text and background colours meet readable WCAG contrast levels."),
        item("semantic-regions", "Semantic header, nav, main, and footer regions are used."),
      ]),
      section("responsive", "Responsive & cross-browser", "Validate the site across the contexts that matter to real users.", [
        item("breakpoints", "Test desktop, tablet, and mobile; no text overlaps, distorted images, or hidden content appear."),
        item("common-widths", "Test common widths: 320, 360/375/390, 414, 768, 1024, 1280, and 1440+."),
        item("analytics-widths", "Test the top five screen sizes identified in Analytics."),
        item("orientation", "Portrait and landscape mobile orientations adapt correctly."),
        item("browsers", "Verify Chrome, Firefox, and Safari appearance and functionality."),
        item("touch-targets", "On touch devices, actions are clear, tappable, and gestures work as intended."),
      ]),
      section("tracking", "Tracking & measurement", "Confirm measurement was not damaged by the release.", [
        item("clicks", "Confirm internal and external click tracking works."),
        item("submissions", "Confirm form events submit properly and the correct single event fires."),
        item("callrail", "When applicable, confirm CallRail loads and swaps correctly."),
        item("third-party", "Confirm relevant third-party widgets and their events work."),
        item("user-qa-handoff", "Before User QA, identify the applicable User QA items for the project owner or strategist."),
      ]),
    ],
  },
  {
    id: "user-qa",
    name: "User QA Checklist",
    shortDescription: "Run core tasks like a real visitor on phone and desktop, record friction, and attach evidence.",
    description: "Use an Incognito or Private window. Run through core tasks on desktop and phone; attach a screenshot or short recording to every finding.",
    updatedLabel: "Last updated Nov 14, 2025",
    sections: [
      section("setup", "How to use", "Set up a realistic manual review.", [
        item("private-window", "Use an Incognito or Private window."),
        item("core-tasks", "Run core tasks on desktop and phone; note confusion, friction, or mismatched expectations."),
        item("evidence", "Attach screenshots or a short recording with each note."),
        item("tablet", "QA tablet when it represents at least 10% of the site’s total traffic."),
      ]),
      section("links-ctas", "Content review · links and CTAs", "Ensure visitors always know where actions lead.", [
        item("major-links", "Major links and CTAs open the correct page."),
        item("one-cta", "On mobile, slowly scroll the page and confirm no more than one primary CTA is visible at any moment, excluding navigation."),
        item("cta-system", "The site uses only one primary CTA and one secondary CTA consistently across pages."),
        item("external-tabs", "External links open in a new tab."),
        item("anchors", "Anchor links and in-page jumps land at the correct section."),
      ]),
      section("mobile-interaction", "UI & UX · mobile interactions", "Prioritize touch behaviour and retained page context.", [
        item("mobile-menu", "The mobile menu opens and closes with one tap, and menu items are large enough to tap reliably."),
        item("interactive-elements", "Sliders, carousels, and pop-ups move, swipe, and close smoothly without freezing, jumping, or overlap."),
        item("popups", "Pop-ups close with outside click or X and preserve the visitor’s scroll position."),
        item("no-js-content", "With JavaScript disabled, all core service/product text and supporting images remain available."),
      ]),
      section("clarity", "Accessibility & usability · clarity", "Confirm the interface explains itself.", [
        item("heading-structure", "Each page has one descriptive H1 and logically ordered H2–H4 headings."),
        item("instructions", "Custom feature instructions explain what to do and lead to the expected result."),
        item("cta-clarity", "Every CTA states its action clearly and reaches the correct destination."),
        item("screen-reader", "When included, headings and buttons make sense when read aloud with a screen reader."),
      ]),
      section("responsive", "Responsive & technical SEO", "Confirm parity across devices and basic indexability signals.", [
        item("content-parity", "All important desktop text, images, CTAs, and sections also appear on mobile."),
        item("tap-targets", "Mobile buttons are large enough to tap without zooming or accidental activation."),
        item("robots", "Robots exclusion checker does not flag issues."),
      ]),
    ],
  },
  {
    id: "content-qa",
    name: "Content QA Checklist",
    shortDescription: "Validate client-approved content for accuracy, structure, clarity, terminology, compliance, and content SEO.",
    description: "Use the Client Hub, Needs Assessment, and Marketing Questionnaire as sources of truth. Flag unclear content rather than rewriting it unless directed by the strategist.",
    sections: [
      section("review-setup", "Review setup", "Compare the current page against approved content and the change history.", [
        item("references", "Open the Client Hub, Needs Assessment, Marketing Questionnaire, and any relevant tickets or historical tasks."),
        item("ahrefs", "In Ahrefs, inspect the exact page URL and select a date on or after the change."),
        item("compare", "Use Text or HTML comparison to review changes between dates."),
      ]),
      section("accuracy", "Accuracy review", "Verify every factual business and service detail.", [
        item("business-details", "Names, locations, service areas, phone numbers, and hours match current client details."),
        item("team-details", "Team-member names and credentials match client-provided information."),
        item("pricing", "Pricing and cost references match the source documents exactly."),
        item("claims", "Guarantees, timelines, and process descriptions are accurate and not exaggerated."),
        item("outdated", "No old locations, discontinued services, historical pricing, or other outdated information remains."),
        item("services", "Every listed service aligns with the official offering and uses the approved wording."),
        item("terminology", "Terminology is consistent across the entire page."),
      ]),
      section("structure", "Structure & section logic", "Make the content easy to follow before judging style.", [
        item("opening", "The first two to three sentences clearly explain what the page is about."),
        item("one-topic", "Each section covers one topic or idea."),
        item("headings", "Headings accurately represent the content beneath them."),
        item("sequence", "No section relies on information that has not yet been introduced."),
        item("paragraph-focus", "Paragraphs do not combine unrelated ideas."),
        item("clarity-review", "Flag unclear sections, repeated ideas, or mismatched headings for strategist review."),
      ]),
      section("readability", "Clarity & readability", "Use Grammarly and Hemingway as guidance, then flag actual comprehension issues.", [
        item("sentences", "Sentences are short, direct, and readable; flag unnecessary run-ons above roughly 20–22 words."),
        item("filler", "No filler, vague introductions, or unapproved hype language appears."),
        item("reading-level", "Reading level is appropriate; flag hard-to-read passages when they affect comprehension."),
        item("warnings", "Review Grammarly and Hemingway warnings and flag only those that affect understanding."),
        item("heading-format", "Headings are short, descriptive, and consistently formatted."),
        item("emphasis", "Bold, italics, and underlining follow the content rules and are not mixed or overused."),
      ]),
      section("terminology-compliance", "Terminology & factual safety", "Protect consistency and regulated-industry safety.", [
        item("capitalization", "Capitalization follows the client guideline or existing page style."),
        item("spelling", "Use Canadian English by default unless the client is US-based, and avoid inconsistent alternate spellings."),
        item("keyword-find", "Use search to identify unapproved synonyms, creative variations, or alternate spellings."),
        item("regulated-claims", "No promises of outcomes, cures, guarantees, unverified data, or unrecognized specialization claims appear."),
        item("process-facts", "Processes, wait times, approvals, and regulated services match the client-approved statements."),
      ]),
      section("content-seo", "SEO alignment · content-specific", "Validate on-page relevance without performing SEO strategy work.", [
        item("keyword-intro", "The primary keyword or topic appears naturally in the first paragraph."),
        item("keyword-heading", "The main keyword appears in at least one H2–H5 subheading."),
        item("intent", "The page immediately communicates the user intent it serves."),
        item("depth", "No thin sections remain; each provides enough standalone information."),
        item("human-first", "Content is written for humans and avoids keyword stuffing."),
        item("blog-date", "For a refreshed blog post, update the published or edited date as appropriate."),
      ]),
      section("images-metadata", "Images & metadata", "Protect image quality, accessibility, and SEO-critical fields.", [
        item("format", "Use JPG or WebP for content images/backgrounds and PNG when transparency is needed."),
        item("ratio", "Image aspect ratios are preserved without stretching or squishing."),
        item("size", "Actual image dimensions are no more than 50% larger than rendered dimensions."),
        item("alt", "Informative images have descriptive alt text that conveys the main subject."),
        item("filename", "Images use descriptive file names."),
        item("meta", "The SEO title and meta description are present, unique, and relevant to the page."),
      ]),
      section("page-specific", "Service pages & landing-page alignment", "Apply when these page types are in scope.", [
        item("service-intent", "In the hero and first section, clearly state what the service is, who it is for, and how it is delivered at a high level."),
        item("service-area", "Location mentions align only with the page’s intended targeting."),
        item("keyword-count", "The exact primary keyword appears at least five times and is distributed naturally across the page."),
        item("ads-alignment", "For Google Ads landing pages, relevant top search terms appear naturally at least twice; flag unrelated terms or intent mismatch to the Ads strategist."),
      ]),
    ],
  },
  {
    id: "google-ads-qa",
    name: "Google Ads QA Checklist",
    shortDescription: "Review account, campaign, conversion, creative, asset, budget, and policy settings before optimization work.",
    description: "Use the Google Ads Review and Client Management sheets as the source of truth for budgets, location targeting, and campaign intent.",
    sections: [
      section("account", "Account-level settings", "Confirm the account foundation before reviewing campaigns.", [
        item("linked", "The account is linked properly to GA4 and Google Search Console."),
        item("merchant", "Merchant Centre is linked when applicable."),
        item("autotagging", "Auto-tagging is on."),
        item("call-reporting", "Call reporting is disabled."),
      ]),
      section("campaign", "Campaign-level settings", "Confirm the core configuration is intentional.", [
        item("networks", "Search and Display networks are disabled."),
        item("locations", "Correct locations are targeted with Presence: people in or regularly in included locations."),
        item("language", "Language is English."),
        item("dates", "No end date exists unless it is explicitly addressed in the Google Ads Review sheet."),
        item("rotation", "Ad rotation is set to optimize."),
        item("schedule", "An intentional ad schedule is set; no accidental 24/7 schedule exists."),
        item("auto-apply", "No Recommendations auto-apply settings are selected."),
      ]),
      section("conversions", "Microconversions & bidding readiness", "Use supporting signals only when needed to meet a reliable conversion threshold.", [
        item("conversion-actions", "Review conversion actions and identify items labelled as microconversions."),
        item("threshold", "Determine whether macroconversions alone can reach roughly 30 conversions in the last 30 days per campaign."),
        item("minimum-signals", "Use the minimum number of microconversions required to consistently meet the threshold."),
        item("value-order", "Prioritize microconversions closest to a true conversion, such as Contact Us page view over dwell timer."),
      ]),
      section("budget-keywords", "Budget, bidding & ad-group organization", "Keep spend and keyword structure intentional.", [
        item("budget", "Daily budget matches the Google Ads Review and Client Management sheet."),
        item("duplicates", "No duplicate keywords exist across ad groups unless strategically intended."),
        item("spelling", "Keywords are spelled correctly."),
        item("negatives", "Regular negative keywords are added and competitor names in high-impression search terms are evaluated quickly."),
      ]),
      section("rsa", "Responsive search ads", "Validate ad coverage, relevance, and quality.", [
        item("ad-count", "Each ad group has at least one ad and no ad has a Poor ad-strength score."),
        item("headlines", "Ads include at least 11 headlines covering service/intent keywords, a location modifier, CTAs, and UVPs."),
        item("pinning", "All headlines are not pinned."),
        item("search-terms", "High-impression terms are either negative keywords or reflected in a relevant headline."),
        item("descriptions", "Four descriptions can combine without conflict or duplicate ideas."),
        item("paths-urls", "Display paths, final URLs, grammar, and page intent are correct."),
      ]),
      section("assets", "Required & optional assets", "Confirm every campaign/ad group has appropriate, accurate assets.", [
        item("required-images", "Each campaign or ad group has an appropriate image asset."),
        item("brand-assets", "Business name and logo are configured at account level."),
        item("sitelinks", "At least four relevant sitelinks exist at the appropriate account, campaign, or ad-group level."),
        item("callouts", "At least five relevant callouts and one structured snippet are present."),
        item("call", "Call asset uses the CallRail Google Call Asset extension number."),
        item("optional-assets", "Lead form, location, price, app, and promotion assets are intentionally configured and accurate when present."),
      ]),
      section("policy", "Policy, disapprovals & quality", "Separate real blockers from informational policy labels.", [
        item("budget-status", "Review whether campaigns are limited by budget and determine whether reallocation or more budget should be discussed."),
        item("disapprovals", "Check ad-group and ad statuses; distinguish paused legacy items from active disapprovals."),
        item("policy-manager", "Use Policy Manager to identify the actual disapproval reason and resolve active problems."),
        item("limited-policy", "For Health in personalized advertising, confirm whether ads are actually disapproved before treating the label as a blocker."),
      ]),
    ],
  },
];

export function getChecklistItemCount(checklist: ChecklistDefinition) {
  return checklist.sections.reduce((count, currentSection) => count + currentSection.items.length, 0);
}

export function getChecklistById(id: string) {
  return checklistDefinitions.find(checklist => checklist.id === id);
}
