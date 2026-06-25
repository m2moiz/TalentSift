import { useCallback, useState } from "react";
import { callApiForJson } from "../lib/api";
import { buildRankingPrompt } from "../lib/prompts";
import type {
	CandidateMatch,
	DashboardOutput,
	Locale,
	NeedAnalysisOutput,
	OperationHistory,
} from "../lib/types";
import { ApiErrorKind } from "../lib/types";

// ── State Types ───────────────────────────────────────────────────────────────

export type RankingStatus =
	| { readonly kind: "idle" }
	| { readonly kind: "loading" }
	| { readonly kind: "success"; readonly output: DashboardOutput }
	| { readonly kind: "error"; readonly message: string };

export interface UseRankingReturn {
	readonly status: RankingStatus;
	readonly output: DashboardOutput | null;
	/** Submit need analysis + candidate matches + op history for ranking + brief + pitch. */
	readonly runRanking: (
		need: NeedAnalysisOutput,
		candidates: readonly CandidateMatch[],
		opHistory: OperationHistory,
	) => Promise<void>;
	/** Reset to idle. */
	readonly reset: () => void;
}

// ── Mock Responses ────────────────────────────────────────────────────────────

/**
 * Realistic mock response for the ranking prompt, matching the DashboardOutput
 * shape.  Used when VITE_MOCK_MODE=1 to enable demo walkthroughs without an
 * API key.  Produces French output because the Kafka JD is French.
 */
const MOCK_DASHBOARD_OUTPUT_FR: DashboardOutput = {
	ranking: [
		{
			rank: 1,
			candidateName: "Aïssa B.",
			rationale:
				"Profil Kafka/Java senior avec 4 ans d'expérience bancaire. " +
				"Maîtrise de Kafka Streams, Kafka Connect et Schema Registry — " +
				"correspond exactement aux exigences techniques. Expérience " +
				"directe en environnement banque de détail française.",
			nextAction:
				"Call first — proposer un entretien sous 48h, valider " +
				"disponibilité et TJM.",
		},
		{
			rank: 2,
			candidateName: "Salima E.",
			rationale:
				"Profil Data Engineer solide avec des notions opérationnelles " +
				"sur Kafka (POC en production). Expérience Scala/Streaming " +
				"utile mais le cœur Kafka (Streams, Connect, Avro) manque. " +
				"À considérer si le besoin évolue vers plus de data pipeline.",
			nextAction:
				"Backup — courte exploration téléphonique pour évaluer " +
				"la capacité de montée en compétence Kafka.",
		},
		{
			rank: 3,
			candidateName: "Clément D.",
			rationale:
				"Profil Product Owner / Chef de projet IT, sans expérience " +
				"développement Java/Kafka en production. Ne correspond pas " +
				"au prérequis technique du poste malgré un excellent profil " +
				"de gestion de projet.",
			nextAction:
				"Reject pour ce poste — conserver le CV pour un futur " +
				"besoin en gestion de projet IT.",
		},
	],
	opHistoryNote:
		"Le manager privilégie les profils avec expérience bancaire " +
		"française, ce qui renforce la position d'Aïssa B. Aucun biais " +
		"négatif identifié sur les autres profils.",
	clientBrief: {
		firstName: "Aïssa",
		headline:
			"Architecte Kafka avec 7 ans d'expérience Java en contexte bancaire",
		experienceSummary:
			"Aïssa a conçu et déployé une plateforme Kafka pour les flux " +
			"de paiement SEPA temps réel chez BNP Paribas (6 clusters, " +
			"150+ topics, 2M+ transactions/jour). Il maîtrise Java 17, " +
			"Spring Boot, Kafka Streams, Kafka Connect et Schema Registry " +
			"Avro. Forte expérience en architecture microservices " +
			"event-driven et en environnement bancaire exigeant.",
		strengths: [
			"7 ans d'expérience Java dont 4 ans spécialisé Kafka",
			"Expérience bancaire directe (BNP Paribas, Société Générale)",
			"Maîtrise de l'ensemble de l'écosystème Confluent",
		],
		watchPoints: [
			"Mobilité à vérifier (missions longues sur Paris)",
			"TJM probablement en haut de fourchette (600-650 €)",
		],
		infosComplementaires: {
			yearsOfExperience: "7 ans",
			keySkills: [
				"Java 17",
				"Kafka Streams",
				"Spring Boot",
				"Kafka Connect",
				"PostgreSQL",
				"Docker / Kubernetes",
			],
			availability: "Préavis 4 semaines",
			tjm: "600-650 €",
		},
	},
	pitchScript:
		"Bonjour [Prénom Client], je vous propose Aïssa B., architecte " +
		"Kafka avec 7 ans d'expérience dont 4 ans dédiés à Kafka en " +
		"environnement bancaire. Il a conçu la plateforme temps réel " +
		"des flux SEPA chez BNP Paribas — exactement le background " +
		"que vous recherchez pour votre modernisation Core Banking. " +
		"Il maîtrise Java 17, Spring Boot, Kafka Streams et toute la " +
		"stack Confluent. Disponible sous 4 semaines. Je vous envoie " +
		"sa fiche détaillée par mail.",
};

