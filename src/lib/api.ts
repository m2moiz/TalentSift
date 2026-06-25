import type { ApiError, MockConfig } from "./types";
import { ApiErrorKind } from "./types";
import { stripJsonFences } from "./utils";

// ── Configuration ────────────────────────────────────────────────────────────

export const DEFAULT_MODEL = "gpt-5.4-mini";

const RESPONSES_API_URL = "https://api.openai.com/v1/responses";

const REQUEST_TIMEOUT_MS = 45_000;

function readMockConfig(): MockConfig {
	const raw = import.meta.env["VITE_MOCK_MODE"];
	const enabled = raw === "1" || raw === "true";
	return { enabled, delayMs: 300 };
}

// ── API Key ──────────────────────────────────────────────────────────────────

function getApiKey(): string | null {
	return import.meta.env["VITE_OPENAI_API_KEY"] ?? null;
}

// ── Error Factory ────────────────────────────────────────────────────────────

function makeError(
	kind: ApiErrorKind,
	message: string,
	status?: number,
): ApiError {
	const base: { kind: ApiErrorKind; message: string; status?: number } = {
		kind,
		message,
	};
	if (status !== undefined) {
		base.status = status;
	}
	return base as ApiError;
}

// ── Response Body Extraction ─────────────────────────────────────────────────

interface ResponsesApiOutput {
	readonly output: readonly ResponsesApiOutputItem[];
}

interface ResponsesApiOutputItem {
	readonly type: string;
	readonly role?: string;
	readonly content?: readonly ResponsesApiContentItem[];
}

interface ResponsesApiContentItem {
	readonly type: string;
	readonly text?: string;
}

function extractTextFromResponse(body: ResponsesApiOutput): string {
	const outputs = body.output;
	if (!Array.isArray(outputs) || outputs.length === 0) {
		throw makeError(
			ApiErrorKind.MalformedResponse,
			"Response contained no output items",
		);
	}

	for (const item of outputs) {
		if (item.type === "message" && item.role === "assistant") {
			const content = item.content;
			if (!Array.isArray(content) || content.length === 0) {
				continue;
			}
			const text = content
				.filter((c): c is { readonly type: "output_text"; readonly text: string } =>
					c.type === "output_text" && typeof c.text === "string",
				)
				.map((c) => c.text)
				.join("");
			if (text.length > 0) {
				return text;
			}
		}
	}

	throw makeError(
		ApiErrorKind.MalformedResponse,
		"Could not extract text from response output",
	);
}

// ── Core API Call ────────────────────────────────────────────────────────────

export async function callResponsesApi(prompt: string): Promise<string> {
	const apiKey = getApiKey();
	if (apiKey === null || apiKey.length === 0) {
		throw makeError(
			ApiErrorKind.MissingKey,
			"VITE_OPENAI_API_KEY is not set",
		);
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	let response: Response;
	try {
		response = await fetch(RESPONSES_API_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: DEFAULT_MODEL,
				input: prompt,
			}),
			signal: controller.signal,
		});
	} catch (err) {
		clearTimeout(timeoutId);
		if (err instanceof DOMException && err.name === "AbortError") {
			throw makeError(
				ApiErrorKind.Timeout,
				`Request timed out after ${REQUEST_TIMEOUT_MS}ms`,
			);
		}
		throw makeError(
			ApiErrorKind.NetworkError,
			err instanceof Error ? err.message : "Unknown network error",
		);
	} finally {
		clearTimeout(timeoutId);
	}

	if (!response.ok) {
		let body = "";
		try {
			body = await response.text();
		} catch {
			// swallow read errors
		}
		throw makeError(
			ApiErrorKind.HttpError,
			`OpenAI API returned ${response.status}: ${body.slice(0, 300)}`,
			response.status,
		);
	}

	let json: unknown;
	try {
		json = await response.json();
	} catch {
		throw makeError(
			ApiErrorKind.MalformedResponse,
			"Response body is not valid JSON",
		);
	}

	if (typeof json !== "object" || json === null) {
		throw makeError(
			ApiErrorKind.MalformedResponse,
			"Response body is not a JSON object",
		);
	}

	return extractTextFromResponse(json as ResponsesApiOutput);
}

// ── Mock Mode ────────────────────────────────────────────────────────────────

export async function callApi(
	prompt: string,
	mockResponseText?: string,
): Promise<string> {
	const mockConfig = readMockConfig();

	if (mockConfig.enabled) {
		if (mockResponseText !== undefined && mockResponseText.length > 0) {
			await new Promise((resolve) =>
				setTimeout(resolve, mockConfig.delayMs),
			);
			return mockResponseText;
		}
		throw makeError(
			ApiErrorKind.MissingKey,
			"Mock mode enabled but no mock response provided",
		);
	}

	return callResponsesApi(prompt);
}

// ── JSON-calling convenience ─────────────────────────────────────────────────

export async function callApiForJson<T>(
	prompt: string,
	mockResponseText?: string,
): Promise<T> {
	const raw = await callApi(prompt, mockResponseText);
	const cleaned = stripJsonFences(raw);
	try {
		return JSON.parse(cleaned) as T;
	} catch (err) {
		throw makeError(
			ApiErrorKind.MalformedResponse,
			`Failed to parse LLM response as JSON: ${err instanceof Error ? err.message : "unknown parse error"}`,
		);
	}
}
