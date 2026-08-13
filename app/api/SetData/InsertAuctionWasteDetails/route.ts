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
    const wrids = Array.isArray(body.WRID)
      ? body.WRID
      : String(body.WRID ?? "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    if (!iddid || wrids.length === 0) {
      return NextResponse.json(
        { success: false, message: "IDDID and WRID are required." },
        { status: 400 },
      );
    }

    const results: any[] = [];
    for (const wrid of wrids) {
      const result = await pool
        .request()
        .input("FLAG", sql.NVarChar(50), "InsertAuctionWasteDetails")
        .input("IDDID", sql.Int, Number(iddid))
        .input("WRID", sql.NVarChar(50), String(wrid))
        .input("EmpCode", sql.Int, Number(empCode))
        .execute("PRO-WMS_SET");

      results.push(result.recordset?.[0] ?? null);
    }

    return NextResponse.json({ success: true, data: results });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
