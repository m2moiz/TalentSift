import { useCallback, useState } from "react";
import { callApiForJson } from "../lib/api";
import { buildAnalyzeNeedPrompt } from "../lib/prompts";
import type {
	ApiError,
	Locale,
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

const MOCK_RESPONSE_FR: NeedAnalysisOutput = {
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

const MOCK_RESPONSE_EN: NeedAnalysisOutput = {
	summary:
		"We are looking for a Senior Java/Kafka Developer for a banking client. The mission focuses on designing and maintaining real-time data pipelines. The candidate must be strong with the Kafka ecosystem (Kafka Streams, Connect, Schema Registry) as well as Java 17+. The environment is international and Agile.",
	mustHaveSkills: [
		"Java 17+ (minimum 5 years of experience)",
		"Apache Kafka (Kafka Streams, Kafka Connect, Schema Registry)",
		"Event-driven architecture design",
		"Maven/Gradle and unit/integration testing",
		"Professional English",
	],
	niceToHaveSkills: [
		"Banking or finance domain experience",
		"Kubernetes / Docker knowledge",
		"Avro and Protobuf",
		"Spring Boot / Spring Cloud",
	],
	watchPoints: [
		"The stated day rate (550-650€) is in the upper range — verify real seniority carefully",
		"Start date is September 1st — immediately available profiles may be limited",
		"International context: validate distributed-team collaboration ability",
		"The operational manager is demanding on code quality — expect a deeper technical screening",
	],
	idealProfile:
		"A senior developer (7-10 years of experience) with at least 3 years of hands-on Kafka production work. Ideally from a large company or consulting background, with some exposure to financial services. Strong balance between deep technical skill and business communication.",
	opHistoryImpact:
		"The manager prefers candidates who have already worked in banking environments and values consulting backgrounds. Expect closer validation of real Kafka depth.",
};

function mockResponseJson(locale: Locale): string {
	return JSON.stringify(locale === "en" ? MOCK_RESPONSE_EN : MOCK_RESPONSE_FR);
}

export function useNeedAnalysis(locale: Locale): UseNeedAnalysisReturn {
	const [data, setData] = useState<NeedAnalysisOutput | null>(null);
	const [error, setError] = useState<ApiError | null>(null);
	const [status, setStatus] = useState<NeedAnalysisStatus>("idle");

	const analyze = useCallback(
		async (form: NeedFormInput, opHistory: OperationHistory): Promise<void> => {
			setStatus("loading");
			setError(null);
			setData(null);

			try {
				const prompt = buildAnalyzeNeedPrompt(form, opHistory, locale);
				const result = await callApiForJson<NeedAnalysisOutput>(
					prompt,
					mockResponseJson(locale),
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
		[locale],
	);

	const reset = useCallback(() => {
		setData(null);
		setError(null);
		setStatus("idle");
	}, []);

	return { data, error, status, analyze, reset };
}
