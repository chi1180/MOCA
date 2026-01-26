"use client";

import Card from "./Card";
import dynamic from "next/dynamic";
import { LucideMap } from "lucide-react";

import { useMemo } from "react";

export default function Booking() {
  const FukutomiMap = useMemo(
    () =>
      dynamic(() => import("./FukutomiMap"), {
        loading: () => (
          <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
            Loading Map...
          </div>
        ),
        ssr: false,
      }),
    [],
  );

  return (
    <>
      <div className="w-2/3 aspect-square">
        <Card
          title="福富町マップ"
          description="ボタンを押して、地図上でポイントを選択できます"
          icon={<LucideMap />}
        >
          <FukutomiMap />
        </Card>
      </div>

      <div className="w-1/3 flex flex-col gap-8">
        <div className="w-full">
          <Card title="今日の運行ルート" description="利用するルートを選択">
            <div>Card Content</div>
          </Card>
        </div>
        <div className="w-full">
          <Card title="乗車予約" description="乗降ポイントと希望時刻を入力">
            <div>Card Content</div>
          </Card>
        </div>
      </div>
    </>
  );
}
