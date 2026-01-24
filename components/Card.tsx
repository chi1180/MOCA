import type { CardProps } from "@/types/components.card.types";

export default function Card({
  children,
  icon,
  title,
  description,
}: CardProps) {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-3 bg-white rounded-lg shadow border border-gray-200">
      {/* HEADER */}
      <div className="w-full flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>

      {/* CONTENT */}
      {children}
    </div>
  );
}
