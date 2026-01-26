"use client";

import Button from "@/components/Button";
import Card from "@/components/Card";
import SubpageHeader from "@/components/SubpageHeader";
import {
  LucideMapPin,
  LucideRoute,
  LucideZap,
  LucideUsers,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

export default function OperatorPage() {
  const CardData = [
    {
      description: "登録ポイント",
      color: "#155dfc",
      icon: LucideMapPin,
      value: "12",
    },
    {
      description: "運行ルート",
      color: "#9810fa",
      icon: LucideRoute,
      value: "5",
    },
    {
      description: "運行中ルート",
      color: "#f59e0b",
      icon: LucideZap,
      value: "3",
    },
    {
      description: "アクティブユーザ",
      color: "#10b981",
      icon: LucideUsers,
      value: "120+",
    },
  ];

  const FukutomiMap = useMemo(
    () =>
      dynamic(() => import("../../components/FukutomiMap"), {
        loading: () => (
          <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
            Loading Map...
          </div>
        ),
        ssr: false,
      }),
    [],
  );

  const [tab, setTab] = useState<"points" | "routes">("points");

  return (
    <div className="w-full h-full bg-background">
      <SubpageHeader type="operator" />

      <main className="max-w-7xl mx-auto space-y-8 pt-8 pb-16 px-4">
        {/* TOP Cards */}
        <section className="flex items-center justify-between gap-4">
          {CardData.map((card, index) => (
            <Card key={index.toString()} description={card.description}>
              <div className="flex items-center justify-between">
                <span
                  className="text-3xl font-semibold"
                  style={{ color: card.color }}
                >
                  {card.value}
                </span>
                <card.icon color={card.color} size={48} opacity={0.6} />
              </div>
            </Card>
          ))}
        </section>

        {/* Point management area */}
        <section className="flex justify-between gap-4">
          <div className="w-1/2 aspect-square">
            <Card
              title="福富町マップ"
              description="ボタンを押して、地図上でポイントを選択できます"
              icon={<LucideMapPin />}
            >
              <FukutomiMap />
            </Card>
          </div>

          <div className="w-1/2 flex flex-col gap-8">
            {/* TAB Buttons */}
            <div className="w-full flex gap-2">
              <Button
                label="ポイント管理"
                type="button"
                filled={tab !== "points"}
                onClick={() => setTab("points")}
                icon={<LucideMapPin size={18} />}
              />
              <Button
                label="ルート管理"
                type="button"
                filled={tab !== "routes"}
                onClick={() => setTab("routes")}
                icon={<LucideRoute size={18} />}
              />
            </div>

            {/* Card */}
            <div className="w-full">
              <Card
                title="乗車予約管理"
                description="ユーザからの乗車予約の確認・管理を行います"
                icon={<LucideUsers />}
              >
                <div>Card Content</div>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
