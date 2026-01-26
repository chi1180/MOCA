export interface ButtonProps {
  type: "button" | "link";
  label: string;
  href?: string;
  filled?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}
