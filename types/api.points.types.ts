import { z } from "zod";

// Zodスキーマ定義
export const pointSchema = z.object({
  name: z.string().min(1, "ポイント名は必須です"),
  address: z.string().min(1, "住所は必須です"),
  latitude: z
    .number()
    .min(-90, "緯度は-90以上である必要があります")
    .max(90, "緯度は90以下である必要があります"),
  longitude: z
    .number()
    .min(-180, "経度は-180以上である必要があります")
    .max(180, "経度は180以下である必要があります"),
  type: z.enum(["get_on_off", "get_on", "get_off"]).default("get_on_off"),
});

// スキーマから型を推論
export type Point = z.infer<typeof pointSchema>;

// APIレスポンスの型定義
export interface PointWithId extends Point {
  id: string;
  createdAt: string;
}

export interface CreatePointResponse {
  success: boolean;
  data?: PointWithId;
  message?: string;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface GetPointsResponse {
  success: boolean;
  data?: PointWithId[];
  error?: string;
}
