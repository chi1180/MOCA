export type SidebarMode = "add" | "edit" | "delete";

export interface SidebarContentProps {
  mode: SidebarMode;
  editPoint?: any | null;
  deletingPoint?: any | null;
  onSubmit: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mode: SidebarMode;
  title: string;
  children: React.ReactNode;
}
