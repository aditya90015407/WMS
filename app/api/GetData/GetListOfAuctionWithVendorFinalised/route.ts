import { getConnection } from "@/lib/dbConnect";
import { NextRequest,NextResponse } from "next/server";
import * as sql from "mssql";

export async function GET() {

    try{
        const pool =await getConnection();
        if(!pool || !pool.connected)
        {
            throw new Error("Database Not Connected")
        }

        const result=await pool
                 .request()
                 .input("FLAG",sql.NVarChar,"GetListOfAuctionWithVendorFinalised")
                 .execute("PRO-WMS_GET");
        
        console.log(result)
        return NextResponse.json({
      success: true,
      data: result.recordset ?? [],
    });

    }
    catch(err : any)
    {
          return NextResponse.json(
      {
        success: false,
        message: err?.message || "Failed to load Form 10 disposal list",
      },
      { status: 500 },
    );
    }
}