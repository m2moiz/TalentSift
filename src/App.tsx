import { useState } from "react";
import type { ReactElement } from "react";

import { AppShell } from "./components/layout/AppShell";
import type { TabId } from "./components/layout/TabBar";
import { useOpHistory } from "./hooks/useOpHistory";

export function App(): ReactElement {
	const { text: opHistoryText, setText: setOpHistoryText } = useOpHistory();
	const [activeTab, setActiveTab] = useState<TabId>("need");

	return (
		<AppShell
			activeTab={activeTab}
			onTabChange={setActiveTab}
			opHistoryProps={{
				text: "Operational history",
				value: opHistoryText,
				onChange: setOpHistoryText,
			}}
		>
			{activeTab === "need" && <NeedPlaceholder />}
			{activeTab === "cvs" && <CvsPlaceholder />}
			{activeTab === "dashboard" && <DashboardPlaceholder />}
		</AppShell>
	);
}

function NeedPlaceholder(): ReactElement {
	return (
		<section className="space-y-4">
			<h2 className="text-lg font-semibold tracking-[-0.02em]">
				Need Analysis
			</h2>
			<p className="max-w-prose text-sm leading-6 text-[var(--text-secondary)]">
				Define the hiring need — role, requirements, context. Candidate CV
				matching will appear here once the analysis is complete.
			</p>
			<div className="rounded-[8px] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-8 text-center text-sm text-[var(--text-tertiary)]">
				Need input panel — coming in next wave
			</div>
		</section>
	);
}

function CvsPlaceholder(): ReactElement {
	return (
		<section className="space-y-4">
			<h2 className="text-lg font-semibold tracking-[-0.02em]">
				CV Review
			</h2>
			<p className="max-w-prose text-sm leading-6 text-[var(--text-secondary)]">
				Uploaded CVs will be listed here with match scores, key findings, and
				verification results.
			</p>
			<div className="rounded-[8px] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-8 text-center text-sm text-[var(--text-tertiary)]">
				CV list panel — coming in next wave
			</div>
		</section>
	);
}

function DashboardPlaceholder(): ReactElement {
	return (
		<section className="space-y-4">
			<h2 className="text-lg font-semibold tracking-[-0.02em]">Dashboard</h2>
			<p className="max-w-prose text-sm leading-6 text-[var(--text-secondary)]">
				Summary view — overall match analytics, top candidates, and action
				items for the recruiter.
			</p>
			<div className="rounded-[8px] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-8 text-center text-sm text-[var(--text-tertiary)]">
				Dashboard panel — coming in next wave
			</div>
		</section>
	);
}
