import type { ReactElement } from "react";

export type TabId = "need" | "cvs" | "dashboard";

export interface Tab {
	id: TabId;
	label: string;
}

export const TABS: Tab[] = [
	{ id: "need", label: "Analyse du besoin" },
	{ id: "cvs", label: "Matching CV" },
	{ id: "dashboard", label: "Classement" },
];

export interface TabBarProps {
	readonly activeTab: TabId;
	readonly onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps): ReactElement {
	return (
		<nav
			aria-label="Main navigation"
			className="border-b border-[var(--border-default)]"
		>
			<div className="flex gap-1" role="tablist">
				{TABS.map((tab) => {
					const isActive = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							role="tab"
							aria-selected={isActive}
							aria-controls={`panel-${tab.id}`}
							id={`tab-${tab.id}`}
							className={[
								"relative px-5 py-3 text-sm font-medium transition-colors duration-120 ease-out",
								"focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent-primary)]",
								isActive
									? "text-[var(--accent-primary)] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-[var(--accent-primary)]"
									: "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]",
							].join(" ")}
							onClick={() => {
								onTabChange(tab.id);
							}}
							type="button"
						>
							{tab.label}
						</button>
					);
				})}
			</div>
		</nav>
	);
}
