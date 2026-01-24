import type { CardProps } from "@/types/components.card.types";

export default function Card({
  children,
  icon,
  title,
  description,
}: CardProps) {
  return (
    <div className="w-full h-full p-2 rounded-lg shadow border border-gray-200">
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        <div>{children}</div>
      </div>
      {children}
    </div>
  );
}
