import Card from "@/components/Card";
import SubpageHeader from "@/components/SubpageHeader";
import {
  LucideMapPin,
  LucideRoute,
  LucideZap,
  LucideUsers,
} from "lucide-react";

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
  return (
    <div className="w-full h-full bg-background">
      <SubpageHeader type="operator" />

      <main className="*:py-12 max-w-7xl mx-auto">
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
      </main>
    </div>
  );
}
