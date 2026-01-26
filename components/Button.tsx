import Link from "next/link";
import type { ButtonProps } from "@/types/components.button.types";

export default function Button({
  label,
  disabled,
  filled,
  type,
  onClick,
  href,
}: ButtonProps) {
  if (type === "link") {
    if (href) {
      const className = `px-4 py-2 rounded-md border-2 text-center ${
        filled
          ? "bg-background text-text-primary border-background"
          : "bg-primary text-text-accent border-background"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:brightness-90 transition-all duration-300"}`;

      return disabled ? (
        <div className={className}>{label}</div>
      ) : (
        <Link href={href}>
          <div className={className}>{label}</div>
        </Link>
      );
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
          className={`px-4 py-2 rounded-md text-center ${
            filled
              ? "bg-background text-text-primary"
              : "bg-primary text-text-accent border-2 border-background"
          } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:brightness-90 transition-all duration-300"}`}
        >
          {label}
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
