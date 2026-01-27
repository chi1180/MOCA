"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { PointAddProps } from "@/types/components.point_add.types";
import type { FukutomiMapRef } from "@/types/components.map.types";
import Button from "./Button";

export default function PointAdd({
  onSubmit,
  onCancel,
  isOpen,
}: PointAddProps) {
  const ElementIDs = {
    name: useId(),
    address: useId(),
    latitude: useId(),
    longitude: useId(),
    type: useId(),
  };

  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null,
  );

  const [isMapReady, setIsMapReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const mapRef = useRef<FukutomiMapRef | null>(null);
  const [mapKey, setMapKey] = useState(0);

  // ダイアログの開閉に応じてマップを再初期化
  useEffect(() => {
    if (isOpen) {
      // ダイアログが閉じていた場合はマップをリセット
      setIsMapReady(false);
      // マップを強制的に再マウント
      setMapKey((prev) => prev + 1);

      const timer = setTimeout(() => {
        setIsMapReady(true);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      // ダイアログが閉じたらマップをリセット
      setIsMapReady(false);
      setMarkerPosition(null);
    }
  }, [isOpen]);

  // マップのサイズを再計算（ダイアログのアニメーション完了後）
  useEffect(() => {
    if (isMapReady && mapRef.current) {
      // keyによる再マウントと組み合わせて、確実にレンダリング
      const timers = [
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 200),
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 500),
      ];

      return () => {
        timers.forEach((timer) => {
          clearTimeout(timer);
        });
      };
    }
  }, [isMapReady]);

  const FukutomiMap = useMemo(
    () =>
      dynamic(() => import("../components/FukutomiMap"), {
        loading: () => (
          <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
            Loading Map...
          </div>
        ),
        ssr: false,
      }),
    [],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      latitude: parseFloat(formData.get("latitude") as string),
      longitude: parseFloat(formData.get("longitude") as string),
      type: formData.get("type") as string,
    };

    // クライアント側でのバリデーション
    if (!data.name || !data.address) {
      toast.error("すべての必須項目を入力してください");
      return;
    }

    if (Number.isNaN(data.latitude) || Number.isNaN(data.longitude)) {
      toast.error("地図上をクリックして位置を指定してください");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("ポイントを追加中...");

    try {
      const response = await fetch("/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      toast.dismiss(loadingToast);

      if (!response.ok) {
        // バリデーションエラーの詳細を表示
        if (result.details && Array.isArray(result.details)) {
          result.details.forEach(
            (detail: { field: string; message: string }) => {
              toast.error(`${detail.field}: ${detail.message}`);
            },
          );
        } else {
          toast.error(result.error || "ポイントの追加に失敗しました");
        }
        return;
      }

      // 成功時
      toast.success(result.message || "ポイントが正常に追加されました");

      // フォームをリセット
      if (formRef.current) {
        formRef.current.reset();
      }
      setMarkerPosition(null);

      // 親コンポーネントのonSubmitを呼び出す（存在する場合）
      if (onSubmit) {
        onSubmit(e);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error submitting point:", error);
      toast.error("ネットワークエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Styles = {
    label: "block text-sm font-medium text-gray-700 mb-1",
    input:
      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-accent",
  };
  const Required = <span className="text-red-500">*</span>;

  return (
    <div className="w-full space-y-4">
      {/* Description */}
      <p className="text-sm text-gray-600">
        福富町に新しい乗降ポイントを追加します
      </p>

      {/* Map */}
      <div className="w-full h-64 border border-gray-200 rounded-lg overflow-hidden relative">
        {isMapReady ? (
          <FukutomiMap
            key={mapKey}
            className="w-full h-full"
            onMapClick={(lat, lng) => setMarkerPosition([lat, lng])}
            markerPosition={markerPosition}
            ref={mapRef}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
            <span className="text-gray-500">Loading map...</span>
          </div>
        )}
        <p className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs text-gray-600 shadow z-10">
          地図をクリックして位置を調整できます
        </p>
      </div>

      {/* Form */}
      <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
        {/* Point name */}
        <div>
          <label className={Styles.label} htmlFor={ElementIDs.name}>
            ポイント名 {Required}
          </label>
          <input
            id={ElementIDs.name}
            name="name"
            type="text"
            placeholder="例：福富支所前"
            required
            className={Styles.input}
            disabled={isSubmitting}
          />
        </div>

        {/* Address */}
        <div>
          <label className={Styles.label} htmlFor={ElementIDs.address}>
            住所 {Required}
          </label>
          <input
            id={ElementIDs.address}
            name="address"
            type="text"
            placeholder="例：広島県東広島市福富町久芳1545-1"
            defaultValue=""
            required
            className={Styles.input}
            disabled={isSubmitting}
          />
        </div>

        {/* Latitude & Longitude */}
        <div className="w-full flex gap-4">
          {/* Latitude */}
          <div className="w-full">
            <label className={Styles.label} htmlFor={ElementIDs.latitude}>
              緯度 {Required}
            </label>
            <input
              id={ElementIDs.latitude}
              name="latitude"
              type="number"
              step="any"
              placeholder="地図上をクリックしてください"
              required
              className={Styles.input}
              value={markerPosition?.[0] ?? ""}
              onChange={() => {}} // controlled componentとして動作させる
              disabled={isSubmitting}
            />
          </div>

          {/* Longitude */}
          <div className="w-full">
            <label className={Styles.label} htmlFor={ElementIDs.longitude}>
              経度 {Required}
            </label>
            <input
              id={ElementIDs.longitude}
              name="longitude"
              type="number"
              step="any"
              placeholder="地図上をクリックしてください"
              required
              className={Styles.input}
              value={markerPosition?.[1] ?? ""}
              onChange={() => {}} // controlled componentとして動作させる
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Type */}
        <div>
          <label className={Styles.label} htmlFor={ElementIDs.type}>
            タイプ {Required}
          </label>
          <select
            id={ElementIDs.type}
            name="type"
            defaultValue="get_on_off"
            className={Styles.input}
            required
            disabled={isSubmitting}
          >
            <option value="get_on_off">乗下車可</option>
            <option value="get_on">乗車可</option>
            <option value="get_off">下車可</option>
          </select>
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            label="キャンセル"
            onClick={onCancel}
            filled
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="px-4 bg-primary text-white rounded-md hover:brightness-90 border-primary border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "追加中..." : "追加する"}
          </button>
        </div>
      </form>
    </div>
  );
}
