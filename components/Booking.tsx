"use client";

import { LucideMap } from "lucide-react";
import dynamic from "next/dynamic";
import Card from "./Card";

const FukutomiMap = dynamic(() => import("@/components/FukutomiMap"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse" />,
});

export default function Booking() {
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
          <Card
            title="予約情報"
            description="選択したルートと乗降ポイントの情報"
          >
            <div>Card Content</div>
          </Card>
        </div>
        <div className="w-full">
          <Card
            title="乗降ポイント一覧"
            description="選択可能な乗降ポイントのリスト"
          >
            <div>Card Content</div>
          </Card>
        </div>
      </div>
    </>
  );
}
