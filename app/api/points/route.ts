import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, address, latitude, longitude, type } = body;

    if (!name || !address || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate latitude and longitude
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude" },
        { status: 400 }
      );
    }

    // TODO: データベースに保存する処理を実装
    // 現在はモックレスポンスを返す
    const newPoint = {
      id: Date.now().toString(),
      name,
      address,
      latitude,
      longitude,
      type: type || "乗降可",
      createdAt: new Date().toISOString(),
    };

    console.log("New point created:", newPoint);

    return NextResponse.json(
      {
        success: true,
        data: newPoint,
        message: "ポイントが正常に追加されました",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating point:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
        type: "乗降可",
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: points,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
