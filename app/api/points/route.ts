import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { z } from "zod";
import {
  pointSchema,
  type CreatePointResponse,
  type GetPointsResponse,
  type PointWithId,
} from "@/types/api.points.types";

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

      const response: CreatePointResponse = {
        success: false,
        error: "バリデーションエラー",
        details: errors,
      };

      return NextResponse.json(response, { status: 400 });
    }

    const { name, address, latitude, longitude, type } = validationResult.data;

    // TODO: データベースに保存する処理を実装
    // 現在はモックレスポンスを返す
    const newPoint: PointWithId = {
      id: Date.now().toString(),
      name,
      address,
      latitude,
      longitude,
      type,
      createdAt: new Date().toISOString(),
    };

    console.log("New point created:", newPoint);

    const response: CreatePointResponse = {
      success: true,
      data: newPoint,
      message: "ポイントが正常に追加されました",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating point:", error);

    if (error instanceof SyntaxError) {
      const response: CreatePointResponse = {
        success: false,
        error: "Invalid JSON format",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: CreatePointResponse = {
      success: false,
      error: "Internal server error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET() {
  try {
    // TODO: データベースからポイント一覧を取得する処理を実装
    // 現在はモックデータを返す
    const points: PointWithId[] = [
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

    const response: GetPointsResponse = {
      success: true,
      data: points,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching points:", error);

    const response: GetPointsResponse = {
      success: false,
      error: "Internal server error",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
