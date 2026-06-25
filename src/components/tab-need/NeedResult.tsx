import {
	AlertCircle,
	CheckCircle2,
	Lightbulb,
	Target,
	TrendingUp,
	UserCheck,
} from "lucide-react";
import type { ReactElement } from "react";
import { useCallback } from "react";

import type { NeedAnalysisStatus } from "../../hooks/useNeedAnalysis";
import type { ApiError, NeedAnalysisOutput } from "../../lib/types";
import { ApiErrorKind } from "../../lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

// ── Props ────────────────────────────────────────────────────────────────────

export interface NeedResultProps {
	readonly data: NeedAnalysisOutput | null;
	readonly error: ApiError | null;
	readonly status: NeedAnalysisStatus;
	readonly onRetry: () => void;
}

// ── Error Messages ───────────────────────────────────────────────────────────

function errorTitle(kind: ApiErrorKind): string {
	switch (kind) {
		case ApiErrorKind.MissingKey:
			return "Clé API manquante";
		case ApiErrorKind.Timeout:
			return "Temporisation dépassée";
		case ApiErrorKind.MalformedResponse:
			return "Réponse invalide";
		case ApiErrorKind.HttpError:
			return "Erreur serveur";
		case ApiErrorKind.NetworkError:
			return "Erreur réseau";
	}
}

function errorDescription(kind: ApiErrorKind): string {
	switch (kind) {
		case ApiErrorKind.MissingKey:
			return "La clé API OpenAI n'est pas configurée. Ajoutez VITE_OPENAI_API_KEY dans votre fichier .env, ou activez le mode mock avec VITE_MOCK_MODE=1.";
		case ApiErrorKind.Timeout:
			return "L'analyse a pris plus de temps que prévu. Vous pouvez réessayer — l'API peut être momentanément ralentie.";
		case ApiErrorKind.MalformedResponse:
			return "La réponse de l'IA n'a pas pu être interprétée. Vous pouvez réessayer.";
		case ApiErrorKind.HttpError:
			return "Le serveur OpenAI a retourné une erreur. Vérifiez votre clé API et réessayez.";
		case ApiErrorKind.NetworkError:
			return "Une erreur réseau s'est produite. Vérifiez votre connexion et réessayez.";
	}
}

// ── Empty State ──────────────────────────────────────────────────────────────

function NeedEmpty(): ReactElement {
	return (
		<Card>
			<CardContent className="flex flex-col items-center gap-4 py-12 text-center">
				<Target className="h-10 w-10 text-[var(--text-tertiary)]" />
				<div className="space-y-1">
					<p className="text-sm font-medium text-[var(--text-primary)]">
						Analyse du besoin
					</p>
					<p className="max-w-sm text-sm leading-5 text-[var(--text-tertiary)]">
						Renseignez le client, l'intitulé et la description du poste, puis
						cliquez sur "Analyser le besoin" pour identifier les compétences
						clés, les points de vigilance et le profil idéal.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

// ── Loading State ─────────────────────────────────────────────────────────────

function NeedLoading(): ReactElement {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Analyse en cours</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="space-y-2">
					<Skeleton className="h-4 w-48" />
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-5/6" />
					<Skeleton className="h-3 w-4/6" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-36" />
					<div className="flex flex-wrap gap-2">
						<Skeleton className="h-6 w-28 rounded-full" />
						<Skeleton className="h-6 w-36 rounded-full" />
						<Skeleton className="h-6 w-24 rounded-full" />
					</div>
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-32" />
					<div className="flex flex-wrap gap-2">
						<Skeleton className="h-6 w-32 rounded-full" />
						<Skeleton className="h-6 w-40 rounded-full" />
					</div>
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-3/4" />
				</div>
			</CardContent>
		</Card>
	);
}

// ── Error State ───────────────────────────────────────────────────────────────

function NeedError({
	error,
	onRetry,
}: {
	readonly error: ApiError;
	readonly onRetry: () => void;
}): ReactElement {
	const handleRetry = useCallback(() => {
		onRetry();
	}, [onRetry]);

	return (
		<Alert variant="error">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>{errorTitle(error.kind)}</AlertTitle>
			<AlertDescription className="space-y-3">
				<p>{errorDescription(error.kind)}</p>
				<Button
					variant="secondary"
					size="sm"
					onClick={handleRetry}
					type="button"
				>
					Réessayer
				</Button>
			</AlertDescription>
		</Alert>
	);
}

// ── Success State ─────────────────────────────────────────────────────────────

function NeedSuccess({
	data,
}: {
	readonly data: NeedAnalysisOutput;
}): ReactElement {
	return (
		<div className="space-y-5">
			{/* Summary */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<CheckCircle2 className="h-5 w-5 text-[var(--status-success)]" />
						<CardTitle>Résumé de l'analyse</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-sm leading-6 text-[var(--text-primary)]">
						{data.summary}
					</p>
				</CardContent>
			</Card>

			{/* Must-have skills */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Target className="h-5 w-5 text-[var(--accent-primary)]" />
						<CardTitle>Compétences obligatoires</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						{data.mustHaveSkills.map((skill) => (
							<Badge key={skill} variant="fort">
								{skill}
							</Badge>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Nice-to-have skills */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Lightbulb className="h-5 w-5 text-[var(--status-warning)]" />
						<CardTitle>Compétences secondaires</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					{data.niceToHaveSkills.length > 0 ? (
						<div className="flex flex-wrap gap-2">
							{data.niceToHaveSkills.map((skill) => (
								<Badge key={skill} variant="moyen">
									{skill}
								</Badge>
							))}
						</div>
					) : (
						<p className="text-sm text-[var(--text-tertiary)]">
							Aucune compétence secondaire identifiée
						</p>
					)}
				</CardContent>
			</Card>

			{/* Watch points */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-[var(--status-warning)]" />
						<CardTitle>Points de vigilance</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2">
						{data.watchPoints.map((point) => (
							<li
								key={point}
								className="flex items-start gap-2 text-sm leading-5 text-[var(--text-primary)]"
							>
								<span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--status-warning)]" />
								{point}
							</li>
						))}
					</ul>
				</CardContent>
			</Card>

			{/* Ideal Profile */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<UserCheck className="h-5 w-5 text-[var(--accent-primary)]" />
						<CardTitle>Profil idéal</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-sm leading-6 text-[var(--text-primary)]">
						{data.idealProfile}
					</p>
				</CardContent>
			</Card>

			{/* Op History Impact */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5 text-[var(--status-info)]" />
						<CardTitle>Impact de l'historique opérationnel</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-sm leading-6 text-[var(--text-primary)]">
						{data.opHistoryImpact}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

// ── NeedResult ───────────────────────────────────────────────────────────────

export function NeedResult({
	data,
	error,
	status,
	onRetry,
}: NeedResultProps): ReactElement {
	if (status === "idle") {
		return <NeedEmpty />;
	}

	if (status === "loading") {
		return <NeedLoading />;
	}

	if (status === "error" && error !== null) {
		return <NeedError error={error} onRetry={onRetry} />;
	}

	if (status === "success" && data !== null) {
		return <NeedSuccess data={data} />;
	}

	// Fallback for unexpected intermediate states
	return <NeedEmpty />;
}
