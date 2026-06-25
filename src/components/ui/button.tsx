import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "../../lib/cn";

const buttonVariants = cva(
	[
		"inline-flex items-center justify-center gap-2 rounded-[8px] text-sm font-medium",
		"transition-[color,background-color,border-color] duration-[120ms] ease-out",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2",
		"disabled:pointer-events-none disabled:opacity-50",
	],
	{
		variants: {
			variant: {
				primary: [
					"bg-[var(--accent-primary)] text-white",
					"hover:bg-[var(--accent-hover)]",
				],
				secondary: [
					"border border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-primary)]",
					"hover:bg-[var(--border-subtle)]",
				],
				ghost: [
					"text-[var(--text-secondary)]",
					"hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]",
				],
			},
			size: {
				sm: "h-8 gap-1.5 px-3 text-xs",
				default: "h-10 px-4",
				lg: "h-12 gap-3 px-6 text-base",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "default",
		},
	},
);

interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => (
		<button
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	),
);
Button.displayName = "Button";

export { Button, type ButtonProps, buttonVariants };
