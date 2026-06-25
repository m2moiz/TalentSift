import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/cn";

const cardVariants = cva(
	"rounded-[12px] border border-[var(--border-default)] p-6",
	{
		variants: {
			variant: {
				default: "bg-[var(--surface-secondary)]",
				elevated: "bg-[var(--surface-elevated)]",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

interface CardProps
	extends HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
	({ className, variant, ...props }, ref) => (
		<div
			className={cn(cardVariants({ variant, className }))}
			ref={ref}
			{...props}
		/>
	),
);
Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
	({ className, ...props }, ref) => (
		<div className={cn("mb-4 space-y-1.5", className)} ref={ref} {...props} />
	),
);
CardHeader.displayName = "CardHeader";

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
	({ className, ...props }, ref) => (
		<h3
			className={cn("text-xl font-semibold tracking-[-0.02em]", className)}
			ref={ref}
			{...props}
		/>
	),
);
CardTitle.displayName = "CardTitle";

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
	({ className, ...props }, ref) => (
		<p
			className={cn(
				"text-sm leading-6 text-[var(--text-secondary)]",
				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
CardDescription.displayName = "CardDescription";

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
	({ className, ...props }, ref) => (
		<div className={cn(className)} ref={ref} {...props} />
	),
);
CardContent.displayName = "CardContent";

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
	({ className, ...props }, ref) => (
		<div
			className={cn("mt-4 flex items-center gap-4", className)}
			ref={ref}
			{...props}
		/>
	),
);
CardFooter.displayName = "CardFooter";

export {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	type CardContentProps,
	type CardDescriptionProps,
	type CardFooterProps,
	type CardHeaderProps,
	type CardProps,
	type CardTitleProps,
	cardVariants,
};
