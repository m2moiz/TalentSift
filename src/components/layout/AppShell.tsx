import type { ReactElement, ReactNode } from "react";
import type { TabId } from "./TabBar";
import { TabBar } from "./TabBar";
import type { OpHistoryBarProps } from "./OpHistoryBar";
import { OpHistoryBar } from "./OpHistoryBar";

export interface AppShellProps {
	readonly activeTab: TabId;
	readonly onTabChange: (tab: TabId) => void;
	readonly opHistoryProps: OpHistoryBarProps;
	readonly children: ReactNode;
}

export function AppShell({
	activeTab,
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
							Recruiter Cockpit
						</h1>
					</div>
				</div>
			</header>

			{/* Operational history bar */}
			<div className="px-6 pt-4 md:px-10">
				<OpHistoryBar {...opHistoryProps} />
			</div>

			{/* Tab navigation */}
			<div className="px-6 pt-4 md:px-10">
				<TabBar activeTab={activeTab} onTabChange={onTabChange} />
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
