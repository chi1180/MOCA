export interface DialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  content: React.ReactNode;
  children?: React.ReactNode;
}
