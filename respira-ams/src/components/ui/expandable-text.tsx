"use client";

import { useEffect, useRef, useState } from "react";

interface ExpandableTextProps {
	text: string;
	/** Maximum number of lines shown while collapsed. */
	lines?: 2 | 3 | 4;
	className?: string;
}

const LINE_CLAMP_CLASS: Record<2 | 3 | 4, string> = {
	2: "line-clamp-2",
	3: "line-clamp-3",
	4: "line-clamp-4",
};

export function ExpandableText({ text, lines = 3, className }: ExpandableTextProps) {
	const [expanded, setExpanded] = useState(false);
	const [overflowing, setOverflowing] = useState(false);
	const textRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const element = textRef.current;
		if (!element || expanded) return;
		setOverflowing(element.scrollHeight > element.clientHeight + 1);
	}, [text, expanded]);

	return (
		<div className="relative">
			<span
				ref={textRef}
				className={`block whitespace-normal break-words leading-snug ${
					expanded ? "" : LINE_CLAMP_CLASS[lines]
				} ${className ?? ""}`}
			>
				{text}
			</span>

			{!expanded && overflowing && (
				<>
					<span className="pointer-events-none absolute bottom-0 right-0 h-5 w-20 bg-gradient-to-l from-surface to-transparent" />
					<button
						type="button"
						onClick={(event) => {
							event.stopPropagation();
							setExpanded(true);
						}}
						className="absolute bottom-0 right-0 cursor-pointer rounded bg-surface px-1 text-[10px] font-semibold text-primary hover:underline"
					>
						… Xem thêm
					</button>
				</>
			)}

			{expanded && (
				<button
					type="button"
					onClick={(event) => {
						event.stopPropagation();
						setExpanded(false);
					}}
					className="mt-1 block cursor-pointer text-[10px] font-semibold text-primary hover:underline"
				>
					Thu gọn
				</button>
			)}
		</div>
	);
}

export default ExpandableText;
