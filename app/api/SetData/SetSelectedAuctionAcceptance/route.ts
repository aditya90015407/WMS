import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";
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

        const pool = await getConnection()
        if (!pool || !pool.connected) {
            throw new Error("Could Not Connect to DataBase")
        }

        const EmpCode = session?.user.id

        const {
            APID, Acceptance, IDDID
        } = await req.json();

        // console.log(IDDID, APID, Acceptance)

        if (!APID) {
            return NextResponse.json(
                { success: false, message: "APID is required" },
                { status: 400 }
            );
        }

        const result = await pool
            .request()
            .input("FLAG", sql.VarChar, "SetSelectedAuctionAcceptance")
            .input("IDDID", IDDID)
            .input("APID", APID)
            .input("Status", Acceptance)
            .input("EmpCode", EmpCode)
            .execute("PRO-WMS_SET");
        // console.log(result)

        return NextResponse.json({ success: true, message: "Response Recorded" });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 }
        );
    }
}
