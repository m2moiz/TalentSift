import type { ReactElement } from "react";
import type { ClientBrief, Locale } from "../../lib/types";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

// ── Props ────────────────────────────────────────────────────────────────────

export interface ClientBriefProps {
	readonly brief: ClientBrief | null;
	readonly locale: Locale;
	readonly status: "idle" | "loading" | "success" | "error";
	readonly errorMessage?: string;
	/** Expose the brief text for copy without wiring browser clipboard into App. */
	readonly onCopy?: () => void;
}

// ── Sub Components ────────────────────────────────────────────────────────────

function BriefContent({
	brief,
}: {
	readonly brief: ClientBrief;
}): ReactElement {
	return (
		<div className="space-y-5">
			{/* Header */}
			<div>
				<h3 className="text-lg font-semibold text-[var(--text-primary)]">
					{brief.firstName} — {brief.headline}
				</h3>
			</div>

			{/* Experience summary */}
			<div>
				<h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
					Résumé de l'expérience
				</h4>
				<p className="text-sm leading-relaxed text-[var(--text-secondary)]">
					{brief.experienceSummary}
				</p>
			</div>

			{/* Strengths */}
			<div>
				<h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--status-success)]">
					Forces
				</h4>
				<ul className="space-y-1">
					{brief.strengths.map((s) => (
						<li
							key={s}
							className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
						>
							<span className="mt-0.5 shrink-0 text-[var(--status-success)]">
								✓
							</span>
							{s}
						</li>
					))}
				</ul>
			</div>

			{/* Watch points */}
			<div>
				<h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--status-warning)]">
					Points de vigilance
				</h4>
				<ul className="space-y-1">
					{brief.watchPoints.map((w) => (
						<li
							key={w}
							className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
						>
							<span className="mt-0.5 shrink-0 text-[var(--status-warning)]">
								△
							</span>
							{w}
						</li>
					))}
				</ul>
			</div>

			{/* Infos complémentaires */}
			<div>
				<h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
					Infos complémentaires
				</h4>
				<div className="grid grid-cols-2 gap-3 text-sm">
					<div className="space-y-1 rounded-[8px] bg-[var(--border-subtle)] px-3 py-2">
						<p className="text-[var(--text-tertiary)]">Expérience</p>
						<p className="font-medium text-[var(--text-primary)]">
							{brief.infosComplementaires.yearsOfExperience}
						</p>
					</div>
					<div className="space-y-1 rounded-[8px] bg-[var(--border-subtle)] px-3 py-2">
						<p className="text-[var(--text-tertiary)]">Disponibilité</p>
						<p className="font-medium text-[var(--text-primary)]">
							{brief.infosComplementaires.availability}
						</p>
					</div>
					<div className="space-y-1 rounded-[8px] bg-[var(--border-subtle)] px-3 py-2">
						<p className="text-[var(--text-tertiary)]">TJM</p>
						<p className="font-medium text-[var(--text-primary)]">
							{brief.infosComplementaires.tjm}
						</p>
					</div>
					<div className="space-y-1 rounded-[8px] bg-[var(--border-subtle)] px-3 py-2">
						<p className="text-[var(--text-tertiary)]">Compétences clés</p>
						<div className="flex flex-wrap gap-1">
							{brief.infosComplementaires.keySkills.map((skill) => (
								<Badge key={skill} variant="info">
									{skill}
								</Badge>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function LoadingState(): ReactElement {
	return (
		<div className="space-y-4">
			<Skeleton className="h-6 w-64" />
			<Skeleton className="h-20 w-full" />
			<Skeleton className="h-16 w-full" />
			<div className="grid grid-cols-2 gap-3">
				<Skeleton className="h-14 w-full" />
				<Skeleton className="h-14 w-full" />
				<Skeleton className="h-14 w-full" />
				<Skeleton className="h-14 w-full" />
			</div>
		</div>
	);
}

function EmptyState(locale: Locale): ReactElement {
	return (
		<p className="py-8 text-center text-sm text-[var(--text-tertiary)]">
			{locale === "en"
				? "The TDU client brief is generated automatically after candidate ranking."
				: "La fiche client TDU est générée automatiquement après le classement des candidats."}
		</p>
	);
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ClientBriefCard({
	brief,
	locale,
	status,
	errorMessage,
	onCopy,
}: ClientBriefProps): ReactElement {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>
						{locale === "en" ? "Client brief (TDU)" : "Brief client (TDU)"}
					</CardTitle>
					{brief && onCopy && (
						<button
							type="button"
							onClick={onCopy}
							className="rounded-[6px] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]"
						>
							{locale === "en" ? "Copy" : "Copier"}
						</button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{status === "loading" && <LoadingState />}
				{status === "idle" && EmptyState(locale)}
				{status === "error" && (
					<p className="text-sm text-[var(--status-error)]">
						{errorMessage ??
							(locale === "en"
								? "Brief generation failed."
								: "Erreur de génération du brief.")}
					</p>
				)}
				{status === "success" && brief && <BriefContent brief={brief} />}
			</CardContent>
		</Card>
	);
}
