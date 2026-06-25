import { History } from "lucide-react";
import type { ReactElement } from "react";

export interface OpHistoryBarProps {
	readonly text: string;
	readonly value: string;
	readonly onChange: (value: string) => void;
}

export function OpHistoryBar({
	text,
	value,
	onChange,
}: OpHistoryBarProps): ReactElement {
	return (
		<div className="flex items-center gap-3 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-4 py-2.5">
			<History
				aria-hidden="true"
				className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]"
			/>
			<span className="shrink-0 text-sm text-[var(--text-tertiary)]">
				{text}
			</span>
			<div className="h-4 w-px bg-[var(--border-subtle)]" />
			<input
				aria-label="Operation context"
				className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
				onChange={(e) => {
					onChange(e.target.value);
				}}
				placeholder="Biais, préférences ou notes sur le manager..."
				type="text"
				value={value}
			/>
		</div>
	);
}
