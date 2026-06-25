import type { ReactElement } from "react";

export function App(): ReactElement {
	return (
		<main className="min-h-[100dvh] bg-[var(--surface-primary)] text-[var(--text-primary)]">
			<div className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col gap-8 px-6 py-10 md:px-10">
				<header className="space-y-3 border-b border-[var(--border-default)] pb-6">
					<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
						TDU Ultimate Builder Night
					</p>
					<div className="space-y-2">
						<h1 className="max-w-3xl text-4xl font-bold tracking-[-0.03em] md:text-5xl">
							Recruiter copilot bootstrap is ready.
						</h1>
						<p className="max-w-2xl text-base text-[var(--text-secondary)] md:text-lg">
							The app scaffold, design system, and build pipeline are in place.
							Next, the recruiter workflow layers can be implemented in
							parallel.
						</p>
					</div>
				</header>

				<section className="grid gap-4 md:grid-cols-3">
					<article className="rounded-[12px] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-6">
						<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
							Wave 1
						</p>
						<h2 className="mt-3 text-xl font-semibold tracking-[-0.02em]">
							Shared core
						</h2>
						<p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
							Types, API wrapper, prompts, utilities, layout shell, UI
							primitives, and operational history state.
						</p>
					</article>
					<article className="rounded-[12px] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-6">
						<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
							Wave 2
						</p>
						<h2 className="mt-3 text-xl font-semibold tracking-[-0.02em]">
							Recruiter tabs
						</h2>
						<p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
							Need analysis, CV matching, dashboard outputs, and demo-prefill
							data for the Kafka scenario.
						</p>
					</article>
					<article className="rounded-[12px] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-6">
						<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
							Wave 3
						</p>
						<h2 className="mt-3 text-xl font-semibold tracking-[-0.02em]">
							Demo readiness
						</h2>
						<p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
							Error states, loading skeletons, environment wiring, and the final
							2-minute walkthrough polish.
						</p>
					</article>
				</section>
			</div>
		</main>
	);
}
