import { NextResponse } from "next/server";
import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            await signOut({ callbackUrl: '/', redirect: true })
            return NextResponse.json("Invalid Request")
        }

        var EmpCode = "", EmpName = "";
        if (session) {
            EmpCode = session?.user?.id || "";
            EmpName = session?.user?.username || "";
        }

        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("SQL pool is not connected");
        }

        const result = await pool
            .request()
            .input("FLAG", "GetAllVendors")
            .input("EmpCode", EmpCode)
            .execute("PRO-WMS_GET");

        const rows =
            (Array.isArray(result.recordset) && result.recordset) ||
            ((result as any).recordsets?.[0] ?? []);

        // console.log(rows)

        return NextResponse.json(result.recordset);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, message, data: [] }, { status: 500 });
    }
}