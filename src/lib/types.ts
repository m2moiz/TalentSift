// ── Enums ────────────────────────────────────────────────────────────────────

export const MatchScore = {
	Fort: "Fort",
	Moyen: "Moyen",
	Faible: "Faible",
} as const;

export type MatchScore = (typeof MatchScore)[keyof typeof MatchScore];

export const Recommendation = {
	CallFirst: "Call First",
	Backup: "Backup",
	Reject: "Reject",
} as const;

export type Recommendation =
	(typeof Recommendation)[keyof typeof Recommendation];

// ── Operational History ──────────────────────────────────────────────────────

export interface OperationHistory {
	/** Free-text memory of manager preferences, biases, and past decisions */
	readonly text: string;
}

// ── Feature 1 — Need Analysis ────────────────────────────────────────────────

export interface NeedFormInput {
	readonly client: string;
	readonly operationalManager: string;
	readonly jobTitle: string;
	readonly jobDescription: string;
	readonly contextQualification: string;
	readonly tjm: string;
	readonly location: string;
	readonly startDate: string;
	readonly remoteMode: string;
}

export interface NeedAnalysisOutput {
	readonly summary: string;
	readonly mustHaveSkills: readonly string[];
	readonly niceToHaveSkills: readonly string[];
	readonly watchPoints: readonly string[];
	readonly idealProfile: string;
	readonly opHistoryImpact: string;
}

// ── Feature 2 — CV Matching ──────────────────────────────────────────────────

export interface CvEntry {
	/** Display label for the candidate */
	readonly name: string;
	/** Pasted CV text content */
	readonly cvText: string;
}

export interface CandidateMatch {
	readonly name: string;
	readonly matchScore: MatchScore;
	readonly numericScore: number;
	readonly recommendation: Recommendation;
	readonly strengths: readonly string[];
	readonly watchPoints: readonly string[];
	readonly callQuestions: readonly string[];
	readonly opHistoryAlignment: string;
}

export interface CvMatchOutput {
	readonly candidates: readonly CandidateMatch[];
}

// ── Feature 3 — Ranking ──────────────────────────────────────────────────────

export interface RankingEntry {
	readonly rank: number;
	readonly candidateName: string;
	readonly rationale: string;
	readonly nextAction: string;
}

// ── Feature 4 — Dashboard (Brief + Pitch) ────────────────────────────────────

export interface ClientBrief {
	readonly firstName: string;
	readonly headline: string;
	readonly experienceSummary: string;
	readonly strengths: readonly string[];
	readonly watchPoints: readonly string[];
	/** TDU-format infos complémentaires */
	readonly infosComplementaires: InfosComplementaires;
}

export interface InfosComplementaires {
	readonly yearsOfExperience: string;
	readonly keySkills: readonly string[];
	readonly availability: string;
	readonly tjm: string;
}

export interface DashboardOutput {
	readonly ranking: readonly RankingEntry[];
	readonly opHistoryNote: string;
	readonly clientBrief: ClientBrief;
	readonly pitchScript: string;
}

// ── API Error Types ──────────────────────────────────────────────────────────

export interface ApiError {
	readonly kind: ApiErrorKind;
	readonly message: string;
	readonly status?: number;
}

export const ApiErrorKind = {
	MissingKey: "MissingKey",
	Timeout: "Timeout",
	MalformedResponse: "MalformedResponse",
	HttpError: "HttpError",
	NetworkError: "NetworkError",
} as const;

export type ApiErrorKind = (typeof ApiErrorKind)[keyof typeof ApiErrorKind];

// ── Mock Mode ────────────────────────────────────────────────────────────────

export interface MockConfig {
	readonly enabled: boolean;
	readonly delayMs: number;
}
