import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";
import { authOptions } from "../../options";

type EditPayload = {
  id?: string;
  date?: string;
  categoryId?: string;
  wasteId?: string;
  receiver?: string;
  disposer?: string;
  physicalState?: string;
  storage?: string;
  quantity?: string;
  disposalTarget?: string;
};

export async function handleEditPost(request: Request) {
  try {
    const body = (await request.json()) as EditPayload;
    const authSession = await getServerSession(authOptions);
    const createdBy = String(authSession?.user?.id ?? "").trim();

    if (!createdBy) {
      return NextResponse.json(
        {
          success: false,
          message: "Session not found. Please sign in again.",
        },
        { status: 401 },
      );
    }

    const requiredFields: Array<keyof EditPayload> = [
      "id",
      "date",
      "categoryId",
      "wasteId",
      "receiver",
      "disposer",
      "physicalState",
      "storage",
      "quantity",
      "disposalTarget",
    ];

    const missing = requiredFields.find((key) => {
      const value = body[key];
      return typeof value !== "string" || value.trim().length === 0;
    });

    if (missing) {
      return NextResponse.json(
        { success: false, message: `Missing required field: ${missing}` },
        { status: 400 },
      );
    }

    const wasteQty = Number(body.quantity);
    if (!Number.isFinite(wasteQty) || wasteQty <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be a valid number greater than 0",
        },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("SQL pool is not connected after getConnection()");
    }

    const result = await pool
      .request()
      .input("FLAG", sql.NVarChar(20), "GWT-UPD")
      .input("WRID", sql.NVarChar(20), body.id as string)
      .input("WCID", sql.NVarChar(20), body.categoryId as string)
      .input("WID", sql.NVarChar(20), body.wasteId as string)
      .input("WTID", sql.NVarChar(20), body.receiver as string)
      .input("PSID", sql.NVarChar(20), body.physicalState as string)
      .input("DID", sql.NVarChar(20), body.disposer as string)
      .input("SMID", sql.NVarChar(20), body.storage as string)
      .input("AID", sql.NVarChar(20), body.receiver as string)
      .input("WasteQty", sql.Decimal(18, 2), wasteQty)
      .input("GenerationDate", sql.Date, body.date as string)
      .input("TargetDate", sql.Date, body.disposalTarget as string)
      .input("CRBY", sql.NVarChar(50), createdBy)
      .execute("PRO-WMS_SET");

    const firstRow = result.recordset?.[0] as Record<string, unknown> | undefined;
    const values = firstRow ? Object.values(firstRow) : [];
    const responseMessage =
      typeof values[0] === "string" ? values[0] : "Record updated successfully";

    return NextResponse.json({
      success: true,
      message: responseMessage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown Message";
    return NextResponse.json(
      {
        success: false,
        message: "Edit API failed",
        error: message,
      },
      { status: 500 },
    );
  }
}
