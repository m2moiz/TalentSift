import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/cn";

const alertVariants = cva(
	"relative w-full rounded-[8px] border p-4 text-sm",
	{
		variants: {
			variant: {
				default: [
					"border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-primary)]",
				],
				success: [
					"border-[var(--status-success)]/20 bg-[var(--status-success)]/5 text-[var(--status-success)]",
				],
				warning: [
					"border-[var(--status-warning)]/20 bg-[var(--status-warning)]/5 text-[var(--status-warning)]",
				],
				error: [
					"border-[var(--status-error)]/20 bg-[var(--status-error)]/5 text-[var(--status-error)]",
				],
				info: [
					"border-[var(--status-info)]/20 bg-[var(--status-info)]/5 text-[var(--status-info)]",
				],
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

interface AlertProps
	extends HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof alertVariants> {}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
	({ className, variant, ...props }, ref) => (
		<div
			role="alert"
			className={cn(alertVariants({ variant, className }))}
			ref={ref}
			{...props}
		/>
	),
);
Alert.displayName = "Alert";

interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const AlertTitle = forwardRef<HTMLHeadingElement, AlertTitleProps>(
	({ className, ...props }, ref) => (
		<h5
			className={cn("mb-1 font-medium leading-none tracking-tight", className)}
			ref={ref}
			{...props}
		/>
	),
);
AlertTitle.displayName = "AlertTitle";

interface AlertDescriptionProps
	extends HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription = forwardRef<
	HTMLParagraphElement,
	AlertDescriptionProps
>(({ className, ...props }, ref) => (
	<div
		className={cn("text-sm leading-5 opacity-90", className)}
		ref={ref}
		{...props}
	/>
));
AlertDescription.displayName = "AlertDescription";

export {
	Alert,
	AlertDescription,
	AlertTitle,
	type AlertDescriptionProps,
	type AlertProps,
	type AlertTitleProps,
	alertVariants,
};
