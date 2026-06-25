import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

// ── Props ────────────────────────────────────────────────────────────────────

export interface PitchScriptProps {
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

function EmptyState(): ReactElement {
	return (
		<p className="py-8 text-center text-sm text-[var(--text-tertiary)]">
			Le script de pitch recruteur sera généré après le classement.
		</p>
	);
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PitchScript({
	text,
	status,
	errorMessage,
	onCopy,
}: PitchScriptProps): ReactElement {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Pitch recruteur</CardTitle>
					{text && onCopy && (
						<button
							type="button"
							onClick={onCopy}
							className="rounded-[6px] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]"
						>
							Copier
						</button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{status === "loading" && <LoadingState />}
				{status === "idle" && <EmptyState />}
				{status === "error" && (
					<p className="text-sm text-[var(--status-error)]">
						{errorMessage ?? "Erreur de génération du pitch."}
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
