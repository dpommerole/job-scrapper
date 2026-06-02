export type SourceType =
  | "jobboard"
  | "freelance-platform"
  | "recruiter-website"
  | "company-careers"
  | "newsletter"
  | "email-alert"
  | "rss"
  | "manual-import"
  | "csv"
  | "social-public-post"
  | "community";

export type CollectionMethod =
  | "api"
  | "rss"
  | "email"
  | "csv"
  | "manual"
  | "public-page"
  | "saved-html"
  | "not-recommended";

export type Source = {
  id: string;
  name: string;
  url?: string;
  type: SourceType;
  collectionMethod: CollectionMethod;
  priority: "high" | "medium" | "low";
  complianceRisk: "low" | "medium" | "high";
  notes?: string;
};
