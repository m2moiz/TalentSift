import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";

import { AppShell } from "./components/layout/AppShell";
import type { TabId } from "./components/layout/TabBar";
import { CVInputs } from "./components/tab-cvs/CVInputs";
import { ClientBriefCard } from "./components/tab-dashboard/ClientBrief";
import { PitchScript } from "./components/tab-dashboard/PitchScript";
import { RankingPanel } from "./components/tab-dashboard/RankingPanel";
import { NeedForm } from "./components/tab-need/NeedForm";
import { Button } from "./components/ui/button";
import { getDemoCvEntries, getDemoNeedForm } from "./data/demo-preload";
import { useCvMatching } from "./hooks/useCvMatching";
import { useOpHistory } from "./hooks/useOpHistory";
import { useRanking } from "./hooks/useRanking";
import type { Locale, NeedAnalysisOutput } from "./lib/types";

export function App(): ReactElement {
	const { text: opHistoryText, setText: setOpHistoryText } = useOpHistory();
	const [locale, setLocale] = useState<Locale>("fr");
	const [activeTab, setActiveTab] = useState<TabId>("need");
	const demoNeedForm = useMemo(() => getDemoNeedForm(locale), [locale]);
	const demoCvEntries = useMemo(() => getDemoCvEntries(locale), [locale]);
	const [needAnalysis, setNeedAnalysis] = useState<NeedAnalysisOutput | null>(
		null,
	);
	const cvMatching = useCvMatching(
		needAnalysis,
		{ text: opHistoryText },
		locale,
		demoCvEntries,
	);
	const ranking = useRanking(locale);

	const handleLocaleChange = useCallback(
		(nextLocale: Locale) => {
			setLocale(nextLocale);
			setNeedAnalysis(null);
			cvMatching.clearResults();
			ranking.reset();
		},
		[cvMatching, ranking],
	);

	const dashboardStatus = ranking.status.kind;
	const dashboardError =
		ranking.status.kind === "error" ? ranking.status.message : undefined;
	const canGenerateDashboard =
		needAnalysis !== null &&
		cvMatching.result !== null &&
		!cvMatching.isLoading &&
		dashboardStatus !== "loading";

	const handleNeedAnalysisChange = useCallback(
		(data: NeedAnalysisOutput | null) => {
			setNeedAnalysis(data);
			if (data === null) {
				cvMatching.clearResults();
				ranking.reset();
			}
		},
		[cvMatching, ranking],
	);

	const handleRunDashboard = useCallback((): void => {
		if (needAnalysis === null || cvMatching.result === null) {
			return;
		}
		void ranking.runRanking(needAnalysis, cvMatching.result.candidates, {
			text: opHistoryText,
		});
	}, [cvMatching.result, needAnalysis, opHistoryText, ranking]);

	const handleCopyBrief = useCallback((): void => {
		if (ranking.output === null) {
			return;
		}
		const brief = ranking.output.clientBrief;
		const text = [
			`${brief.firstName} — ${brief.headline}`,
			"",
			brief.experienceSummary,
			"",
			`Forces: ${brief.strengths.join("; ")}`,
			`Points de vigilance: ${brief.watchPoints.join("; ")}`,
			`Infos complémentaires: ${brief.infosComplementaires.yearsOfExperience}, disponibilité ${brief.infosComplementaires.availability}, TJM ${brief.infosComplementaires.tjm}`,
		].join("\n");
		void navigator.clipboard.writeText(text);
	}, [ranking.output]);

	const handleCopyPitch = useCallback((): void => {
		if (ranking.output === null) {
			return;
		}
		void navigator.clipboard.writeText(ranking.output.pitchScript);
	}, [ranking.output]);

	const dashboardIntro = useMemo(() => {
		if (needAnalysis === null) {
			return locale === "en"
				? "Analyze the hiring need first to unlock the final ranking."
				: "Analysez d'abord le besoin pour débloquer le classement final.";
		}
		if (cvMatching.result === null) {
			return locale === "en"
				? "Then run CV matching to prepare the client brief and recruiter pitch."
				: "Lancez ensuite le matching CV pour préparer le brief client et le pitch recruteur.";
		}
		return locale === "en"
			? "Generate the final ranking to produce the TDU client brief and mission pitch."
			: "Générez le classement final pour produire le brief client TDU et le pitch de mission.";
	}, [cvMatching.result, locale, needAnalysis]);

	const rankingPanelProps = {
		locale,
		output: ranking.output,
		status: dashboardStatus,
		...(dashboardError === undefined ? {} : { errorMessage: dashboardError }),
		...(canGenerateDashboard ? { onRetry: handleRunDashboard } : {}),
	};

	const clientBriefProps = {
		brief: ranking.output?.clientBrief ?? null,
		locale,
		status: dashboardStatus,
		...(dashboardError === undefined ? {} : { errorMessage: dashboardError }),
		...(ranking.output === null ? {} : { onCopy: handleCopyBrief }),
	};

	const pitchScriptProps = {
		locale,
		text: ranking.output?.pitchScript ?? null,
		status: dashboardStatus,
		...(dashboardError === undefined ? {} : { errorMessage: dashboardError }),
		...(ranking.output === null ? {} : { onCopy: handleCopyPitch }),
	};

	return (
		<AppShell
			activeTab={activeTab}
			locale={locale}
			onLocaleChange={handleLocaleChange}
			onTabChange={setActiveTab}
			opHistoryProps={{
				locale,
				text: locale === "en" ? "Operational context" : "Contexte opérationnel",
				value: opHistoryText,
				onChange: setOpHistoryText,
			}}
		>
			{activeTab === "need" && (
				<NeedForm
					initialForm={demoNeedForm}
					locale={locale}
					onAnalysisChange={handleNeedAnalysisChange}
				/>
			)}
			{activeTab === "cvs" && (
				<CVInputs
					cvEntries={cvMatching.cvEntries}
					onCvEntryChange={cvMatching.setCvEntry}
					result={cvMatching.result}
					isLoading={cvMatching.isLoading}
					error={cvMatching.error}
					onRunMatching={() => {
						void cvMatching.runMatching();
					}}
					onClearResults={() => {
						cvMatching.clearResults();
						ranking.reset();
					}}
					hasAnalysis={needAnalysis !== null}
					locale={locale}
				/>
			)}
			{activeTab === "dashboard" && (
				<section className="space-y-6">
					<div className="space-y-3">
						<h2 className="text-lg font-semibold tracking-[-0.02em]">
							{locale === "en" ? "Final ranking" : "Classement final"}
						</h2>
						<p className="max-w-prose text-sm leading-6 text-[var(--text-secondary)]">
							{dashboardIntro}
						</p>
						<div className="flex items-center gap-3">
							<Button
								onClick={handleRunDashboard}
								disabled={!canGenerateDashboard}
							>
								{dashboardStatus === "loading"
									? locale === "en"
										? "Generating..."
										: "Génération en cours..."
									: locale === "en"
										? "Generate final ranking"
										: "Générer le classement final"}
							</Button>
							{ranking.output !== null && (
								<Button variant="ghost" size="sm" onClick={ranking.reset}>
									{locale === "en" ? "Reset" : "Réinitialiser"}
								</Button>
							)}
						</div>
					</div>

					<div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
						<RankingPanel {...rankingPanelProps} />
						<div className="space-y-6">
							<ClientBriefCard {...clientBriefProps} locale={locale} />
							<PitchScript {...pitchScriptProps} locale={locale} />
						</div>
					</div>
				</section>
			)}
		</AppShell>
	);
}
