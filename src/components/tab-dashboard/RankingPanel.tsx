import type { ReactElement } from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import type { DashboardOutput, RankingEntry } from "../../lib/types";

// ── Props ────────────────────────────────────────────────────────────────────

export interface RankingPanelProps {
	readonly output: DashboardOutput | null;
	readonly status: "idle" | "loading" | "success" | "error";
	readonly errorMessage?: string;
	readonly onRetry?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const RANK_LABELS: Record<number, string> = {
	1: "Best Fit",
	2: "Backup",
	3: "Lower Priority",
} as const;

const RANK_COLORS: Record<number, string> = {
	1: "fort",
	2: "moyen",
	3: "faible",
} as const;

// ── Sub Components ────────────────────────────────────────────────────────────

function RankingCard({
	entry,
}: {
	readonly entry: RankingEntry;
}): ReactElement {
	const rankColor = RANK_COLORS[entry.rank] ?? "info";
	const rankLabel = RANK_LABELS[entry.rank] ?? `#${entry.rank}`;

	return (
		<div className="flex gap-4 border-b border-[var(--border-subtle)] py-4 last:border-b-0 last:pb-0">
			{/* Rank indicator */}
			<div className="flex shrink-0 flex-col items-center gap-1">
				<div
					className={`flex size-10 items-center justify-center rounded-full text-sm font-bold ${
						entry.rank === 1
							? "bg-[var(--status-success)]/10 text-[var(--status-success)]"
							: entry.rank === 2
								? "bg-[var(--status-warning)]/10 text-[var(--status-warning)]"
								: "bg-[var(--text-tertiary)]/10 text-[var(--text-tertiary)]"
					}`}
				>
					{entry.rank}
				</div>
				<Badge variant={rankColor as "fort" | "moyen" | "faible" | "info"}>
					{rankLabel}
				</Badge>
			</div>

			{/* Content */}
			<div className="min-w-0 flex-1 space-y-2">
				<h4 className="text-base font-semibold text-[var(--text-primary)]">
					{entry.candidateName}
				</h4>
				<p className="text-sm leading-relaxed text-[var(--text-secondary)]">
					{entry.rationale}
				</p>
				<div className="flex items-center gap-2 text-sm">
					<span className="text-[var(--text-tertiary)]">Action :</span>
					<span className="font-medium text-[var(--accent-primary)]">
						{entry.nextAction}
					</span>
				</div>
			</div>
		</div>
	);
}

function LoadingState(): ReactElement {
	return (
		<div className="space-y-6">
			{[1, 2, 3].map((i) => (
				<div key={i} className="flex gap-4">
					<Skeleton className="size-10 shrink-0 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-5 w-48" />
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-4 w-36" />
					</div>
				</div>
			))}
		</div>
	);
}

function EmptyState(): ReactElement {
	return (
		<p className="py-8 text-center text-sm text-[var(--text-tertiary)]">
			Analysez les besoins et les CVs pour générer le classement des
			candidats.
		</p>
	);
}

function ErrorState({
	message,
	onRetry,
}: {
	readonly message: string;
	readonly onRetry?: (() => void) | undefined;
}): ReactElement {
	return (
		<div className="space-y-3 py-4 text-center">
			<p className="text-sm text-[var(--status-error)]">{message}</p>
			{onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="text-sm font-medium text-[var(--accent-primary)] underline underline-offset-2 hover:text-[var(--accent-hover)]"
				>
					Réessayer
				</button>
			)}
		</div>
	);
}

// ── Main Component ────────────────────────────────────────────────────────────

export function RankingPanel({
	output,
	status,
	errorMessage,
	onRetry,
}: RankingPanelProps): ReactElement {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Classement final</CardTitle>
			</CardHeader>
			<CardContent>
				{status === "loading" && <LoadingState />}
				{status === "idle" && <EmptyState />}
				{status === "error" && (
					<ErrorState
						message={errorMessage ?? "Une erreur est survenue."}
						onRetry={onRetry}
					/>
				)}
				{status === "success" && output && (
					<div className="space-y-1">
						{output.ranking.map((entry) => (
							<RankingCard key={entry.rank} entry={entry} />
						))}
						{output.opHistoryNote.length > 0 && (
							<div className="mt-3 rounded-[8px] border border-[var(--status-info)]/20 bg-[var(--status-info)]/5 px-3 py-2 text-sm text-[var(--text-secondary)]">
								<span className="font-medium text-[var(--status-info)]">
									Impact historique :{" "}
								</span>
								{output.opHistoryNote}
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
