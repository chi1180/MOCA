import Card from "@/components/Card";
import Header from "@/components/Header";
import Highlight from "@/components/Highlight";
import { LucideMap } from "lucide-react";
export default function Home() {
  return (
    <div className="w-full h-full bg-background">
      <Header />

      <main className="*:py-12">
        {/* TOP */}
        <section className="flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold">どこへ行きますか？</h1>
          <h2 className="text-2xl">
            <Highlight color="bg-primary">運行ルート</Highlight>
            を選択し、
            <Highlight color="bg-secondary">乗降ポイント</Highlight>
            を選んでください
          </h2>
        </section>

        {/* BOOKING */}
        <section className="flex max-w-7xl gap-8 mx-auto">
          <div className="w-3/4">
            <Card title="福富町マップ" icon={<LucideMap />}>
              <div>Card Content</div>
            </Card>
          </div>

          <div className="w-1/4 flex flex-col gap-8">
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
        </section>
      </main>

      {
        // TODO ::: [ ] Footer
      }
    </div>
  );
}
