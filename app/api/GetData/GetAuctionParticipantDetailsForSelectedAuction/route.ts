import { getConnection } from "@/lib/dbConnect";
import { NextRequest,NextResponse } from "next/server";
import * as sql from "mssql";

export async function POST(req : Request)
{
    try{
       const body=req.json();
       const iddid=body?.IDDID??"";
       const vid=body?.VID??"";
       if(!iddid || !vid)
       {
        return NextResponse(
            {success: false, message: "Missing required field: IDDID & VID" },
        { status: 400});
       
    }

    const pool = await getConnection();
    if(!pool || !pool.connected)
    {
       throw new Error("Database Not Connected");
    }

    const result=await pool 
                .request()
                .input("FLAG",sql.NVarChar,"GetAuctionParticipantDetailsForSelectedAuction")
                .input("IDDID",sql.Int,iddid)
                .input("VID",sql.Int,vid)
                 .execute("PRO-WMS_GET");

    return NextResponse(
        {success:true,data:result}
    )

}
    catch(err : any)
    {
        return NextResponse
    }
}
