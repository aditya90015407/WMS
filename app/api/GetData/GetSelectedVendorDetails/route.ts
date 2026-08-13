import { NextResponse } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { signOut } from "next-auth/react";

export async function POST(req: Request) {
  try {

    const session = await getServerSession(authOptions);

    if (!session) {
      await signOut({ callbackUrl: '/sign-in', redirect: true })
      return NextResponse.json("Invalid Request")
    }

    const body = await req.json();
    const id = String(body?.ID ?? "").trim();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing required field: ID" },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("SQL pool is not connected after getConnection()");
    }

    const result = await pool
      .request()
      .input("FLAG", sql.NVarChar(50), "GetSelectedVendorDetails")
      .input("ID", sql.NVarChar(50), id)
      .execute("PRO-WMS_GET");

    const rows = Array.isArray(result.recordset)
      ? result.recordset
      : [];
    //  console.log("GetSelectedVendorDetails rows:", result);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "GetSelectedVendorDetails API failed",
        error: message,
      },
      { status: 500 }
    );
  }
}
