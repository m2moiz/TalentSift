import { type ReactElement, useCallback } from "react";
import type { ApiError, CvEntry, CvMatchOutput } from "../../lib/types";
import { ApiErrorKind } from "../../lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { CandidateCard } from "./CandidateCard";

// ── Props ────────────────────────────────────────────────────────────────────

export interface CVInputsProps {
	readonly cvEntries: readonly [CvEntry, CvEntry, CvEntry];
	readonly onCvEntryChange: (index: number, entry: CvEntry) => void;
	readonly result: CvMatchOutput | null;
	readonly isLoading: boolean;
	readonly error: ApiError | null;
	readonly onRunMatching: () => void;
	readonly onClearResults: () => void;
	/** True when a need analysis has been completed (enable matching) */
	readonly hasAnalysis: boolean;
}

// ── Labels ───────────────────────────────────────────────────────────────────

const CV_LABELS = [
	{ name: "CV 1", placeholder: "Collez le texte du CV 1 ici..." },
	{ name: "CV 2", placeholder: "Collez le texte du CV 2 ici..." },
	{ name: "CV 3", placeholder: "Collez le texte du CV 3 ici..." },
] as const;

const CV_NAME_PLACEHOLDER = "Nom du candidat (optionnel)";

// ── Component ────────────────────────────────────────────────────────────────

export function CVInputs({
	cvEntries,
	onCvEntryChange,
	result,
	isLoading,
	error,
	onRunMatching,
	onClearResults,
	hasAnalysis,
}: CVInputsProps): ReactElement {
	const handleCvTextChange = useCallback(
		(index: number, cvText: string): void => {
			const current = cvEntries[index];
			if (current !== undefined) {
				onCvEntryChange(index, { name: current.name, cvText });
			}
		},
		[cvEntries, onCvEntryChange],
	);

	const handleNameChange = useCallback(
		(index: number, name: string): void => {
			const current = cvEntries[index];
			if (current !== undefined) {
				onCvEntryChange(index, { name, cvText: current.cvText });
			}
		},
		[cvEntries, onCvEntryChange],
	);

	const hasCvContent = cvEntries.some((e) => e.cvText.trim().length > 0);

	return (
		<section className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-lg font-semibold tracking-[-0.02em]">
					Matching CV
				</h2>
				<p className="mt-1 max-w-prose text-sm leading-6 text-[var(--text-secondary)]">
					Collez les CV de votre shortlist (3 maximum) pour évaluer l'adéquation
					avec le besoin analysé, obtenir un score, des forces, des points de
					vigilance et des questions d'entretien.
				</p>
			</div>

			{/* CV Inputs */}
			<div className="grid gap-4 md:grid-cols-3">
				{CV_LABELS.map((label, index) => {
					const entry = cvEntries[index];
					return (
						<div key={label.name} className="flex flex-col gap-2">
							<div className="flex items-center gap-2">
								<input
									type="text"
									placeholder={CV_NAME_PLACEHOLDER}
									value={entry?.name ?? ""}
									onChange={(e) => {
										handleNameChange(index, e.target.value);
									}}
									className="h-8 w-full rounded-[6px] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:border-[var(--accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/20"
								/>
							</div>
							<Textarea
								label={label.name}
								placeholder={label.placeholder}
								value={entry?.cvText ?? ""}
								onChange={(e) => {
									handleCvTextChange(index, e.target.value);
								}}
								className="min-h-[200px]"
								disabled={isLoading}
							/>
						</div>
					);
				})}
			</div>

			{/* Actions */}
			<div className="flex items-center gap-3">
				<Button onClick={onRunMatching} disabled={isLoading || !hasCvContent}>
					{isLoading ? "Analyse en cours..." : "Run Matching"}
				</Button>

				{!hasAnalysis && (
					<p className="text-xs text-[var(--status-warning)]">
						Analysez d'abord le besoin dans l'onglet Analyse du besoin
					</p>
				)}

				{result !== null && !isLoading && (
					<Button variant="ghost" size="sm" onClick={onClearResults}>
						Effacer les résultats
					</Button>
				)}
			</div>

			{/* Error state */}
			{error !== null && (
				<Alert variant="error">
					<AlertTitle>
						{error.kind === ApiErrorKind.MissingKey
							? "Configuration requise"
							: error.kind === ApiErrorKind.Timeout
								? "Délai d'attente dépassé"
								: error.kind === ApiErrorKind.MalformedResponse
									? "Réponse invalide"
									: "Erreur"}
					</AlertTitle>
					<AlertDescription>{error.message}</AlertDescription>
				</Alert>
			)}

			{/* Loading state */}
			{isLoading && (
				<div className="grid gap-4 md:grid-cols-3">
					<CandidateCard candidate={null} />
					<CandidateCard candidate={null} />
					<CandidateCard candidate={null} />
				</div>
			)}

			{/* Results */}
			{result !== null && !isLoading && (
				<div className="space-y-4">
					<h3 className="text-base font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
						Résultats du matching
					</h3>
					<div className="grid gap-4 md:grid-cols-3">
						{result.candidates.map((c, i) => (
							<CandidateCard
								key={`${c.name}-${c.numericScore}`}
								candidate={c}
								index={i + 1}
							/>
						))}
					</div>
				</div>
			)}

			{/* Empty state */}
			{!isLoading && result === null && error === null && (
				<div className="rounded-[8px] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-8 text-center text-sm text-[var(--text-tertiary)]">
					Collez les CV ci-dessus et cliquez sur "Lancer le matching" pour voir
					les résultats d'adéquation.
				</div>
			)}
		</section>
	);
}
