export { };
import { NextResponse } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";

export async function handleViewGet(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const flag = (searchParams.get("flag") ?? "").trim();
    const wcid = (searchParams.get("WCID") ?? "").trim();
    const wid = (searchParams.get("WID") ?? "").trim();
    const wtid = (searchParams.get("WTID") ?? "").trim();
    const psid = (searchParams.get("PSID") ?? "").trim();
    const did = (searchParams.get("DID") ?? "").trim();
    const smid = (searchParams.get("SMID") ?? "").trim();
    const aid = (searchParams.get("AID") ?? "").trim();
    const generationDate = (searchParams.get("GenerationDate") ?? "").trim();

    if (!flag) {
      return NextResponse.json(
        { success: false, message: "Missing required query param: flag" },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("SQL pool is not connected after getConnection()");
    }

    const viewRequest = pool.request().input("FLAG", sql.NVarChar(30), flag);

    if (wcid && wcid !== "0") {
      viewRequest.input("WCID", sql.NVarChar(20), wcid);
    }
    if (wid && wid !== "0") {
      viewRequest.input("WID", sql.NVarChar(20), wid);
    }
    if (wtid && wtid !== "0") {
      viewRequest.input("WTID", sql.NVarChar(20), wtid);
    }
    if (psid && psid !== "0") {
      viewRequest.input("PSID", sql.NVarChar(20), psid);
    }
    if (did && did !== "0") {
      viewRequest.input("DID", sql.NVarChar(20), did);
    }
    if (smid && smid !== "0") {
      viewRequest.input("SMID", sql.NVarChar(20), smid);
    }
    if (aid && aid !== "0") {
      viewRequest.input("AID", sql.NVarChar(20), aid);
    }
    if (generationDate && generationDate !== "0") {
      viewRequest.input("GenerationDate", sql.NVarChar(20), generationDate);
    }

    const result = await viewRequest.execute("PRO-WMS_GET");
    // console.log(result)

    return NextResponse.json({
      success: true,
      data: result.recordset ?? [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown Message";
    return NextResponse.json(
      {
        success: false,
        message: "View API failed",
        error: message,
      },
      { status: 500 },
    );
  }
}
