import { NextResponse } from "next/server";
import type { ZodError, ZodSchema } from "zod";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/api.types";

// Format Zod validation errors into a consistent structure
export function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

// Create a success response
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

// Create an error response
export function errorResponse(
  error: string,
  status: number = 500,
  details?: Array<{ field: string; message: string }>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error,
      ...(details && { details }),
    },
    { status }
  );
}

// Validate request body against a Zod schema
export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: NextResponse<ApiErrorResponse> }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false,
        error: errorResponse("Validation error", 400, formatZodErrors(result.error)),
      };
    }

    return { success: true, data: result.data };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return {
        success: false,
        error: errorResponse("Invalid JSON format", 400),
      };
    }
    return {
      success: false,
      error: errorResponse("Failed to parse request body", 400),
    };
  }
}

// Parse query parameters with defaults
export function parseQueryParams(request: Request) {
  const { searchParams } = new URL(request.url);

  return {
    get: (key: string) => searchParams.get(key),
    getNumber: (key: string, defaultValue?: number): number | undefined => {
      const value = searchParams.get(key);
      if (value === null) return defaultValue;
      const num = parseInt(value, 10);
      return isNaN(num) ? defaultValue : num;
    },
    getBoolean: (key: string, defaultValue?: boolean): boolean | undefined => {
      const value = searchParams.get(key);
      if (value === null) return defaultValue;
      return value === "true" || value === "1";
    },
  };
}

// Handle Supabase errors
export function handleSupabaseError(error: { message: string; code?: string }) {
  console.error("Supabase error:", error);

  // Handle specific error codes
  if (error.code === "23505") {
    return errorResponse("A record with this value already exists", 409);
  }
  if (error.code === "23503") {
    return errorResponse("Referenced record does not exist", 400);
  }
  if (error.code === "22P02") {
    return errorResponse("Invalid UUID format", 400);
  }

  return errorResponse(error.message || "Database error", 500);
}

// Validate UUID format
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
