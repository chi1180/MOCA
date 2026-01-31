"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { PointAddProps } from "@/types/components.point_add.types";
import type { FukutomiMapRef } from "@/types/components.map.types";
import { RECOMMENDED_TAGS } from "@/data/data";
import Button from "./Button";

export default function PointAdd({
  onSubmit,
  onCancel,
  isOpen,
  mode = "create",
  editPoint = null,
}: PointAddProps) {
  const isEditMode = mode === "edit" && editPoint !== null;

  const ElementIDs = {
    name: useId(),
    address: useId(),
    latitude: useId(),
    longitude: useId(),
    ability: useId(),
    type: useId(),
    tags: useId(),
  };

  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    ability: "get_on_off",
    type: "traveling",
    tags: [] as string[],
  });

  const [isMapReady, setIsMapReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const mapRef = useRef<FukutomiMapRef | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagifyRef = useRef<unknown>(null);
  const [mapKey, setMapKey] = useState(0);

  // Initialize form data when editing
  useEffect(() => {
    if (isOpen && isEditMode && editPoint) {
      setFormData({
        name: editPoint.name,
        address: editPoint.address,
        ability: editPoint.ability,
        type: editPoint.type,
        tags: editPoint.tags,
      });
      setMarkerPosition([editPoint.latitude, editPoint.longitude]);
    } else if (isOpen && !isEditMode) {
      // Reset form for create mode
      setFormData({
        name: "",
        address: "",
        ability: "get_on_off",
        type: "traveling",
        tags: [],
      });
      setMarkerPosition(null);
    }
  }, [isOpen, isEditMode, editPoint]);

  // Initialize tagify when dialog opens and tags input is available
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      // Dynamic import of Tagify
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      import("@yaireo/tagify").then((TagifyModule: unknown) => {
        const TagifyClass = (TagifyModule as { default: unknown }).default;
        const tagInput = document.getElementById(
          ElementIDs.tags,
        ) as HTMLInputElement;

        if (tagInput && !tagifyRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tagify = new (TagifyClass as any)({
            whitelist: RECOMMENDED_TAGS,
            dropdown: {
              maxItems: 20,
              classname: "tags-look",
              enabled: 0,
              closeOnSelect: false,
            },
            maxTags: 10,
            editTags: true,
          });

          tagify.attach(tagInput);

          // Initialize with existing tags
          if (formData.tags && formData.tags.length > 0) {
            tagify.removeAllTags();
            tagify.addTags(formData.tags);
          }

          tagifyRef.current = tagify;

          // Update formData when tags change
          tagInput.addEventListener("change", (e: Event) => {
            const target = e.target as HTMLInputElement;
            try {
              const tags = JSON.parse(target.value || "[]") as Array<{
                value: string;
              }>;
              setFormData((prev) => ({
                ...prev,
                tags: tags.map((tag) => tag.value),
              }));
            } catch {
              // Handle JSON parse error
            }
          });
        }
      });
    }

    return () => {
      if (tagifyRef.current) {
        (tagifyRef.current as unknown as { destroy: () => void }).destroy();
        tagifyRef.current = null;
      }
    };
  }, [isOpen, ElementIDs.tags, formData.tags]);

  // Initialize map when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsMapReady(false);
      setMapKey((prev) => prev + 1);

      const timer = setTimeout(() => {
        setIsMapReady(true);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setIsMapReady(false);
      if (!isEditMode) {
        setMarkerPosition(null);
      }
    }
  }, [isOpen, isEditMode]);

  // Recalculate map size after dialog animation
  useEffect(() => {
    if (isMapReady && mapRef.current) {
      const timers = [
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 200),
        setTimeout(() => {
          mapRef.current?.invalidateSize();
          // Fly to marker position if editing
          if (isEditMode && markerPosition) {
            mapRef.current?.flyToPoint(
              markerPosition[0],
              markerPosition[1],
              15,
            );
          }
        }, 500),
      ];

      return () => {
        timers.forEach((timer) => {
          clearTimeout(timer);
        });
      };
    }
  }, [isMapReady, isEditMode, markerPosition]);

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

    const data = {
      name: formData.name,
      address: formData.address,
      latitude: markerPosition?.[0] ?? 0,
      longitude: markerPosition?.[1] ?? 0,
      ability: formData.ability,
      type: formData.type,
      tags: formData.tags,
    };

    // Client-side validation
    if (!data.name || !data.address) {
      toast.error("すべての必須項目を入力してください");
      return;
    }

    if (!markerPosition) {
      toast.error("地図上をクリックして位置を指定してください");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      isEditMode ? "ポイントを更新中..." : "ポイントを追加中...",
    );

    try {
      const url = isEditMode ? `/api/points/${editPoint?.id}` : "/api/points";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      toast.dismiss(loadingToast);

      if (!response.ok) {
        if (result.details && Array.isArray(result.details)) {
          result.details.forEach(
            (detail: { field: string; message: string }) => {
              toast.error(`${detail.field}: ${detail.message}`);
            },
          );
        } else {
          toast.error(
            result.error ||
              (isEditMode
                ? "ポイントの更新に失敗しました"
                : "ポイントの追加に失敗しました"),
          );
        }
        return;
      }

      // Success
      toast.success(
        result.message ||
          (isEditMode
            ? "ポイントが正常に更新されました"
            : "ポイントが正常に追加されました"),
      );

      // Reset form
      if (formRef.current) {
        formRef.current.reset();
      }
      setFormData({
        name: "",
        address: "",
        ability: "get_on_off",
        type: "traveling",
        tags: [],
      });
      setMarkerPosition(null);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getAbilityLabel = (ability: string): string => {
    switch (ability) {
      case "get_on_off":
        return "乗下車可";
      case "get_on":
        return "乗車のみ";
      case "get_off":
        return "下車のみ";
      default:
        return ability;
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "departure":
        return "出発地";
      case "arrival":
        return "到着地";
      case "traveling":
        return "経由地";
      default:
        return type;
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
        {isEditMode
          ? "ポイント情報を編集します"
          : "福富町に新しい乗降ポイントを追加します"}
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
            value={formData.name}
            onChange={handleInputChange}
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
            required
            className={Styles.input}
            disabled={isSubmitting}
            value={formData.address}
            onChange={handleInputChange}
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
              readOnly
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
              readOnly
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Ability */}
        <div>
          <label className={Styles.label} htmlFor={ElementIDs.ability}>
            乗下車可能性 {Required}
          </label>
          <select
            id={ElementIDs.ability}
            name="ability"
            className={Styles.input}
            required
            disabled={isSubmitting}
            value={formData.ability}
            onChange={handleInputChange}
          >
            <option value="get_on_off">{getAbilityLabel("get_on_off")}</option>
            <option value="get_on">{getAbilityLabel("get_on")}</option>
            <option value="get_off">{getAbilityLabel("get_off")}</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label className={Styles.label} htmlFor={ElementIDs.type}>
            ポイントタイプ {Required}
          </label>
          <select
            id={ElementIDs.type}
            name="type"
            className={Styles.input}
            required
            disabled={isSubmitting}
            value={formData.type}
            onChange={handleInputChange}
          >
            <option value="departure">{getTypeLabel("departure")}</option>
            <option value="arrival">{getTypeLabel("arrival")}</option>
            <option value="traveling">{getTypeLabel("traveling")}</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className={Styles.label} htmlFor={ElementIDs.tags}>
            タグ
          </label>
          <input
            id={ElementIDs.tags}
            type="text"
            placeholder="推奨タグから選択または自由に入力（複数選択可能）"
            className={`${Styles.input} tagify`}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            推奨: {RECOMMENDED_TAGS.join("、")}
          </p>
        </div>

        {/* Buttons */}
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
            {isSubmitting
              ? isEditMode
                ? "更新中..."
                : "追加中..."
              : isEditMode
                ? "更新する"
                : "追加する"}
          </button>
        </div>
      </form>
    </div>
  );
}
