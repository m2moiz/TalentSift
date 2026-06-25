import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "../../lib/cn";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
	({ className, ...props }, ref) => (
		<div
			className={cn("animate-pulse rounded-[8px] bg-[var(--border-subtle)]", className)}
			ref={ref}
			{...props}
		/>
	),
);
Skeleton.displayName = "Skeleton";

export { Skeleton, type SkeletonProps };
