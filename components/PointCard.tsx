import { LucideMapPin, LucidePencil, LucideTrash2 } from "lucide-react";
import type { PointWithId } from "@/types/api.points.types";

interface PointCardProps {
  point: PointWithId;
  isSelected: boolean;
  onClick: () => void;
  onEdit: (point: PointWithId) => void;
  onDelete: (point: PointWithId) => void;
}

// Get label for point type
function getTypeLabel(type: string): string {
  switch (type) {
    case "get_on_off":
      return "乗降可";
    case "get_on":
      return "乗車のみ";
    case "get_off":
      return "降車のみ";
    default:
      return type;
  }
}

// Get color for point type
function getTypeColor(type: string): string {
  switch (type) {
    case "get_on_off":
      return "bg-blue-100 text-blue-800";
    case "get_on":
      return "bg-green-100 text-green-800";
    case "get_off":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function PointCard({
  point,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}: PointCardProps) {
  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(point);
  };

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(point);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg border transition-all duration-200
        hover:shadow-md cursor-pointer
        ${
          isSelected
            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/30"
            : "border-gray-200 bg-white hover:border-gray-300"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
            shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}
          `}
        >
          <LucideMapPin size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {point.name}
            </h3>
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full font-medium shrink-0
                ${getTypeColor(point.type)}
              `}
            >
              {getTypeLabel(point.type)}
            </span>
          </div>

          <p className="text-sm text-gray-600 truncate">{point.address}</p>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>緯度: {point.latitude.toFixed(6)}</span>
            <span>経度: {point.longitude.toFixed(6)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="shrink-0 flex items-center gap-1">
          {/* Edit button */}
          <button
            type="button"
            onClick={handleEditClick}
            className="p-2 rounded-full hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors"
            title="編集"
          >
            <LucidePencil size={16} />
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={handleDeleteClick}
            className="p-2 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
            title="削除"
          >
            <LucideTrash2 size={16} />
          </button>
        </div>
      </div>
    </button>
  );
}
