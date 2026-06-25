import type { ReactElement, ReactNode } from "react";
import type { Locale } from "../../lib/types";
import type { OpHistoryBarProps } from "./OpHistoryBar";
import { OpHistoryBar } from "./OpHistoryBar";
import type { TabId } from "./TabBar";
import { TabBar } from "./TabBar";

export interface AppShellProps {
	readonly activeTab: TabId;
	readonly locale: Locale;
	readonly onLocaleChange: (locale: Locale) => void;
	readonly onTabChange: (tab: TabId) => void;
	readonly opHistoryProps: OpHistoryBarProps;
	readonly children: ReactNode;
}

export function AppShell({
	activeTab,
	locale,
	onLocaleChange,
	onTabChange,
	opHistoryProps,
	children,
}: AppShellProps): ReactElement {
	return (
		<div className="mx-auto flex min-h-[100dvh] w-full max-w-[1280px] flex-col bg-[var(--surface-primary)] text-[var(--text-primary)]">
			{/* Header */}
			<header className="border-b border-[var(--border-default)] px-6 py-5 md:px-10">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
							TDU Recruiter Copilot
						</p>
						<h1 className="mt-1 text-xl font-semibold tracking-[-0.02em] md:text-2xl">
							{locale === "en" ? "Recruiter Cockpit" : "Recruiter Cockpit"}
						</h1>
					</div>
					<div className="flex items-center gap-2 rounded-[8px] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-1">
						<button
							type="button"
							onClick={() => {
								onLocaleChange("fr");
							}}
							className={[
								"rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors",
								locale === "fr"
									? "bg-[var(--accent-primary)] text-white"
									: "text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]",
							].join(" ")}
						>
							FR
						</button>
						<button
							type="button"
							onClick={() => {
								onLocaleChange("en");
							}}
							className={[
								"rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors",
								locale === "en"
									? "bg-[var(--accent-primary)] text-white"
									: "text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]",
							].join(" ")}
						>
							EN
						</button>
					</div>
				</div>
			</header>

			{/* Operational history bar */}
			<div className="px-6 pt-4 md:px-10">
				<OpHistoryBar {...opHistoryProps} />
			</div>

			{/* Tab navigation */}
			<div className="px-6 pt-4 md:px-10">
				<TabBar
					activeTab={activeTab}
					locale={locale}
					onTabChange={onTabChange}
				/>
			</div>

			{/* Active content panel */}
			<main
				aria-labelledby={`tab-${activeTab}`}
				className="flex-1 px-6 pb-8 pt-6 md:px-10"
				id={`panel-${activeTab}`}
				role="tabpanel"
			>
				{children}
			</main>
		</div>
	);
}
