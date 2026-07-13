export type ProjectStatus = "DRAFT" | "ANALYZING" | "COMPLETED" | "FAILED";

export interface ProjectSummary {
  id: string;
  name: string;
  idea: string;
  industry: string | null;
  status: ProjectStatus;
  currentAiScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisSessionStatus {
  id: string;
  projectId: string;
  currentStage: string;
  currentAgent: string | null;
  progress: number;
  status: string;
  confidence: number | null;
  startedAt: string;
  endedAt: string | null;
}

export interface ReportCompetitor {
  name: string;
  website: string | null;
  description: string;
  category: string;
  targetCustomer: string;
  pricingModel: string | null;
  strengths: string[];
  weaknesses: string[];
  popularity: "low" | "medium" | "high";
  confidence: number;
  evidenceUrls: string[];
}

export interface ReportSwot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface ThemeWithFrequency {
  theme: string;
  frequency: "low" | "medium" | "high";
}

export interface SummaryWithFrequency {
  summary: string;
  frequency: "low" | "medium" | "high";
}

export interface ReportReviews {
  positiveThemes: ThemeWithFrequency[];
  negativeThemes: ThemeWithFrequency[];
  missingFeatures: string[];
}

export interface ReportReddit {
  painPoints: SummaryWithFrequency[];
  featureRequests: SummaryWithFrequency[];
  positiveSignals: string[];
}

export interface ReportGap {
  title: string;
  reasoning: string;
  businessOpportunity: string;
  difficulty: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  evidenceUrls: string[];
  confidence: number;
}

export interface ReportKeyword {
  term: string;
  type: "primary" | "secondary" | "long_tail";
  intent: "commercial" | "informational";
  opportunityScore: number;
  cluster: string;
}

export interface ReportMarket {
  demandScore: number;
  growthScore: number;
  difficultyScore: number;
  competitionScore: number;
  opportunityScore: number;
  reasoning: string;
}

export interface ProjectReport {
  id: string;
  projectId: string;
  overallScore: number;
  summary: string;
  createdAt: string;
  data: {
    verdict: string | null;
    biggestOpportunity: string | null;
    biggestRisk: string | null;
    confidence: number | null;
    swot: ReportSwot | null;
    competitors: ReportCompetitor[];
    gaps: ReportGap[];
    keywords: ReportKeyword[];
    market: ReportMarket | null;
    reviews: ReportReviews | null;
    reddit: ReportReddit | null;
  };
}