const MOCK_DASHBOARD_OUTPUT_EN: DashboardOutput = {
	ranking: [
		{
			rank: 1,
			candidateName: "Aïssa B.",
			rationale:
				"Senior Kafka/Java profile with 4 years of banking experience. Strong command of Kafka Streams, Kafka Connect, and Schema Registry, which matches the role directly.",
			nextAction:
				"Call first — schedule an interview within 48 hours and confirm availability and daily rate.",
		},
		{
			rank: 2,
			candidateName: "Salima E.",
			rationale:
				"Strong data engineering profile with some Kafka exposure in proof-of-concept work. Relevant background, but not as hands-on on the Kafka stack as the top candidate.",
			nextAction:
				"Backup — run a short screen to measure readiness for a hands-on Kafka role.",
		},
		{
			rank: 3,
			candidateName: "Clément D.",
			rationale:
				"Product/IT project profile with no hands-on Java/Kafka delivery experience. Strong in delivery management, but not a fit for this technical mission.",
			nextAction:
				"Reject for this role — keep for future product or project-delivery missions.",
		},
	],
	opHistoryNote:
		"The manager preference for banking experience reinforces Aïssa B. as the top-ranked candidate.",
	clientBrief: {
		firstName: "Aïssa",
		headline:
			"Kafka architect with 7 years of Java experience in banking environments",
		experienceSummary:
			"Aïssa designed and deployed a Kafka platform for real-time SEPA payment flows at BNP Paribas. He is strong on Java 17, Spring Boot, Kafka Streams, Kafka Connect, and event-driven microservices in demanding production contexts.",
		strengths: [
			"7 years of Java experience, including 4 years dedicated to Kafka",
			"Direct banking experience",
			"Strong command of the Confluent ecosystem",
		],
		watchPoints: [
			"Mobility and onsite expectations still need to be confirmed",
			"Daily rate likely at the top of the target range",
		],
		infosComplementaires: {
			yearsOfExperience: "7 years",
			keySkills: [
				"Java 17",
				"Kafka Streams",
				"Spring Boot",
				"Kafka Connect",
				"PostgreSQL",
				"Docker / Kubernetes",
			],
			availability: "4 weeks notice",
			tjm: "600-650 €",
		},
	},
	pitchScript:
		"Hi [Client Name], I recommend Aïssa B., a Kafka architect with 7 years of Java experience and 4 years focused on Kafka in banking contexts. He built real-time payment platforms at BNP Paribas and matches the technical depth you need for this modernization effort. He is strong on Java 17, Kafka Streams, Kafka Connect, and the broader Confluent stack. Availability is roughly four weeks, and I can share the detailed brief right away.",
};

function mockDashboardOutput(locale: Locale): DashboardOutput {
	return locale === "en" ? MOCK_DASHBOARD_OUTPUT_EN : MOCK_DASHBOARD_OUTPUT_FR;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useRanking(locale: Locale): UseRankingReturn {
	const [status, setStatus] = useState<RankingStatus>({ kind: "idle" });

	const runRanking = useCallback(
		async (
			need: NeedAnalysisOutput,
			candidates: readonly CandidateMatch[],
			opHistory: OperationHistory,
		): Promise<void> => {
			setStatus({ kind: "loading" });

			try {
				const prompt = buildRankingPrompt(need, candidates, opHistory, locale);
				const mockText = JSON.stringify(mockDashboardOutput(locale));
				const output = await callApiForJson<DashboardOutput>(prompt, mockText);

				// Validate output has the expected shape before storing
				if (!output.ranking || !output.clientBrief?.firstName) {
					setStatus({
						kind: "error",
						message:
							"Le classement généré est incomplet. " + "Veuillez réessayer.",
					});
					return;
				}

				setStatus({ kind: "success", output });
			} catch (err: unknown) {
				const typed = err as { kind?: ApiErrorKind; message?: string };
				const kind = typed.kind;
				const fallback =
					err instanceof Error
						? err.message
						: "Erreur inconnue lors de la génération du classement.";

				if (kind === ApiErrorKind.MissingKey) {
					setStatus({
						kind: "error",
						message: "Clé API manquante. Configurez VITE_OPENAI_API_KEY.",
					});
				} else if (kind === ApiErrorKind.Timeout) {
					setStatus({
						kind: "error",
						message:
							"La génération a pris trop de temps. " + "Veuillez réessayer.",
					});
				} else if (kind === ApiErrorKind.MalformedResponse) {
					setStatus({
						kind: "error",
						message:
							"La réponse de l'IA est mal formatée. " + "Veuillez réessayer.",
					});
				} else {
					setStatus({
						kind: "error",
						message: fallback,
					});
				}
			}
		},
		[locale],
	);

	const reset = useCallback((): void => {
		setStatus({ kind: "idle" });
	}, []);

	const output =
		status.kind === "success"
			? status.output
			: (null as DashboardOutput | null);

	return { status, output, runRanking, reset };
}
