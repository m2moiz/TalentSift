import type { ReactElement } from "react";
import type { Locale } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

// ── Props ────────────────────────────────────────────────────────────────────

export interface PitchScriptProps {
	readonly locale: Locale;
	readonly text: string | null;
	readonly status: "idle" | "loading" | "success" | "error";
	readonly errorMessage?: string;
	/** Expose the pitch text for copy without wiring browser clipboard into App. */
	readonly onCopy?: () => void;
}

// ── Sub Components ────────────────────────────────────────────────────────────

function LoadingState(): ReactElement {
	return (
		<div className="space-y-3">
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-11/12" />
			<Skeleton className="h-4 w-4/5" />
			<Skeleton className="h-4 w-3/4" />
			<Skeleton className="h-4 w-5/6" />
		</div>
	);
}

function EmptyState(locale: Locale): ReactElement {
	return (
		<p className="py-8 text-center text-sm text-[var(--text-tertiary)]">
			{locale === "en"
				? "The recruiter pitch is generated automatically after ranking."
				: "Le pitch recruteur prêt à l'oral est généré automatiquement après le classement."}
		</p>
	);
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PitchScript({
	locale,
	text,
	status,
	errorMessage,
	onCopy,
}: PitchScriptProps): ReactElement {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>
						{locale === "en" ? "Recruiter pitch" : "Pitch recruteur"}
					</CardTitle>
					{text && onCopy && (
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
								? "Pitch generation failed."
								: "Erreur de génération du pitch.")}
					</p>
				)}
				{status === "success" && text && (
					<div className="relative rounded-[8px] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-4">
						<div className="absolute inset-0 rounded-[8px] border-2 border-dashed border-[var(--accent-primary)]/10 pointer-events-none" />
						<p className="text-sm leading-relaxed text-[var(--text-primary)]">
							{text}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
