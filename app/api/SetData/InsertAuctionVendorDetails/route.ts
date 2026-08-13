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

    const empCode = String(session?.user?.id ?? "").trim();
    if (!empCode) {
      return NextResponse.json(
        { success: false, message: "Session not found. Please sign in again." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const pool = await getConnection();

    if (!pool || !pool.connected) {
      throw new Error("DB Not Connected");
    }

    const iddid = String(body.IDDID ?? "").trim();
    const vid = String(body.VID ?? "").trim();

    if (!iddid || !vid) {
      return NextResponse.json(
        { success: false, message: "IDDID and VID are required" },
        { status: 400 },
      );
    }

    const result = await pool
      .request()
      .input("FLAG", sql.NVarChar(50), "InsertAuctionVendorDetails")
      .input("IDDID", sql.NVarChar(50), iddid)
      .input("VID", sql.NVarChar(50), vid)
      .input("EmpCode", sql.Int, Number(empCode))
      .execute("PRO-WMS_SET");

    return NextResponse.json({
      success: true,
      message: "Vendor inserted successfully",
      data: result.recordset,
    });
  } catch (err: any) {
    console.error("InsertAuctionVendorDetails error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err?.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}