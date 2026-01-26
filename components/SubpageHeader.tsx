"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import type { SubpageHeaderProps } from "@/types/components.subpage_header.props";

export default function SubpageHeader({ type }: SubpageHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        const scrollTop = window.scrollY;
        setIsScrolled(scrollTop > 0);
      };

      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  });

  const Content = {
    title: "",
    subtitle: "",
    headerButton: <></>,
  };

  if (type === "operator") {
    Content.title = "事業者管理画面";
    Content.subtitle = "東広島市福富町 - ポイントとルートの管理";
    Content.headerButton = <Button label="ユーザ画面へ" type="link" href="/" />;
  } else if (type === "reservations") {
    Content.title = "予約一覧画面";
    Content.subtitle = "東広島市福富町 - 予約内容の確認と変更";
    Content.headerButton = (
      <Button label="新規予約" type="link" href="/" filled />
    );
  } else {
    throw new Error(
      "Invalid SubpageHeader props. Type prop must be 'operator' or 'reservations'.",
    );
  }

  return (
    <header
      className={`w-full h-20 py-4 bg-primary flex items-center justify-around sticky top-0 z-50 ${isScrolled ? "shadow-md" : ""} transition-shadow duration-300`}
    >
      {/* Back button & title */}
      <div className="h-full flex items-center gap-4">
        <Button label="←" type="link" href="/" filled />
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-text-primary">
            {Content.title}
          </h1>
          <p className="text-text-secondary text-sm">{Content.subtitle}</p>
        </div>
      </div>

      {/* Header buttons */}
      <div className="flex gap-4">{Content.headerButton}</div>
    </header>
  );
}
