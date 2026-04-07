import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("SQL pool is not connected after getConnection()");
    }

    const result = await pool.request().query("SELECT TOP 1 1 AS ok");

    return NextResponse.json({
      success: true,
      message: "Database connection verified",
      data: result.recordset,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown Message";
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: message,
      },
      { status: 500 },
    );
  }
}
