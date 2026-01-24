import type { HighlightProps } from "@/types/components.highlight.types";

export default function Highlight({ children, color }: HighlightProps) {
  return (
    <span className={`px-2 font-medium rounded-sm bg-(${color})`}>
      {children}
    </span>
  );
}
