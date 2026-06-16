import { NextResponse } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const session = await getServerSession(authOptions);
        const pool = await getConnection();

        const empCode = String(session?.user?.id ?? "").trim();
        if (!empCode) {
            return NextResponse.json(
                { success: false, message: "Session not found. Please sign in again." },
                { status: 401 },
            );
        }

        if (!pool || !pool.connected) {
            throw new Error("DB Not Connected");
        }

        const VendorDetailsVerified = body.VendorDetailsVerified;
        const IDDID = body.IDDID

        // console.log(body)

        const result = await pool
            .request()
            .input("FLAG", "VerifyVendorDetails")
            .input("IDDID", IDDID)
            // .input("VendorDetailsVerified", VendorDetailsVerified)
            .input("EmpCode", Number(empCode))
            .execute("PRO-WMS_SET");
        // console.log(result.recordset)
        return NextResponse.json({
            success: true,
            data: {
                recordset: result.recordset ?? [],
            },
        });


    } catch (e: any) {
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
