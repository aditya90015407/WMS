import { NextResponse } from "next/server";
import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json("Invalid Request")
    }

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("SQL pool is not connected");
    }

    const result = await pool
      .request()
      .input("FLAG", "GetVendor")
      .execute("PRO-WMS_GET");

    const rows =
      (Array.isArray(result.recordset) && result.recordset) ||
      ((result as any).recordsets?.[0] ?? []);

    // console.log(rows)

    return NextResponse.json({
      success: true,
      data: rows.map((r: any) => ({
        id: String(r.ID ?? r.VID ?? r.VendorID ?? ""),
        name: String(
          r.Name ??
          r.VENDORNAME ??
          r.VendorName ??
          r.VENDOR ??
          r["Vendor Name"] ??
          ""
        ).trim(),
        email: String(r.Email ?? ""),
        vendorCode: String(r.VendorCode ?? ""),
        IsActive: r.IsActive
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, message, data: [] }, { status: 500 });
  }
}