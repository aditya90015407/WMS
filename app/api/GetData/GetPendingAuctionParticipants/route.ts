import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";


export async function POST(req: NextRequest) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json("Invalid Request")
        }

        var EmpCode = "", EmpName = ""
        if (session) {
            EmpCode = session?.user?.id || "";
            EmpName = session?.user?.username || "";
        }

        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("Couldn't connect to Database");
        }


        const text = await req.text();
        const body = text ? JSON.parse(text) : {};
        const ID = body.ID;
        if (!ID) {
            return NextResponse.json(
                { success: false, message: "ID missing" },
                { status: 400 },
            );
        }
        // console.log(body)

        const result = await pool.request().input("FLAG", "GetPendingAuctionParticipantsByID")
            .input("ID", ID)
            .execute("PRO-WMS_GET");

        // console.log(result.recordset)
        return NextResponse.json({
            success: true,
            data: result.recordset ?? [],
        })
    } catch (err: any) {
        // console.log(err);
        return NextResponse.json(
            { success: false, message: err?.message || "Server Error" },
            { status: 500 },
        )
    }

}
