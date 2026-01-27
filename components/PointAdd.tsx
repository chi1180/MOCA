"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";

interface PointAddProps {
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function PointAdd({ onSubmit, onCancel }: PointAddProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    type: "乗降可",
  });

  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null,
  );

  const [isMapReady, setIsMapReady] = useState(false);

  // ダイアログが開かれた後にマップをレンダリング
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          type: formData.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add point");
      }

      // Reset form
      setFormData({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        type: "乗降可",
      });
      setMarkerPosition(null);

      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error("Error adding point:", error);
      alert("ポイントの追加に失敗しました");
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* 説明文 */}
      <p className="text-sm text-gray-600">
        福富町に新しい乗降ポイントを追加します
      </p>

      {/* 地図 */}
      <div
        className="w-full h-64 border border-gray-200 rounded-lg overflow-hidden relative"
        style={{ minHeight: "256px" }}
      >
        {isMapReady ? (
          <FukutomiMap
            className="w-full h-full"
            onMapClick={handleMapClick}
            markerPosition={markerPosition}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
            <span className="text-gray-500">マップを読み込み中...</span>
          </div>
        )}
        <p className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs text-gray-600 shadow z-10">
          地図をクリックして位置を調整できます
        </p>
      </div>

      {/* フォーム */}
      <div className="space-y-4">
        {/* ポイント名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ポイント名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="例: 福富支所前"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* 住所 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            住所 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="例: 広島県東広島市福富町久芳1545-1"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* 緯度・経度 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              緯度
            </label>
            <input
              type="text"
              placeholder="34.540889"
              value={formData.latitude}
              onChange={(e) =>
                setFormData({ ...formData, latitude: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              経度
            </label>
            <input
              type="text"
              placeholder="132.775440"
              value={formData.longitude}
              onChange={(e) =>
                setFormData({ ...formData, longitude: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* ポイント種別 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ポイント種別
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="乗降可">乗降可</option>
            <option value="乗車のみ">乗車のみ</option>
            <option value="降車のみ">降車のみ</option>
          </select>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            !formData.name ||
            !formData.address ||
            !formData.latitude ||
            !formData.longitude
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          追加する
        </button>
      </div>
    </div>
  );
}
