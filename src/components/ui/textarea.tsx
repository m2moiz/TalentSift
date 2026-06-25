import { forwardRef, type TextareaHTMLAttributes, useId } from "react";

import { cn } from "../../lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	/** Visible label text associated with the textarea. */
	label?: string;
	/** Error message shown below the textarea. When set, the textarea
	 * enters the error state (red border) and the message has role="alert". */
	error?: string;
	/** Helper text shown below the textarea (hidden when error is set). */
	helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, label, error, helperText, id: externalId, ...props }, ref) => {
		const autoId = useId();
		const id = externalId ?? autoId;
		const errorId = `${id}-error`;
		const helperId = `${id}-helper`;

		return (
			<div className="flex flex-col gap-2">
				{label !== undefined && (
					<label
						htmlFor={id}
						className="text-sm font-medium text-[var(--text-primary)]"
					>
						{label}
					</label>
				)}
				<textarea
					id={id}
					className={cn(
						"min-h-[80px] w-full rounded-[8px] border bg-[var(--surface-secondary)]",
						"px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
						"transition-[border-color,box-shadow] duration-[120ms] ease-out",
						"focus-visible:border-[var(--accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/20",
						"disabled:cursor-not-allowed disabled:opacity-50",
						error !== undefined
							? "border-[var(--status-error)] focus-visible:border-[var(--status-error)] focus-visible:ring-[var(--status-error)]/20"
							: "border-[var(--border-default)]",
						className,
					)}
					aria-invalid={error !== undefined ? true : undefined}
					aria-describedby={
						error !== undefined
							? errorId
							: helperText !== undefined
								? helperId
								: undefined
					}
					ref={ref}
					{...props}
				/>
				{error !== undefined && (
					<p
						id={errorId}
						className="text-xs text-[var(--status-error)]"
						role="alert"
					>
						{error}
					</p>
				)}
				{helperText !== undefined && error === undefined && (
					<p id={helperId} className="text-xs text-[var(--text-tertiary)]">
						{helperText}
					</p>
				)}
			</div>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea, type TextareaProps };
