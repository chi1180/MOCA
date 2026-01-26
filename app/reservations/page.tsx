import SubpageHeader from "@/components/SubpageHeader";

export default function BookingsPage() {
  return (
    <div className="w-full h-full bg-background">
      <SubpageHeader type="reservations" />

      <main className="max-w-7xl mx-auto space-y-8 pt-8 pb-16 px-4"></main>
    </div>
  );
}
