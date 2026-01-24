export interface ButtonProps {
  label: string;
  disabled?: boolean;
  filled?: boolean;

  type: "button" | "link";
  onClick?: () => void;
  href?: string;
}
