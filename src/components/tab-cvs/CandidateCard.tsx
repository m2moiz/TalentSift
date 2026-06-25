import type { ReactElement } from "react";
import type { CandidateMatch } from "../../lib/types";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

// ── Props ────────────────────────────────────────────────────────────────────

export interface CandidateCardProps {
	/** The candidate match data to display. When null, renders a skeleton. */
	readonly candidate: CandidateMatch | null;
	/** Optional 1-based display index (e.g., "Candidat 1") */
	readonly index?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreToBadgeVariant(
	score: string,
): "fort" | "moyen" | "faible" | "info" {
	switch (score) {
		case "Fort": {
			return "fort";
		}
		case "Moyen": {
			return "moyen";
		}
		case "Faible": {
			return "faible";
		}
		default: {
			return "info";
		}
	}
}

function scoreColor(score: number): string {
	if (score >= 75) {
		return "text-[var(--status-success)]";
	}
	if (score >= 50) {
		return "text-[var(--status-warning)]";
	}
	return "text-[var(--status-error)]";
}

function recommendationBadgeVariant(
	recommendation: string,
): "fort" | "moyen" | "faible" | "info" {
	switch (recommendation) {
		case "Call First": {
			return "fort";
		}
		case "Backup": {
			return "moyen";
		}
		case "Reject": {
			return "faible";
		}
		default: {
			return "info";
		}
	}
}

// ── Component ────────────────────────────────────────────────────────────────

export function CandidateCard({
	candidate,
	index,
}: CandidateCardProps): ReactElement {
	if (candidate === null) {
		return <CandidateCardSkeleton />;
	}

	const badgeVariant = scoreToBadgeVariant(candidate.matchScore);
	const recBadgeVariant = recommendationBadgeVariant(candidate.recommendation);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle>
							{index !== undefined ? `#${index} ` : ""}
							{candidate.name}
						</CardTitle>
					</div>
					<div className="flex items-center gap-2">
						<span
							className={`text-2xl font-bold tabular-nums ${scoreColor(candidate.numericScore)}`}
						>
							{candidate.numericScore}
						</span>
						<span className="text-xs text-[var(--text-tertiary)]">/100</span>
					</div>
				</div>
				<div className="mt-2 flex flex-wrap gap-2">
					<Badge variant={badgeVariant}>
						{candidate.matchScore}
					</Badge>
					<Badge variant={recBadgeVariant}>
						{candidate.recommendation}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Strengths */}
				{candidate.strengths.length > 0 && (
					<Section label="Forces">
						<ul className="list-inside list-disc space-y-1">
							{candidate.strengths.map((s, i) => (
								<li
									key={i}
									className="text-sm leading-5 text-[var(--text-secondary)]"
								>
									{s}
								</li>
							))}
						</ul>
					</Section>
				)}

				{/* Watch points */}
				{candidate.watchPoints.length > 0 && (
					<Section label="Points de vigilance">
						<ul className="list-inside list-disc space-y-1">
							{candidate.watchPoints.map((w, i) => (
								<li
									key={i}
									className="text-sm leading-5 text-[var(--text-secondary)]"
								>
									{w}
								</li>
							))}
						</ul>
					</Section>
				)}

				{/* Call questions */}
				{candidate.callQuestions.length > 0 && (
					<Section label="Questions d'entretien">
						<ul className="list-inside list-disc space-y-1">
							{candidate.callQuestions.map((q, i) => (
								<li
									key={i}
									className="text-sm leading-5 text-[var(--text-secondary)]"
								>
									{q}
								</li>
							))}
						</ul>
					</Section>
				)}

				{/* Operational history alignment */}
				{candidate.opHistoryAlignment.length > 0 && (
					<div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2">
						<p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em]">
							Alignement historique
						</p>
						<p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
							{candidate.opHistoryAlignment}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ── Section sub-component ────────────────────────────────────────────────────

interface SectionProps {
	readonly label: string;
	readonly children: ReactElement | ReactElement[];
}

function Section({ label, children }: SectionProps): ReactElement {
	return (
		<div>
			<p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] mb-1.5">
				{label}
			</p>
			{children}
		</div>
	);
}

// ── Skeleton state ────────────────────────────────────────────────────────────

function CandidateCardSkeleton(): ReactElement {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<Skeleton className="h-5 w-28" />
					</div>
					<Skeleton className="h-8 w-12" />
				</div>
				<div className="mt-3 flex gap-2">
					<Skeleton className="h-5 w-16" />
					<Skeleton className="h-5 w-20" />
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-1.5">
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>
				<div className="space-y-1.5">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-2/3" />
				</div>
				<div className="space-y-1.5">
					<Skeleton className="h-3 w-20" />
					<Skeleton className="h-4 w-full" />
				</div>
			</CardContent>
		</Card>
	);
}
