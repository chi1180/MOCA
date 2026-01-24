import Image from "next/image";
import Button from "./Button";

export default function Header() {
  return (
    <header className="w-full h-20 py-4 bg-primary flex items-center justify-around sticky top-0 z-50">
      {/* Icon & title */}
      <div className="h-full flex items-center gap-4">
        <div className="h-full aspect-square relative">
          <Image src={"/icon.png"} alt="MOCA Icon" fill />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-text-primary">MOCA</h1>
          <p className="text-text-secondary text-sm">東広島市福富町</p>
        </div>
      </div>

      {/* Header buttons */}
      <div className="flex gap-4">
        <Button label="予約履歴" type="link" href="/bookings" />
        <Button label="事業者画面" type="link" href="/operator" filled />
      </div>
    </header>
  );
}
