import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// Zodスキーマ定義
const pointSchema = z.object({
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Zodでバリデーション
    const validationResult = pointSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: "バリデーションエラー",
          details: errors,
        },
        { status: 400 },
      );
    }

    const { name, address, latitude, longitude, type } = validationResult.data;

    // TODO: データベースに保存する処理を実装
    // 現在はモックレスポンスを返す
    const newPoint = {
      id: Date.now().toString(),
      name,
      address,
      latitude,
      longitude,
      type,
      createdAt: new Date().toISOString(),
    };

    console.log("New point created:", newPoint);

    return NextResponse.json(
      {
        success: true,
        data: newPoint,
        message: "ポイントが正常に追加されました",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating point:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON format",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // TODO: データベースからポイント一覧を取得する処理を実装
    // 現在はモックデータを返す
    const points = [
      {
        id: "1",
        name: "福富支所前",
        address: "広島県東広島市福富町久芳1545-1",
        latitude: 34.540889,
        longitude: 132.77544,
        type: "get_on_off",
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: points,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
