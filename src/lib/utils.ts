import type { MatchScore } from "./types";

// ── Scoring Constants ────────────────────────────────────────────────────────

export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

export const FORT_THRESHOLD = 75;
export const MOYEN_THRESHOLD = 50;
// Below MOYEN_THRESHOLD → Faible

export const OP_HISTORY_ADJUSTMENT_WINDOW = 10;

// ── Score Clamping ───────────────────────────────────────────────────────────

export function clampScore(raw: number): number {
	if (!Number.isFinite(raw)) {
		return SCORE_MIN;
	}
	return Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.round(raw)));
}

// ── Match Score Mapping ──────────────────────────────────────────────────────

export function scoreToMatchScore(score: number): MatchScore {
	if (score >= FORT_THRESHOLD) {
		return "Fort";
	}
	if (score >= MOYEN_THRESHOLD) {
		return "Moyen";
	}
	return "Faible";
}

// ── Operational History Adjustment ────────────────────────────────────────────

export function applyOpHistoryAdjustment(
	score: number,
	adjustment: number,
): number {
	const clampedAdjustment = Math.min(
		OP_HISTORY_ADJUSTMENT_WINDOW,
		Math.max(-OP_HISTORY_ADJUSTMENT_WINDOW, Math.round(adjustment)),
	);
	return clampScore(score + clampedAdjustment);
}

// ── Array Assertions ─────────────────────────────────────────────────────────

export function assertArrayOfStrings(
	value: unknown,
	label: string,
): readonly string[] {
	if (!Array.isArray(value)) {
		throw new TypeError(`Expected ${label} to be an array`);
	}
	return value.map((item, index) => {
		if (typeof item !== "string") {
			throw new TypeError(
				`Expected ${label}[${index}] to be a string, got ${typeof item}`,
			);
		}
		return item;
	});
}

// ── JSON Cleanup ─────────────────────────────────────────────────────────────

/**
 * Strips markdown code fences and leading/trailing whitespace from an LLM
 * response that is expected to contain JSON.
 */
export function stripJsonFences(raw: string): string {
	let trimmed = raw.trim();
	// Remove ```json / ``` fences
	if (trimmed.startsWith("```")) {
		trimmed = trimmed
			.replace(/^```(?:json)?\s*\n?/, "")
			.replace(/\n?```\s*$/, "")
			.trim();
	}
	return trimmed;
}
