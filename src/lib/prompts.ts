import type {
	CandidateMatch,
	NeedAnalysisOutput,
	NeedFormInput,
	OperationHistory,
} from "./types";

// ── Shared Guardrails ────────────────────────────────────────────────────────

const SHARED_GUARDRAILS = `Règles de rédaction :
- Sois spécifique et concret ; langage de recruteur, pas de buzzwords IA génériques.
- Mentionne explicitement les forces et les risques.
- N'invente pas de certitude quand l'information est absente.
- Rédige directement exploitable par un recruteur sans retouche.`;

const JSON_INSTRUCTION = `Réponds UNIQUEMENT avec un objet JSON valide. Pas de markdown, pas de texte avant ou après le JSON.`;

// ── Prompt A — Analyze Need ──────────────────────────────────────────────────

export function buildAnalyzeNeedPrompt(
	form: NeedFormInput,
	opHistory: OperationHistory,
): string {
	const historyBlock =
		opHistory.text.trim().length > 0
			? `\n\nHistorique opérationnel du manager (à intégrer dans l'analyse) :\n${opHistory.text}`
			: "";

	return `Tu es un recruteur expert pour TDU Consulting. Analyse ce besoin client.

Client : ${form.client}
Manager opérationnel : ${form.operationalManager}
Intitulé du poste : ${form.jobTitle}
Description du poste :
${form.jobDescription}
Contexte / qualification : ${form.contextQualification}
TJM : ${form.tjm}
Localisation : ${form.location}
Date de démarrage : ${form.startDate}
Mode remote : ${form.remoteMode}${historyBlock}

Produis un JSON avec cette structure exacte :
{
  "summary": "résumé en 5 lignes maximum",
  "mustHaveSkills": ["compétence obligatoire 1", "compétence obligatoire 2", ...],
  "niceToHaveSkills": ["compétence secondaire 1", ...],
  "watchPoints": ["point de vigilance 1", ...],
  "idealProfile": "description du profil idéal en 2-3 phrases",
  "opHistoryImpact": "impact de l'historique opérationnel sur cette analyse (1 phrase, ou 'Aucun historique fourni' si vide)"
}

${SHARED_GUARDRAILS}
${JSON_INSTRUCTION}`;
}

// ── Prompt B — Match CVs ─────────────────────────────────────────────────────

export function buildMatchCvsPrompt(
	need: NeedAnalysisOutput,
	opHistory: OperationHistory,
	cvTexts: readonly string[],
): string {
	const cvBlocks = cvTexts
		.map((cv, i) => `CV Candidat ${i + 1} :\n${cv}`)
		.join("\n\n");

	const historyBlock =
		opHistory.text.trim().length > 0
			? `\n\nHistorique opérationnel du manager :\n${opHistory.text}`
			: "";

	return `Tu es un recruteur expert pour TDU Consulting. Évalue ces CVs par rapport au besoin analysé ci-dessous.

Besoin analysé :
- Résumé : ${need.summary}
- Compétences obligatoires : ${need.mustHaveSkills.join(", ")}
- Compétences secondaires : ${need.niceToHaveSkills.join(", ")}
- Points de vigilance : ${need.watchPoints.join(", ")}
- Profil idéal : ${need.idealProfile}
- Impact historique opérationnel : ${need.opHistoryImpact}${historyBlock}

${cvBlocks}

Produis un JSON avec cette structure exacte :
{
  "candidates": [
    {
      "name": "Candidat 1",
      "matchScore": "Fort" | "Moyen" | "Faible",
      "numericScore": 0-100,
      "recommendation": "Call First" | "Backup" | "Reject",
      "strengths": ["force 1", "force 2", "force 3"],
      "watchPoints": ["point de vigilance 1", "point de vigilance 2", "point de vigilance 3"],
      "callQuestions": ["question d'entretien 1", "question 2", "question 3"],
      "opHistoryAlignment": "comment l'historique opérationnel influence ce matching (1 phrase)"
    },
    ...
  ]
}

Critères de scoring :
- Adéquation aux compétences obligatoires = 50% du score
- Adéquation aux compétences secondaires = 20%
- Expérience et contexte = 20%
- Alignement avec l'historique opérationnel = 10%
- Fort ≥ 75, Moyen 50-74, Faible < 50

Un CV de profil non-tech (ex: Product Owner) pour un poste purement technique (ex: Développeur Java/Kafka) doit être Faible même si le candidat est excellent dans son domaine.

${SHARED_GUARDRAILS}
${JSON_INSTRUCTION}`;
}

// ── Prompt C — Ranking + Brief + Pitch ────────────────────────────────────────

export function buildRankingPrompt(
	need: NeedAnalysisOutput,
	candidates: readonly CandidateMatch[],
	opHistory: OperationHistory,
): string {
	const candidateBlocks = candidates
		.map(
			(c, i) =>
				`Candidat ${i + 1} — ${c.name} :
Score: ${c.numericScore}/100 (${c.matchScore})
Recommandation: ${c.recommendation}
Forces: ${c.strengths.join(" | ")}
Points de vigilance: ${c.watchPoints.join(" | ")}
Questions d'entretien: ${c.callQuestions.join(" | ")}
Alignement historique: ${c.opHistoryAlignment}`,
		)
		.join("\n\n");

	const historyBlock =
		opHistory.text.trim().length > 0
			? `\n\nHistorique opérationnel du manager :\n${opHistory.text}`
			: "";

	return `Tu es un recruteur expert pour TDU Consulting. Produis le classement final, la fiche client et le pitch recruteur.

Besoin analysé :
- Résumé : ${need.summary}
- Compétences obligatoires : ${need.mustHaveSkills.join(", ")}
- Profil idéal : ${need.idealProfile}${historyBlock}

Résultats du matching :
${candidateBlocks}

Produis un JSON avec cette structure exacte :
{
  "ranking": [
    {
      "rank": 1,
      "candidateName": "nom du candidat",
      "rationale": "explication concise (forces décisives, points bloquants éventuels)",
      "nextAction": "action recommandée (ex: 'Call first — proposer un entretien sous 48h')"
    },
    ...
  ],
  "opHistoryNote": "comment l'historique opérationnel influence le classement (1 phrase, ou 'Aucun historique fourni')",
  "clientBrief": {
    "firstName": "prénom du candidat #1",
    "headline": "accroche une ligne (ex: 'Architecte Kafka avec 8 ans d'expérience en contexte bancaire')",
    "experienceSummary": "résumé de l'expérience pertinente en 3-4 lignes",
    "strengths": ["force 1", "force 2", "force 3"],
    "watchPoints": ["point de vigilance 1", "point de vigilance 2"],
    "infosComplementaires": {
      "yearsOfExperience": "X ans",
      "keySkills": ["compétence clé 1", "compétence clé 2"],
      "availability": "disponibilité",
      "tjm": "TJM"
    }
  },
  "pitchScript": "texte de pitch prêt à l'oral pour le recruteur, 4-6 phrases, ton professionnel et direct"
}

Format TDU pour le clientBrief : la fiche doit être directement copiable et utilisable par un recruteur. Le pitchScript doit être un texte fluide, prêt à être lu au téléphone.

${SHARED_GUARDRAILS}
${JSON_INSTRUCTION}`;
}
