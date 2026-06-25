import { useCallback, useState } from "react";
import { callApiForJson } from "../lib/api";
import { buildAnalyzeNeedPrompt } from "../lib/prompts";
import type {
	ApiError,
	NeedAnalysisOutput,
	NeedFormInput,
	OperationHistory,
} from "../lib/types";
import { ApiErrorKind } from "../lib/types";

// ── Status ────────────────────────────────────────────────────────────────────

export type NeedAnalysisStatus = "idle" | "loading" | "success" | "error";

// ── Return Type ───────────────────────────────────────────────────────────────

export interface UseNeedAnalysisReturn {
	readonly data: NeedAnalysisOutput | null;
	readonly error: ApiError | null;
	readonly status: NeedAnalysisStatus;
	readonly analyze: (
		form: NeedFormInput,
		opHistory: OperationHistory,
	) => Promise<void>;
	readonly reset: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

const MOCK_RESPONSE: NeedAnalysisOutput = {
	summary:
		"Nous recherchons un Développeur Senior Java/Kafka pour un client bancaire. Le besoin porte sur la conception et la maintenance de pipelines de données temps réel. Le candidat devra maîtriser l'écosystème Kafka (Kafka Streams, Connect, Schema Registry) ainsi que Java 17+. L'environnement est international et en contexte Agile.",
	mustHaveSkills: [
		"Java 17+ (minimum 5 ans d'expérience)",
		"Apache Kafka (Kafka Streams, Kafka Connect, Schema Registry)",
		"Conception d'architectures événementielles",
		"Maven/Gradle et tests unitaires/intégration",
		"Anglais professionnel courant",
	],
	niceToHaveSkills: [
		"Expérience en secteur bancaire ou finance",
		"Connaissance de Kubernetes / Docker",
		"Avro et Protobuf",
		"Spring Boot / Spring Cloud",
	],
	watchPoints: [
		"TJM indiqué (550-650€) dans la fourchette haute — vérifier le niveau réel du candidat",
		"Démarrage au 1er septembre — vivier disponible immédiatement limité",
		"Contexte international : vérifier la capacité à travailler en équipe distribuée",
		"Manager opérationnel exigeant sur la qualité de code — prévoir un test technique",
	],
	idealProfile:
		"Un développeur senior (7-10 ans d'XP) avec au moins 3 ans sur Kafka en production. Issu idéalement d'une grande entreprise ou du conseil, avec une première expérience dans le secteur financier. Bon équilibre entre compétences techniques pointues et capacité à communiquer avec des métiers.",
	opHistoryImpact:
		"Le manager privilégie les profils ayant déjà travaillé en contexte bancaire et valorise les candidats issus du conseil. Anticiper une vérification approfondie du niveau Kafka.",
};

const MOCK_RESPONSE_JSON = JSON.stringify(MOCK_RESPONSE);

export function useNeedAnalysis(): UseNeedAnalysisReturn {
	const [data, setData] = useState<NeedAnalysisOutput | null>(null);
	const [error, setError] = useState<ApiError | null>(null);
	const [status, setStatus] = useState<NeedAnalysisStatus>("idle");

	const analyze = useCallback(
		async (form: NeedFormInput, opHistory: OperationHistory): Promise<void> => {
			setStatus("loading");
			setError(null);
			setData(null);

			try {
				const prompt = buildAnalyzeNeedPrompt(form, opHistory);
				const result = await callApiForJson<NeedAnalysisOutput>(
					prompt,
					MOCK_RESPONSE_JSON,
				);
				setData(result);
				setStatus("success");
			} catch (err: unknown) {
				const apiError: ApiError =
					err !== null &&
					typeof err === "object" &&
					"kind" in err &&
					"message" in err
						? (err as ApiError)
						: {
								kind: ApiErrorKind.NetworkError,
								message:
									err instanceof Error
										? err.message
										: "Une erreur inconnue s'est produite",
							};
				setError(apiError);
				setStatus("error");
			}
		},
		[],
	);

	const reset = useCallback(() => {
		setData(null);
		setError(null);
		setStatus("idle");
	}, []);

	return { data, error, status, analyze, reset };
}
