import Link from "next/link";
import type { ButtonProps } from "@/types/components.button.types";

export default function Button({
  label,
  disabled,
  filled,
  type,
  onClick,
  href,
  icon,
}: ButtonProps) {
  if (type === "link") {
    if (href) {
      const className = `px-4 py-2 rounded-md border-2 text-center ${
        filled
          ? "bg-background text-text-primary border-background"
          : "bg-primary text-text-accent border-background"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:brightness-90 transition-all duration-300"}`;
      const InnerContent = (
        <div className={className}>
          <div className="flex items-center">
            {icon && (
              <span className="mr-2 inline-block align-middle">{icon}</span>
            )}
            {label}
          </div>
        </div>
      );

      return disabled ? InnerContent : <Link href={href}>{InnerContent}</Link>;
    } else {
      throw new Error(
        "Invalid Button props. Href is required when type is 'link'.",
      );
    }
  } else if (type === "button") {
    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`px-4 py-2 rounded-md border-2 ${
            filled
              ? "bg-background text-text-primary border-background"
              : "bg-primary text-text-accent border-background"
          } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:brightness-90 transition-all duration-300"}`}
        >
          <div className="flex items-center">
            {icon && (
              <span className="mr-2 inline-block align-middle">{icon}</span>
            )}
            {label}
          </div>
        </button>
      );
    } else {
      throw new Error(
        "Invalid Button props. onClick is required when type is 'button'.",
      );
    }
  } else {
    throw new Error(
      "Invalid Button props. Type prop mush be 'link' with href or 'button' with onClick.",
    );
  }
}
