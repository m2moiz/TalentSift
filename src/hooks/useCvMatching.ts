import { useCallback, useState } from "react";
import { callApiForJson } from "../lib/api";
import { buildMatchCvsPrompt } from "../lib/prompts";
import type {
	ApiError,
	CandidateMatch,
	CvEntry,
	CvMatchOutput,
	NeedAnalysisOutput,
	OperationHistory,
} from "../lib/types";
import { ApiErrorKind } from "../lib/types";

// ── State ────────────────────────────────────────────────────────────────────

export interface CvMatchingState {
	/** The three CV entries with name and text */
	readonly cvEntries: readonly [CvEntry, CvEntry, CvEntry];
	/** Match results once the API call completes */
	readonly result: CvMatchOutput | null;
	/** True while the API call is in flight */
	readonly isLoading: boolean;
	/** Non-null when the last API call failed */
	readonly error: ApiError | null;
}

// ── Actions ──────────────────────────────────────────────────────────────────

export interface CvMatchingActions {
	/** Update a single CV entry by index (0, 1, or 2) */
	setCvEntry: (index: number, entry: CvEntry) => void;
	/** Run the matching against the API */
	runMatching: () => Promise<void>;
	/** Clear results and error, returning to the input-only state */
	clearResults: () => void;
}

// ── Default entries ──────────────────────────────────────────────────────────

const EMPTY_CV: CvEntry = { name: "", cvText: "" };

const DEFAULT_ENTRIES: readonly [CvEntry, CvEntry, CvEntry] = [
	EMPTY_CV,
	EMPTY_CV,
	EMPTY_CV,
];

// ── Mock response builder ─────────────────────────────────────────────────────
// Used when VITE_MOCK_MODE=1 so the demo works without an API key.

function buildMockMatchingJson(candidateNames: readonly string[]): string {
	const names =
		(candidateNames[0]?.trim().length ?? 0) > 0
			? candidateNames
			: ["Candidat 1", "Candidat 2", "Candidat 3"];

	const candidates = names.map((name, i) => {
		if (i === 0) {
			return {
				name,
				matchScore: "Fort",
				numericScore: 88,
				recommendation: "Call First",
				strengths: [
					"8+ ans d'expérience Java/Kafka en environnement bancaire",
					"Conception d'architectures event-driven en production",
					"Maîtrise de Kubernetes et déploiement cloud",
				],
				watchPoints: [
					"Disponibilité à confirmer (préavis de 3 mois en cours)",
					"TJM attendu possiblement supérieur au budget",
				],
				callQuestions: [
					"Comment gérez-vous la montée en charge sur vos pipelines Kafka ?",
					"Quelle est votre expérience avec la migration de monolithes vers des microservices ?",
				],
				opHistoryAlignment:
					"Profil similaire aux précédents Kafkiste recrutés avec succès chez ce client",
			};
		}
		if (i === 1) {
			return {
				name,
				matchScore: "Faible",
				numericScore: 22,
				recommendation: "Reject",
				strengths: [
					"Excellente gestion de projet et relation client",
					"Expérience produit solide en e-commerce",
				],
				watchPoints: [
					"Pas d'expérience technique Java/Kafka",
					"Profil orienté fonctionnel, pas de production en environnement technique",
				],
				callQuestions: [
					"Ce poste requiert une expertise technique poussée — comment envisagez-vous la transition ?",
				],
				opHistoryAlignment:
					"L'historique montre que le manager privilégie les profils techniques opérationnels — ce candidat ne correspond pas",
			};
		}
		return {
			name,
			matchScore: "Moyen",
			numericScore: 62,
			recommendation: "Backup",
			strengths: [
				"Connaissances en architecture data et big data",
				"Expérience en conception de solutions cloud (AWS)",
				"Bonnes capacités de communication avec les parties prenantes",
			],
			watchPoints: [
				"Expérience Java opérationnelle limitée (principalement de l'architecture)",
				"Pas d'expérience directe Kafka en production",
			],
			callQuestions: [
				"Quelle est votre expérience pratique de développement Java plutôt que d'architecture ?",
				"Avez-vous déjà travaillé sur des pipelines de données temps réel ?",
			],
			opHistoryAlignment:
				"Profil hybride intéressant mais ne correspond pas au besoin immédiat d'un développeur Kafka opérationnel",
		};
	});

	return JSON.stringify({ candidates });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCvMatching(
	needAnalysis: NeedAnalysisOutput | null,
	opHistory: OperationHistory,
	initialEntries: readonly [CvEntry, CvEntry, CvEntry] = DEFAULT_ENTRIES,
): CvMatchingState & CvMatchingActions {
	const [cvEntries, setCvEntries] =
		useState<readonly [CvEntry, CvEntry, CvEntry]>(initialEntries);
	const [result, setResult] = useState<CvMatchOutput | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<ApiError | null>(null);

	const setCvEntry = useCallback((index: number, entry: CvEntry): void => {
		setCvEntries((prev) => {
			const next = [...prev] as [CvEntry, CvEntry, CvEntry];
			if (index >= 0 && index < next.length) {
				next[index] = entry;
			}
			return next;
		});
	}, []);

	const clearResults = useCallback((): void => {
		setResult(null);
		setError(null);
	}, []);

	const runMatching = useCallback(async (): Promise<void> => {
		if (needAnalysis === null) {
			setError({
				kind: ApiErrorKind.MissingKey,
				message:
					"Analysez d'abord le besoin (Tab 1) avant de lancer le matching CV.",
			});
			return;
		}

		const nonEmpty = cvEntries.filter((e) => e.cvText.trim().length > 0);
		if (nonEmpty.length === 0) {
			setError({
				kind: ApiErrorKind.MissingKey,
				message:
					"Collez au moins un CV dans les zones de texte avant de lancer le matching.",
			});
			return;
		}

		setIsLoading(true);
		setError(null);
		setResult(null);

		try {
			const prompt = buildMatchCvsPrompt(
				needAnalysis,
				opHistory,
				cvEntries.map((e) => e.cvText),
			);

			const mockResponse = buildMockMatchingJson(cvEntries.map((e) => e.name));

			const output = await callApiForJson<CvMatchOutput>(prompt, mockResponse);

			const validated: CvMatchOutput = {
				candidates: output.candidates.map((c: CandidateMatch) => c),
			};

			setResult(validated);
		} catch (err: unknown) {
			const apiErr = err as ApiError;
			setError({
				kind: apiErr.kind ?? ApiErrorKind.NetworkError,
				message:
					apiErr.message ??
					"Une erreur inattendue est survenue lors du matching.",
			});
		} finally {
			setIsLoading(false);
		}
	}, [needAnalysis, opHistory, cvEntries]);

	return {
		cvEntries,
		setCvEntry,
		result,
		isLoading,
		error,
		runMatching,
		clearResults,
	};
}
