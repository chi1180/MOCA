import Booking from "@/components/Booking";
import Header from "@/components/Header";
import Highlight from "@/components/Highlight";

export default function Home() {
  return (
    <div className="w-full h-full bg-background">
      <Header />

      <main className="max-w-7xl mx-auto space-y-8 pt-8 pb-16 px-4">
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
          <Booking />
        </section>
      </main>

      {
        // TODO ::: [ ] Footer
      }
    </div>
  );
}
