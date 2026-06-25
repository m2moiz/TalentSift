import { createContext, type ReactNode, useContext, useState } from "react";

export interface OpHistoryValue {
	readonly text: string;
	setText: (text: string) => void;
}

const OpHistoryContext = createContext<OpHistoryValue | null>(null);

export function OpHistoryProvider({
	children,
}: {
	readonly children: ReactNode;
}): ReactNode {
	const [text, setText] = useState("");

	return (
		<OpHistoryContext.Provider value={{ text, setText }}>
			{children}
		</OpHistoryContext.Provider>
	);
}

export function useOpHistory(): OpHistoryValue {
	const ctx = useContext(OpHistoryContext);
	if (ctx === null) {
		throw new Error("useOpHistory must be used within an OpHistoryProvider");
	}
	return ctx;
}
