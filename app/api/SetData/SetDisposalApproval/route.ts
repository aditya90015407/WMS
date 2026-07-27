import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Invalid session" },
                { status: 401 },
            );
        }

        const body = await req.json();
        const FDDID = Number(body?.FDDID ?? 0);
        const StsCode = Number(body?.StsCode ?? 0);
        const Remarks = String(body?.Remarks ?? "").trim();
        const EmpCode = String(session.user.id ?? "").trim();
        const IDDID = body.IDDID

        // console.log(body)

        if (!FDDID) {
            return NextResponse.json(
                { success: false, message: "FDDID is required" },
                { status: 400 },
            );
        }

        if (!StsCode) {
            return NextResponse.json(
                { success: false, message: "StsCode is required" },
                { status: 400 },
            );
        }

        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("Couldn't connect to Database");
        }

        const result = await pool
            .request()
            .input("FLAG", "SetDisposalApproval")
            .input("StsCode", StsCode)
            .input("Remarks", Remarks)
            .input("FDDID", FDDID)
            .input("IDDID", IDDID)
            .input("EmpCode", EmpCode)
            .execute("PRO-WMS_SET");

        return NextResponse.json({
            success: true,
            data: result.recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 },
        );
    }
}

