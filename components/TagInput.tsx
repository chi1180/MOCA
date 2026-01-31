"use client";

import { LucideX } from "lucide-react";
import { useState } from "react";
import type { TagInputProps } from "@/types/components.tag_input.types";

export default function TagInput({
  value,
  onChange,
  placeholder = "タグを入力してください",
  maxTags = 10,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Check for space or comma
    if (e.key === " " || e.key === "," || e.key === "Enter") {
      e.preventDefault();

      const trimmedValue = inputValue.trim().replace(/,\s*$/, "");

      // Add tag if not empty and not duplicate and haven't reached max
      if (
        trimmedValue &&
        !value.includes(trimmedValue) &&
        value.length < maxTags
      ) {
        onChange([...value, trimmedValue]);
        setInputValue("");
      }
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleInputBlur = () => {
    // Add tag on blur if input has value
    const trimmedValue = inputValue.trim().replace(/,\s*$/, "");
    if (
      trimmedValue &&
      !value.includes(trimmedValue) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmedValue]);
      setInputValue("");
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Tag Display Area */}
      <div className="w-full min-h-10 px-3 py-2 border border-gray-300 rounded-md bg-white flex flex-wrap gap-2 items-start content-start">
        {value.map((tag, index) => (
          <div
            key={`${tag}-${index}`}
            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(index)}
              disabled={disabled}
              className="hover:bg-blue-200 rounded p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Remove tag: ${tag}`}
            >
              <LucideX size={14} />
            </button>
          </div>
        ))}

        {/* Input Field */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled || value.length >= maxTags}
          className="flex-1 min-w-[100px] outline-none bg-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Helper Text */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          スペース、カンマ、またはエンターキーでタグを追加します
        </p>
        <p className="text-xs text-gray-500">
          {value.length} / {maxTags}
        </p>
      </div>
    </div>
  );
}
