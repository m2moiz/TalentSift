import type {
	CandidateMatch,
	Locale,
	NeedAnalysisOutput,
	NeedFormInput,
	OperationHistory,
} from "./types";

// ── Shared Guardrails ────────────────────────────────────────────────────────

function sharedGuardrails(locale: Locale): string {
	if (locale === "en") {
		return `Writing rules:
- Be specific and concrete; recruiter language only, no generic AI buzzwords.
- State strengths and risks explicitly.
- Do not invent certainty when information is missing.
- Write output that a recruiter can use directly without rewriting.`;
	}

	return `Règles de rédaction :
- Sois spécifique et concret ; langage de recruteur, pas de buzzwords IA génériques.
- Mentionne explicitement les forces et les risques.
- N'invente pas de certitude quand l'information est absente.
- Rédige directement exploitable par un recruteur sans retouche.`;
}

function jsonInstruction(locale: Locale): string {
	return locale === "en"
		? `Reply ONLY with a valid JSON object. No markdown. No text before or after the JSON.`
		: `Réponds UNIQUEMENT avec un objet JSON valide. Pas de markdown, pas de texte avant ou après le JSON.`;
}

// ── Prompt A — Analyze Need ──────────────────────────────────────────────────

export function buildAnalyzeNeedPrompt(
	form: NeedFormInput,
	opHistory: OperationHistory,
	locale: Locale,
): string {
	const historyBlock =
		opHistory.text.trim().length > 0
			? `\n\nHistorique opérationnel du manager (à intégrer dans l'analyse) :\n${opHistory.text}`
			: "";

	if (locale === "en") {
		return `You are an expert recruiter for TDU Consulting. Analyze this client hiring need.

Client: ${form.client}
Operational manager: ${form.operationalManager}
Job title: ${form.jobTitle}
Job description:
${form.jobDescription}
Context / qualification: ${form.contextQualification}
Daily rate: ${form.tjm}
Location: ${form.location}
Start date: ${form.startDate}
Remote mode: ${form.remoteMode}${historyBlock}

Return JSON with this exact structure:
{
  "summary": "summary in 5 lines maximum",
  "mustHaveSkills": ["required skill 1", "required skill 2", ...],
  "niceToHaveSkills": ["secondary skill 1", ...],
  "watchPoints": ["watch point 1", ...],
  "idealProfile": "ideal profile description in 2-3 sentences",
  "opHistoryImpact": "how operational history influences this analysis (1 sentence, or 'No operational history provided' if empty)"
}

${sharedGuardrails(locale)}
${jsonInstruction(locale)}`;
	}

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

${sharedGuardrails(locale)}
${jsonInstruction(locale)}`;
}

// ── Prompt B — Match CVs ─────────────────────────────────────────────────────

export function buildMatchCvsPrompt(
	need: NeedAnalysisOutput,
	opHistory: OperationHistory,
	cvTexts: readonly string[],
	locale: Locale,
): string {
	const cvBlocks = cvTexts
		.map((cv, i) => `CV Candidat ${i + 1} :\n${cv}`)
		.join("\n\n");

	const historyBlock =
		opHistory.text.trim().length > 0
			? `\n\nHistorique opérationnel du manager :\n${opHistory.text}`
			: "";

	if (locale === "en") {
		return `You are an expert recruiter for TDU Consulting. Evaluate these CVs against the analyzed hiring need below.

Analyzed need:
- Summary: ${need.summary}
- Required skills: ${need.mustHaveSkills.join(", ")}
- Secondary skills: ${need.niceToHaveSkills.join(", ")}
- Watch points: ${need.watchPoints.join(", ")}
- Ideal profile: ${need.idealProfile}
- Operational history impact: ${need.opHistoryImpact}${historyBlock}

${cvBlocks}

Return JSON with this exact structure:
{
  "candidates": [
    {
      "name": "Candidate 1",
      "matchScore": "Fort" | "Moyen" | "Faible",
      "numericScore": 0-100,
      "recommendation": "Call First" | "Backup" | "Reject",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "watchPoints": ["watch point 1", "watch point 2", "watch point 3"],
      "callQuestions": ["screening question 1", "question 2", "question 3"],
      "opHistoryAlignment": "how operational history influences this match (1 sentence)"
    }
  ]
}

Scoring rules:
- Required skills match = 50%
- Secondary skills match = 20%
- Experience and context = 20%
- Operational-history alignment = 10%
- Fort ≥ 75, Moyen 50-74, Faible < 50

A non-technical profile (for example Product Owner) for a deeply technical role (for example Java/Kafka developer) must remain Faible even if the candidate is strong in another domain.

${sharedGuardrails(locale)}
${jsonInstruction(locale)}`;
	}

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

${sharedGuardrails(locale)}
${jsonInstruction(locale)}`;
}

// ── Prompt C — Ranking + Brief + Pitch ────────────────────────────────────────

export function buildRankingPrompt(
	need: NeedAnalysisOutput,
	candidates: readonly CandidateMatch[],
	opHistory: OperationHistory,
	locale: Locale,
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

	if (locale === "en") {
		return `You are an expert recruiter for TDU Consulting. Produce the final ranking, client brief, and recruiter pitch.

Analyzed need:
- Summary: ${need.summary}
- Required skills: ${need.mustHaveSkills.join(", ")}
- Ideal profile: ${need.idealProfile}${historyBlock}

Matching results:
${candidateBlocks}

Return JSON with this exact structure:
{
  "ranking": [
    {
      "rank": 1,
      "candidateName": "candidate name",
      "rationale": "concise explanation (decisive strengths, blockers if any)",
      "nextAction": "recommended next action (e.g. 'Call first — schedule interview within 48h')"
    }
  ],
  "opHistoryNote": "how operational history influences the ranking (1 sentence, or 'No operational history provided')",
  "clientBrief": {
    "firstName": "first name of candidate #1",
    "headline": "one-line headline",
    "experienceSummary": "3-4 line relevant experience summary",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "watchPoints": ["watch point 1", "watch point 2"],
    "infosComplementaires": {
      "yearsOfExperience": "X years",
      "keySkills": ["key skill 1", "key skill 2"],
      "availability": "availability",
      "tjm": "daily rate"
    }
  },
  "pitchScript": "recruiter-ready spoken pitch, 4-6 sentences, direct and professional"
}

The clientBrief must be copy-ready for recruiter use. The pitchScript must sound natural when read aloud.

${sharedGuardrails(locale)}
${jsonInstruction(locale)}`;
	}

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

${sharedGuardrails(locale)}
${jsonInstruction(locale)}`;
}
