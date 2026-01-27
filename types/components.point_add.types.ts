import type { PointWithId } from "./api.points.types";

export interface PointAddProps {
  onSubmit?: (e?: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
  isOpen?: boolean;
  // Edit mode props
  mode?: "create" | "edit";
  editPoint?: PointWithId | null;
}
