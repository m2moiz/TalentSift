import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/cn";

const badgeVariants = cva(
	"inline-flex items-center rounded-[6px] border px-2 py-0.5 text-xs font-medium capitalize",
	{
		variants: {
			variant: {
				fort: [
					"border-[var(--status-success)]/20 bg-[var(--status-success)]/10 text-[var(--status-success)]",
				],
				moyen: [
					"border-[var(--status-warning)]/20 bg-[var(--status-warning)]/10 text-[var(--status-warning)]",
				],
				faible: [
					"border-[var(--status-error)]/20 bg-[var(--status-error)]/10 text-[var(--status-error)]",
				],
				info: [
					"border-[var(--status-info)]/20 bg-[var(--status-info)]/10 text-[var(--status-info)]",
				],
			},
		},
		defaultVariants: {
			variant: "info",
		},
	},
);

interface BadgeProps
	extends HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
	({ className, variant, ...props }, ref) => (
		<span
			className={cn(badgeVariants({ variant, className }))}
			ref={ref}
			{...props}
		/>
	),
);
Badge.displayName = "Badge";

export { Badge, type BadgeProps, badgeVariants };
