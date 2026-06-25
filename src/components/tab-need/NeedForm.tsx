import { useCallback, useState, type ChangeEvent, type FormEvent, type ReactElement } from "react";
import { Sparkles } from "lucide-react";

import type { NeedFormInput } from "../../lib/types";
import { useNeedAnalysis } from "../../hooks/useNeedAnalysis";
import { useOpHistory } from "../../hooks/useOpHistory";
import { cn } from "../../lib/cn";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { NeedResult } from "./NeedResult";

// ── Input Style ───────────────────────────────────────────────────────────────

const inputBase = [
	"w-full rounded-[8px] border border-[var(--border-default)]",
	"bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]",
	"placeholder:text-[var(--text-tertiary)]",
	"transition-[border-color,box-shadow] duration-[120ms] ease-out",
	"focus-visible:border-[var(--accent-primary)] focus-visible:outline-none",
	"focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/20",
	"disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

// ── Default Form Values ───────────────────────────────────────────────────────

const EMPTY_FORM: NeedFormInput = {
	client: "",
	operationalManager: "",
	jobTitle: "",
	jobDescription: "",
	contextQualification: "",
	tjm: "",
	location: "",
	startDate: "",
	remoteMode: "",
};

// ── Label Component ───────────────────────────────────────────────────────────

function FieldLabel({
	htmlFor,
	children,
}: { readonly htmlFor: string; readonly children: string }): ReactElement {
	return (
		<label
			htmlFor={htmlFor}
			className="text-sm font-medium text-[var(--text-primary)]"
		>
			{children}
		</label>
	);
}

// ── NeedsForm ─────────────────────────────────────────────────────────────────

export function NeedForm(): ReactElement {
	const { data, error, status, analyze, reset } = useNeedAnalysis();
	const opHistory = useOpHistory();
	const [form, setForm] = useState<NeedFormInput>(EMPTY_FORM);

	const handleChange = useCallback(
		(field: keyof NeedFormInput) =>
			(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
				setForm((prev) => ({ ...prev, [field]: e.target.value }));
			},
		[],
	);

	const handleSubmit = useCallback(
		(e: FormEvent<HTMLFormElement>): void => {
			e.preventDefault();
			analyze(form, { text: opHistory.text });
		},
		[analyze, form, opHistory.text],
	);

	const handleRetry = useCallback((): void => {
		analyze(form, { text: opHistory.text });
	}, [analyze, form, opHistory.text]);

	const handleResetAndEdit = useCallback((): void => {
		reset();
	}, [reset]);

	const isLoading = status === "loading";

	return (
		<div className="space-y-6">
			{/* Form card — always visible */}
			<Card>
				<CardHeader>
					<CardTitle>Définir le besoin</CardTitle>
					<CardDescription>
						Saisissez les informations sur le poste à pourvoir pour générer une
						analyse complète.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-5" onSubmit={handleSubmit}>
						{/* Row 1: Client, Manager, Job Title */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="flex flex-col gap-2">
								<FieldLabel htmlFor="need-client">Client</FieldLabel>
								<input
									id="need-client"
									className={inputBase}
									placeholder="Nom du client"
									type="text"
									value={form.client}
									onChange={handleChange("client")}
									disabled={isLoading}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<FieldLabel htmlFor="need-op-manager">
									Manager opérationnel
								</FieldLabel>
								<input
									id="need-op-manager"
									className={inputBase}
									placeholder="Nom du manager"
									type="text"
									value={form.operationalManager}
									onChange={handleChange("operationalManager")}
									disabled={isLoading}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<FieldLabel htmlFor="need-job-title">
									Intitulé du poste
								</FieldLabel>
								<input
									id="need-job-title"
									className={inputBase}
									placeholder="Ex: Développeur Senior Java/Kafka"
									type="text"
									value={form.jobTitle}
									onChange={handleChange("jobTitle")}
									disabled={isLoading}
								/>
							</div>
						</div>

						{/* Row 2: TJM, Location, Start date, Remote */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
							<div className="flex flex-col gap-2">
								<FieldLabel htmlFor="need-tjm">TJM (€)</FieldLabel>
								<input
									id="need-tjm"
									className={inputBase}
									placeholder="Ex: 550-650"
									type="text"
									value={form.tjm}
									onChange={handleChange("tjm")}
									disabled={isLoading}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<FieldLabel htmlFor="need-location">Localisation</FieldLabel>
								<input
									id="need-location"
									className={inputBase}
									placeholder="Ex: Paris / Full remote"
									type="text"
									value={form.location}
									onChange={handleChange("location")}
									disabled={isLoading}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<FieldLabel htmlFor="need-start-date">
									Date de démarrage
								</FieldLabel>
								<input
									id="need-start-date"
									className={inputBase}
									placeholder="Ex: 01/09/2026"
									type="text"
									value={form.startDate}
									onChange={handleChange("startDate")}
									disabled={isLoading}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<FieldLabel htmlFor="need-remote">Mode remote</FieldLabel>
								<input
									id="need-remote"
									className={inputBase}
									placeholder="Ex: Hybride (2j/semaine)"
									type="text"
									value={form.remoteMode}
									onChange={handleChange("remoteMode")}
									disabled={isLoading}
								/>
							</div>
						</div>

						{/* Row 3: JD textarea */}
						<div className="flex flex-col gap-2">
							<FieldLabel htmlFor="need-jd">
								Description du poste
							</FieldLabel>
							<textarea
								id="need-jd"
								className={cn(inputBase, "min-h-[120px] resize-y")}
								placeholder="Collez ici la description du poste (fiche de poste, email du client...)"
								value={form.jobDescription}
								onChange={handleChange("jobDescription")}
								disabled={isLoading}
							/>
						</div>

						{/* Row 4: Context/Qualification textarea */}
						<div className="flex flex-col gap-2">
							<FieldLabel htmlFor="need-context">
								Contexte / Qualification
							</FieldLabel>
							<textarea
								id="need-context"
								className={cn(inputBase, "min-h-[80px] resize-y")}
								placeholder="Informations complémentaires : contexte du projet, qualifications requises, spécificités du client..."
								value={form.contextQualification}
								onChange={handleChange("contextQualification")}
								disabled={isLoading}
							/>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-3">
							<Button type="submit" size="lg" disabled={isLoading}>
								<Sparkles className="h-4 w-4" />
								{isLoading ? "Analyse en cours..." : "Analyser le besoin"}
							</Button>
							{status === "success" && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={handleResetAndEdit}
									disabled={isLoading}
								>
									Modifier les données
								</Button>
							)}
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Result section */}
			<NeedResult
				data={data}
				error={error}
				status={status}
				onRetry={handleRetry}
			/>
		</div>
	);
}
